import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import Stripe from "stripe";
import redis from "@packages/libs/redis";
import { NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../utils/send-email";
import { createLogger } from "@packages/utils/logs/structured-logger";
import {
  resolveCartFromDb,
  serializeCartForSessionCompare,
} from "../utils/resolve-cart-pricing";
import { resolveCouponFromDb } from "../utils/resolve-coupon";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});


const logger = createLogger('order-service');

// create payment intent
export const createPaymentIntent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, sellerStripeAccountId, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required." });
    }

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);
    if (!sessionData) {
      return res.status(404).json({ error: "Session not found or expired." });
    }

    const session = JSON.parse(sessionData);
    if (session.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const expectedTotal = session.totalAmount;
    if (
      typeof amount !== "number" ||
      Math.abs(amount - expectedTotal) > 0.01
    ) {
      return res.status(400).json({
        error: "Payment amount does not match checkout session.",
      });
    }

    const minimumAmount = 50;
    if (expectedTotal < minimumAmount) {
      return res.status(400).json({
        error: `Minimum order amount is ${minimumAmount} EGP. Current amount: ${expectedTotal} EGP`,
      });
    }

    const customerAmount = Math.round(expectedTotal * 100);
    const platformFee = Math.floor(customerAmount * 0.1);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: customerAmount,
      currency: "EGP",
      payment_method_types: ["card"],
      application_fee_amount: platformFee,
      transfer_data: {
        destination: sellerStripeAccountId,
      },
      metadata: {
        sessionId,
        userId: req.user.id,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return next(error);
  }
};

// create payment session
export const createPaymentSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cart, selectedAddressId, coupon } = req.body;
    const userId = req.user.id;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return next(new ValidationError("Cart is empty or invalid."));
    }

    const { cart: resolvedCart, subtotal } = await resolveCartFromDb(
      cart.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        personalizationData: item.personalizationData,
      })),
    );

    const couponCode =
      typeof coupon?.code === "string" ? coupon.code.trim() : "";
    const clientDiscountAmount = Number(coupon?.discountAmount ?? 0);
    const clientDiscountPercent = Number(coupon?.discountPercent ?? 0);
    const clientDiscountedProductId =
      (typeof coupon?.discountedProductId === "string" &&
        coupon.discountedProductId.trim()) ||
      (typeof coupon?.discountProductId === "string" &&
        coupon.discountProductId.trim()) ||
      "";
    const bodyDiscountAmount =
      req.body.discountAmount != null ? Number(req.body.discountAmount) : 0;

    const hasDiscountWithoutCode =
      !couponCode &&
      (clientDiscountAmount !== 0 ||
        clientDiscountPercent !== 0 ||
        Boolean(clientDiscountedProductId) ||
        bodyDiscountAmount !== 0);

    if (hasDiscountWithoutCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required when applying a discount.",
      });
    }

    let validatedCoupon = null;
    if (couponCode) {
      validatedCoupon = await resolveCouponFromDb(couponCode, resolvedCart);
    }

    const normailizedCart = serializeCartForSessionCompare(resolvedCart);

    const keys = await redis.keys("payment-session:*");
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = serializeCartForSessionCompare(session.cart);

          if (existingCart === normailizedCart) {
            return res.status(200).json({ sessionId: key.split(":")[1] });
          } else {
            await redis.del(key);
          }
        }
      }
    }
    const uniqueShopIds = [...new Set(resolvedCart.map((item) => item.shopId))];
    const shops = await prisma.shops.findMany({
      where: {
        id: { in: uniqueShopIds },
      },
      select: {
        id: true,
        sellerId: true,
        sellers: {
          select: {
            stripeId: true,
          },
        },
      },
    });

    const sellerData = shops.map((shop: any) => ({
      shopId: shop.id,
      sellerId: shop.sellerId,
      stripeAccountId: shop?.sellers?.stripeId,
    }));
    const totalAmount = validatedCoupon
      ? Math.max(
          0,
          Math.round((subtotal - validatedCoupon.discountAmount) * 100) / 100,
        )
      : subtotal;
    const sessionId = crypto.randomUUID();
    const sessionData = {
      userId,
      cart: resolvedCart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: validatedCoupon,
    };

    await redis.setex(
      `payment-session:${sessionId}`,
      600,
      JSON.stringify(sessionData)
    );
    return res.status(201).json({ sessionId });
  } catch (error) {
    return next(error);
  }
};

