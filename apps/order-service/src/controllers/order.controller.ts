import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import Stripe from "stripe";
import redis from "@packages/libs/redis";
import { NotFoundError, ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../utils/send-email";
import { sendLog } from "@packages/utils/logs/send-logs";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// create payment intent
export const createPaymentIntent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { amount, sellerStripeAccountId, sessionId } = req.body;
  const minimumAmount = 50; // EGP
  if (amount < minimumAmount) {
    return res.status(400).json({
      error: `Minimum order amount is ${minimumAmount} EGP. Current amount: ${amount} EGP`,
    });
  }

  const customerAmount = Math.round(amount * 100);
  const platformFee = Math.floor(customerAmount * 0.1);
  try {
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
    const normailizedCart = JSON.stringify(
      cart
        .map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          sale_price: item.sale_price,
          shopId: item.shopId,
          selectedOptions: item.selectedOptions || {},
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );

    const keys = await redis.keys("payment-session:*");
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const session = JSON.parse(data);
        if (session.userId === userId) {
          const existingCart = JSON.stringify(
            session.cart
              .map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
              }))
              .sort((a: any, b: any) => a.id.localeCompare(b.id))
          );

          if (existingCart === normailizedCart) {
            return res.status(200).json({ sessionId: key.split(":")[1] });
          } else {
            await redis.del(key);
          }
        }
      }
    }
    const uniqueShopIds = [...new Set(cart.map((item: any) => item.shopId))];
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
    const totalAmount = cart.reduce((total: number, item: any) => {
      return total + item.quantity * item.sale_price;
    }, 0);
    const sessionId = crypto.randomUUID();
    const sessionData = {
      userId,
      cart,
      sellers: sellerData,
      totalAmount,
      shippingAddressId: selectedAddressId || null,
      coupon: coupon || null,
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

      const { cart, totalAmount, shippingAddressId, coupon } =
        JSON.parse(sessionData);

      const user = await prisma.users.findUnique({ where: { id: userId } });
      const name = user?.name!;
      const email = user?.email!;

      const shopGrouped = cart.reduce((acc: any, item: any) => {
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
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          );
          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;
            orderTotal -= discount;
          }
        }

        // Fetch shipping address snapshot if shippingAddressId exists
        let shippingAddressSnapshot = null;
        if (shippingAddressId) {
          try {
            const addressRecord = await prisma.address.findUnique({
              where: { id: shippingAddressId },
            });
            if (addressRecord) {
              shippingAddressSnapshot = {
                name: addressRecord.name,
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
              })),
            },
          },
        });

        // Update product analytics and stock for this shop's items
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

      const orderId = sessionId;
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
      const subtotal = cart.reduce(
        (sum: number, item: any) => sum + item.sale_price * item.quantity,
        0
      );
      const discountAmount = coupon?.discountAmount || 0;
      const shippingFee = 0;
      const total = subtotal - discountAmount + shippingFee;
      const orderItemsForEmail = cart.map((item: any) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.sale_price,
        selectedOptions: item.selectedOptions || {},
      }));
      const orderTrackingUrl = `https://bingo.com/order/${sessionId}`;

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
      const createdShopIds = [...new Set(cart.map((item: any) => item.shopId))];
      const shopIds = createdShopIds as string[];
      const sellerShops = await prisma.shops.findMany({
        where: { id: { in: shopIds } },
        select: {
          id: true,
          sellerId: true,
          name: true,
        },
      });

      for (const shop of sellerShops) {
        const shopItems = cart.filter((item: any) => item.shopId === shop.id);
        const firstProduct = shopItems[0];
        const productTitle = firstProduct?.title || "new item";

        await prisma.notifications.create({
          data: {
            title: "New Order Recevied",
            message: `A customer just ordered ${productTitle} from your shop.`,
            creatorId: userId,
            receiverId: shop.sellerId,
            redirect_link: `https://bingo.com/order/${sessionId}`,
          },
        });
      }

      await prisma.notifications.create({
        data: {
          title: "Platform Order Alert",
          message: `A new order was placed by ${name}`,
          creatorId: userId,
          receiverId: "admin",
          redirect_link: `https://bingo.com/order/${sessionId}`,
        },
      });

      await redis.del(sessionKey);
    }
  } catch (error) {
    console.log(error);
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

    const orders = await prisma.orders.findMany({
      where: {
        shopId: shop?.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(201).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(error);
  }
};

// get order detaisl
export const getOrderDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id;
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

    // use shipping address snapshot if the address was deleted
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
  req: Request,
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

    const existingOrder = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
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

    const discount = await prisma.discount_codes.findUnique({
      where: { discountCode: couponCode },
    });

    if (!discount) {
      return next(new ValidationError("Coupon code isn't valid!"));
    }

    const matchingProduct = cart.find((item: any) =>
      item.discount_codes?.some((d: any) => d === discount.id)
    );

    if (!matchingProduct) {
      return res.status(200).json({
        valid: false,
        discount: 0,
        discountAmount: 0,
        message: "No matching product found in cart for this coupon",
      });
    }

    let discountAmount = 0;
    const price = matchingProduct.sale_price * matchingProduct.quantity;

    if (discount.discountType === "percentage") {
      discountAmount = (price * discount.discountValue) / 100;
    } else if (discount.discountType === "flat") {
      discountAmount = discount.discountValue;
    }

    discountAmount = Math.min(discountAmount, price);

    res.status(200).json({
      valid: true,
      discount: discount.discountValue,
      discountAmount: discountAmount.toFixed(2),
      discountedProductId: matchingProduct.id,
      discountType: discount.discountType,
      message: "Discount applied to 1 eligible product",
    });
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
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });
    res.json({ success: true, orders });
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