// verifying payment session
export const verifyingPaymentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required." });
    }
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);
    if (!sessionData) {
      return res.status(404).json({ error: "Session not found or expired." });
    }

    const session = JSON.parse(sessionData);

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

// create order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stripeSignature = req.headers["stripe-signature"];
    if (!stripeSignature) {
      return res.status(400).send("Missing Stripe signature");
    }

    const rowBody = (req as any).rawBody;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rowBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error("Webhook signature verification failed.", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const sessionId = paymentIntent.metadata.sessionId;
      const userId = paymentIntent.metadata.userId;

      const sessionKey = `payment-session:${sessionId}`;
      const sessionData = await redis.get(sessionKey);
      if (!sessionData) {
        console.warn("Session data expired or missing for", sessionId);
        return res
          .status(200)
          .send("No session found, skipping order creation");
      }

      const { cart, shippingAddressId, coupon } =
        JSON.parse(sessionData);

      const { cart: pricedCart } = await resolveCartFromDb(
        cart.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions,
          personalizationData: item.personalizationData,
        })),
      );

      const user = await prisma.users.findUnique({ where: { id: userId } });
      const name = user?.name!;
      const email = user?.email!;

      const shopGrouped = pricedCart.reduce((acc: any, item: any) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      }, {});

      for (const shopId in shopGrouped) {
        const orderItems = shopGrouped[shopId];

        let orderTotal = orderItems.reduce(
          (sum: number, p: any) => sum + p.quantity * p.sale_price,
          0
        );
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedProductId)
        ) {
          orderTotal = Math.max(0, orderTotal - (coupon.discountAmount || 0));
        }

        let shippingAddressSnapshot = null;
        if (shippingAddressId) {
          try {
            const addressRecord = await prisma.address.findUnique({
              where: { id: shippingAddressId },
            });
            if (addressRecord) {
              shippingAddressSnapshot = {
                name: addressRecord.name,
                phone: addressRecord.phone,
                street: addressRecord.street,
                city: addressRecord.city,
                zip: addressRecord.zip,
                country: addressRecord.country,
                label: addressRecord.label,
              };
            }
          } catch (error) {
            console.error("Failed to fetch address for snapshot:", error);
          }
        }

        const order = await prisma.orders.create({
          data: {
            userId,
            shopId,
            total: orderTotal,
            status: "Paid",
            deliveryStatus: "Ordered",
            shippingAddressId: shippingAddressId || null,
            shippingAddressSnapshot,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount || 0,
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.sale_price,
                selectedOptions: item.selectedOptions,
                personalizationData: item.personalizationData || null,
              })),
            },
          },
        });

        logger.info(`Order created successfully: ${order.id} for shop: ${shopId} with delivery status: ${order.deliveryStatus}`);

        for (const item of orderItems) {
          const { id: productId, quantity } = item;

          await prisma.products.update({
            where: { id: productId },
            data: {
              stock: { decrement: quantity },
              totalSales: { increment: quantity },
            },
          });
          await prisma.productAnalytics.upsert({
            where: { productId },
            create: {
              productId,
              shopId,
              purchases: quantity,
              lastViewedAt: new Date(),
            },
            update: {
              purchases: { increment: quantity },
            },
          });
          const existingAnalytics = await prisma.userAnalytics.findUnique({
            where: { userId },
          });
          const newAction = {
            productId,
            shopId,
            action: "purchase",
            timeStamp: Date.now(),
          };
          const currentActions = Array.isArray(existingAnalytics?.actions)
            ? (existingAnalytics.actions as Prisma.JsonArray)
            : [];

          if (existingAnalytics) {
            await prisma.userAnalytics.update({
              where: { userId },
              data: {
                lastVisited: new Date(),
                actions: [...currentActions, newAction],
              },
            });
          } else {
            await prisma.userAnalytics.create({
              data: {
                userId,
                lastVisited: new Date(),
                actions: [newAction],
              },
            });
          }
        }
      }

      
      const createdOrders = await prisma.orders.findMany({
        where: { 
          userId,
          createdAt: {
            gte: new Date(Date.now() - 60000) 
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      const orderId = createdOrders[0]?.id || sessionId;
      const orderDate = new Date().toLocaleDateString();
      const paymentMethod = "Credit Card";
      let shippingAddress = "N/A";
      if (shippingAddressId) {
        const addressRecord = await prisma.address.findUnique({
          where: { id: shippingAddressId },
        });
        if (addressRecord) {
          shippingAddress = `${addressRecord.name}, ${addressRecord.street}, ${addressRecord.city}, ${addressRecord.country}, ${addressRecord.zip}`;
        }
      }
      const couponCode = coupon?.code || null;
      const subtotal = pricedCart.reduce(
        (sum: number, item: any) => sum + item.sale_price * item.quantity,
        0
      );
      const discountAmount = coupon?.discountAmount || 0;
      const shippingFee = 0;
      const total = subtotal - discountAmount + shippingFee;
      const orderItemsForEmail = pricedCart.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.sale_price,
        selectedOptions: item.selectedOptions || {},
      }));
      const orderTrackingUrl = `${process.env.USER_UI_URL || 'http://localhost:3000'}/order/${orderId}`;

      await sendEmail(
        email,
        "Your Bingo Order Confirmation",
        "order-confirmation",
        {
          name,
          orderId,
          orderDate,
          paymentMethod,
          shippingAddress,
          couponCode,
          subtotal,
          discountAmount,
          shippingFee,
          total,
          orderItems: orderItemsForEmail,
          orderTrackingUrl,
        }
      );
      const createdShopIds = [
        ...new Set(pricedCart.map((item: any) => item.shopId)),
      ];
      const shopIds = createdShopIds as string[];
      
      const sellerShops = await prisma.shops.findMany({
        where: { id: { in: shopIds } },
        select: {
          id: true,
          sellerId: true,
          name: true,
        },
      });

     
      try {
        for (const shop of sellerShops) {
          const shopItems = cart.filter((item: any) => item.shopId === shop.id);
          const firstProduct = shopItems[0];
          const productTitle = firstProduct?.title || "new item";

         
          const shopOrder = createdOrders.find(order => order.shopId === shop.id);
          const shopOrderId = shopOrder?.id || orderId;
          
          await prisma.notifications.create({
            data: {
              title: "New Order Received",
              message: `A customer just ordered ${productTitle} from your shop.`,
              creatorId: userId,
              receiverId: shop.sellerId,
              redirect_link: `/order/${shopOrderId}`,
            },
          });
        }

      
        const adminUser = await prisma.users.findFirst({
          where: { role: "admin" },
          select: { id: true }
        });

        if (adminUser) {
          await prisma.notifications.create({
            data: {
              title: "Platform Order Alert",
              message: `A new order was placed by ${name}`,
              creatorId: userId,
              receiverId: adminUser.id,
              redirect_link: `/dashboard/orders`,
            },
          });
        }

        
        await prisma.notifications.create({
          data: {
            title: "Order Placed Successfully",
            message: `Your order has been placed successfully and is being processed. Order ID: ${orderId}`,
            creatorId: adminUser?.id || userId,
            receiverId: userId,
            redirect_link: `/order/${orderId}`,
          },
        });
      } catch (notificationError) {
        console.error("Error creating notifications:", notificationError);
      
      }

      await redis.del(sessionKey);
    }
  } catch (error) {

    return next(error);
  }
};

// get sellers orders
export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await prisma.shops.findUnique({
      where: {
        sellerId: req.seller.id,
      },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }


    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = (req.query.search as string || "").trim();
    const status = req.query.status as string || "all";
    const deliveryStatus = req.query.deliveryStatus as string || "all";
    const sortBy = req.query.sortBy as string || "createdAt";
    const sortOrder = req.query.sortOrder as string || "desc";
    const dateFrom = req.query.dateFrom as string || "";
    const dateTo = req.query.dateTo as string || "";

    const skip = (page - 1) * limit;


    const whereClause: any = {
      shopId: shop.id,
    };

    if (search) {
      const searchConditions: any[] = [];
      
     
      if (search.length >= 6 && /^[0-9a-fA-F]+$/.test(search)) {
        try {
          if (search.length <= 24) {
            searchConditions.push({
              id: {
                contains: search,
                mode: 'insensitive'
              }
            });
          }
        } catch (error) {
        }
      }
      
      searchConditions.push(
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      );
      
      if (searchConditions.length > 0) {
        whereClause.OR = searchConditions;
      }
    }

    if (status !== "all" && status) {
      const validStatuses = ["Paid", "Pending", "Cancelled"];
      if (validStatuses.includes(status)) {
        whereClause.status = status;
      }
    }

    if (deliveryStatus !== "all" && deliveryStatus) {
      const validDeliveryStatuses = ["Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];
      if (validDeliveryStatuses.includes(deliveryStatus)) {
        whereClause.deliveryStatus = deliveryStatus;
      }
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      
      if (dateFrom) {
        try {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0); 
          if (!isNaN(fromDate.getTime())) {
            whereClause.createdAt.gte = fromDate;
          }
        } catch (error) {
        }
      }
      
      if (dateTo) {
        try {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); 
          if (!isNaN(toDate.getTime())) {
            whereClause.createdAt.lte = toDate;
          }
        } catch (error) {
        }
      }
    }

    const orderBy: any = {};
    const validSortBy = ["createdAt", "total", "status", "deliveryStatus"];
    const validSortOrder = ["asc", "desc"];
    
    const safeSortBy = validSortBy.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = validSortOrder.includes(sortOrder) ? sortOrder : "desc";
    
    if (safeSortBy === "total") {
      orderBy.total = safeSortOrder;
    } else if (safeSortBy === "status") {
      orderBy.status = safeSortOrder;
    } else if (safeSortBy === "deliveryStatus") {
      orderBy.deliveryStatus = safeSortOrder;
    } else {
      orderBy.createdAt = safeSortOrder;
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: {
                select: {
                  url: true
                }
              },
            },
          },
          items: {
            select: {
              id: true,
              productId: true,
              quantity: true,
              price: true,
              selectedOptions: true,
              personalizationData: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.orders.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// get order details
export const getOrderDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
    
    
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
    
    if (!isValidObjectId) {
      return next(new NotFoundError("Invalid order ID format. Expected MongoDB ObjectId (24 characters)."));
    }
    
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        items: true,
      },
    });
    if (!order) {
      return next(new NotFoundError("Order not found with this id!"));
    }

    if (req.role === "seller") {
      const shop = await prisma.shops.findUnique({
        where: { sellerId: req.seller.id },
        select: { id: true },
      });
      if (!shop || order.shopId !== shop.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else if (req.role === "user") {
      if (order.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else if (req.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const [shippingAddress, coupon] = await Promise.all([
      order.shippingAddressId
        ? prisma.address.findUnique({ where: { id: order.shippingAddressId } })
        : Promise.resolve(null),
      order.couponCode
        ? prisma.discount_codes.findUnique({
            where: { discountCode: order.couponCode },
          })
        : Promise.resolve(null),
    ]);

    const finalShippingAddress =
      shippingAddress || order.shippingAddressSnapshot;

    const productIds = order.items.map((item: any) => item.productId);
    const products =
      productIds.length > 0
        ? await prisma.products.findMany({
            where: { id: { in: productIds } },
            select: { id: true, title: true, images: true },
          })
        : [];
    const productMap = new Map(products.map((p: any) => [p.id, p]));
    const items = order.items.map((item: any) => ({
      ...item,
      selectedOptions: item.selectedOptions,
      product: productMap.get(item.productId) || null,
    }));

    res.status(200).json({
      success: true,
      order: {
        ...order,
        items,
        shippingAddress: finalShippingAddress,
        couponCode: coupon,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// update order status
export const updateDeliveryStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    if (!orderId || !deliveryStatus) {
      return res
        .status(400)
        .json({ error: "Missing order ID or delivery status." });
    }

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);

    if (!isValidObjectId) {
      return next(new NotFoundError("Invalid order ID format"));
    }
    const allowedStatuses = [
      "Ordered",
      "Packed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];
    if (!allowedStatuses.includes(deliveryStatus)) {
      return next(new ValidationError("Invalid delivery status."));
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId: req.seller.id },
      select: { id: true },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    const existingOrder = await prisma.orders.findFirst({
      where: {
        id: orderId,
        shopId: shop.id,
      },
    });

    if (!existingOrder) {
      const orderExists = await prisma.orders.findUnique({
        where: { id: orderId },
        select: { id: true },
      });
      if (orderExists) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return next(new NotFoundError("Order not found!"));
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        deliveryStatus,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

// verify coupon code

export const verifyCouponCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { couponCode, cart } = req.body;

    if (!couponCode || !cart || cart.length === 0) {
      return next(new ValidationError("Coupon code and cart are required!"));
    }

    const { cart: resolvedCart } = await resolveCartFromDb(
      cart.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        personalizationData: item.personalizationData,
      })),
    );

    try {
      const validated = await resolveCouponFromDb(couponCode, resolvedCart);
      return res.status(200).json({
        valid: true,
        discount: validated.discount,
        discountAmount: validated.discountAmount.toFixed(2),
        discountedProductId: validated.discountedProductId,
        discountType: validated.discountType,
        message: "Discount applied to 1 eligible product",
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(200).json({
          valid: false,
          discount: 0,
          discountAmount: 0,
          message: err.message,
        });
      }
      throw err;
    }
  } catch (error) {
    return next(error);
  }
};

// get user orders
export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const ordersWithAddresses = await Promise.all(
      orders.map(async (order) => {
        let shippingAddress = null;
        if (order.shippingAddressId) {
          try {
            shippingAddress = await prisma.address.findUnique({
              where: { id: order.shippingAddressId },
            });
          } catch (error) {
            console.error(
              `Failed to fetch address for order ${order.id}:`,
              error
            );
          }
        }
        const finalShippingAddress =
          shippingAddress || order.shippingAddressSnapshot;
        return {
          ...order,
          shippingAddress: finalShippingAddress,
        };
      })
    );

    res.status(201).json({
      success: true,
      orders: ordersWithAddresses,
    });
  } catch (error) {
    return next(error);
  }
};

// get recent orders
export const getRecentOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          take: 1, 
          select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });


    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
        if (order.items.length > 0) {
          const product = await prisma.products.findUnique({
            where: { id: order.items[0].productId },
            select: { id: true, title: true, slug: true },
          });
          return {
            ...order,
            items: order.items.map((item, index) => 
              index === 0 ? { ...item, product } : item
            ),
          };
        }
        return order;
      })
    );

    res.json({ success: true, orders: ordersWithProducts });
  } catch (error) {
    return next(error);
  }
};

// get admin orders
export const getAdminOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        skip,
        take: limit,
        include: {
          user: true,
          shop: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.orders.count(),
    ]);
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      success: true,
      orders,
      currentPage: page,
      totalPages,
      total,
    });
  } catch (error) {
    return next(error);
  }
};

// get order by session ID
export const getOrderBySession = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.params.sessionId;
    
    if (!sessionId) {
      return next(new NotFoundError("Session ID is required"));
    }

   
    const directOrder = await prisma.orders.findFirst({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) 
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true,
        userId: true
      }
    });

    if (directOrder) {
      console.log(`Found recent order directly: ${directOrder.id}`);
      return res.status(200).json({
        success: true,
        orderId: directOrder.id,
        orderDetails: directOrder
      });
    }

    
    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);
    
    if (!sessionData) {
      console.log(`No session data found for key: ${sessionKey}`);
      return next(new NotFoundError("Session not found or expired"));
    }

    
    const parsedData = JSON.parse(sessionData);
    const userId = parsedData.userId || parsedData.user?.id;
    
    if (!userId) {
      console.log("Session data structure:", parsedData);
      return next(new NotFoundError("User ID not found in session"));
    }

    console.log(`Looking for orders for user ${userId} in last 30 minutes`);

   
    const recentOrder = await prisma.orders.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000)
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true
      }
    });

    if (!recentOrder) {
      return next(new NotFoundError("No recent order found for this session"));
    }

    res.status(200).json({
      success: true,
      orderId: recentOrder.id,
      orderDetails: recentOrder
    });

  } catch (error) {
    console.error("Error in getOrderBySession:", error);
    return next(error);
  }
};
