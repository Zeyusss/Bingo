import { NextFunction, Request, Response } from "express";
import {
  NotFoundError,
  AuthError,
  ForbiddenError,
  ValidationError,
} from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { isValidImageBase64 } from "@packages/libs/validateImageBase64";
import { sendZodValidationError } from "@packages/libs/zodValidation";
import {
  createEventSchema,
  updateEventSchema,
} from "../schemas/event.schemas";

const DEFAULT_PROFILE_IMAGE =
  "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756";
const DEFAULT_COVER_IMAGE =
  "https://ik.imagekit.io/w7lwh7wre/cover-handmade.webp?updatedAt=175424311149";
import {
  fetchShopRevenueData,
  fetchShopStats,
  fetchShopRecentOrders,
  fetchShopDeviceUsage,
  fetchShopWorldActivity,
  fetchShopVisitorAnalytics,
  fetchShopTopSellingProducts,
} from "../utils/dashboardData";

//delete shop (soft delete)
export const deleteShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const { deletionDate } = req.body;

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });
    if (!seller || !seller.shop) {
      return next(new NotFoundError("Seller or Shop not found"));
    }


    let deletedAt: Date;
    if (deletionDate) {
      deletedAt = new Date(deletionDate);
      const now = new Date();
      if (deletedAt <= now) {
        return next(new ValidationError("Deletion date must be in the future"));
      }
    } else {
      deletedAt = new Date();
      deletedAt.setDate(deletedAt.getDate() + 28);
    }

    await prisma.$transaction([
      prisma.sellers.update({
        where: { id: sellerId },
        data: {
          deletedAt,
        },
      }),
      prisma.shops.update({
        where: { id: seller.shop.id },
        data: {
          deletedAt,
        },
      }),
      prisma.products.updateMany({
        where: { shopId: seller.shop.id, isDeleted: false },
        data: { isDeleted: true },
      }),
    ]);

    const deletionDateString = deletedAt.toLocaleDateString();
    return res.status(200).json({
      message: `Shop and seller marked for deletion. They will be permanently removed from the system on ${deletionDateString}.`,
      deletionDate: deletedAt.toISOString(),
    });
  } catch (error) {
    return next(error);
  }
};

//restore shop
export const restoreShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });
    if (!seller || !seller.shop) {
      return next(new NotFoundError("Seller or Shop not found"));
    }
    if (!seller.deletedAt) {
      return next(
        new ForbiddenError(
          "Shop is not scheduled for deletion. Nothing to restore."
        )
      );
    }

    const now = new Date();
    const deletedAt = new Date(seller.deletedAt);
    if (now > deletedAt) {
      return next(
        new ForbiddenError(
          "Cannot restore. The 28-day recovery period has expired."
        )
      );
    }

    await prisma.$transaction([
      prisma.sellers.update({
        where: { id: sellerId },
        data: {
          isDeleted: false, 
          deletedAt: null,  
        },
      }),
      prisma.shops.update({
        where: { id: seller.shop.id },
        data: {
          isDeleted: false, 
          deletedAt: null, 
        },
      }),
      prisma.products.updateMany({
        where: { shopId: seller.shop.id, isDeleted: true },
        data: { isDeleted: false },
      }),
    ]);
    return res.status(200).json({
      message: "Shop and seller have been successfully restored.",
    });
  } catch (error) {
    return next(error);
  }
};

// upload image
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file, fileName, folder } = req.body;

    if (!file || !fileName || !folder) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");

    if (!isValidImageBase64(file)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image file. Only JPEG, PNG, and WebP are allowed.",
      });
    }

    const uploadResponse = await imagekit.upload({
      file,
      fileName: sanitizedFileName,
      folder,
    });

    return res.status(201).json({
      success: true,
      file_id: uploadResponse.fileId,
      url: uploadResponse.url,
    });
  } catch (error) {
    console.error("Image Upload Failed:", error);
    return next(error);
  }
};

// update avatar & cover photo
export const updateProfilePictures = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { editType, imageUrl, fileId } = req.body;
    if (!editType || !imageUrl) {
      return next(new ValidationError("Missing required fields!"));
    }

    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can update profile picture."));
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId: req.seller.id },
      include: { avatar: true },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    if (editType === "cover") {
      const updatedShop = await prisma.shops.update({
        where: { sellerId: req.seller.id },
        data: { coverBanner: imageUrl },
        include: {
          avatar: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Cover photo updated successfully!",
        shop: {
          ...updatedShop,
          avatar: updatedShop.avatar?.url || DEFAULT_PROFILE_IMAGE,
          coverBanner: updatedShop.coverBanner || DEFAULT_COVER_IMAGE,
        },
      });
    } else {
      let imageRecord;

      if (shop.avatar) {
        imageRecord = await prisma.images.update({
          where: { id: shop.avatar.id },
          data: {
            url: imageUrl,
            file_id: fileId || shop.avatar.file_id,
          },
        });
      } else {
        imageRecord = await prisma.images.create({
          data: {
            url: imageUrl,
            file_id: fileId || `shop_avatar_${Date.now()}`,
            shopId: shop.id,
          },
        });

        await prisma.shops.update({
          where: { id: shop.id },
          data: { avatarId: imageRecord.id },
        });
      }

      const updatedShop = await prisma.shops.findUnique({
        where: { id: shop.id },
        include: {
          avatar: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Avatar updated successfully!",
        shop: {
          ...updatedShop,
          avatar: updatedShop?.avatar?.url || DEFAULT_PROFILE_IMAGE,
          coverBanner: updatedShop?.coverBanner || DEFAULT_COVER_IMAGE,
        },
      });
    }
  } catch (error) {
    return next(error);
  }
};

// edit seller profile
export const editSellerProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours } = req.body;

    if (!name || !bio || !address || !opening_hours) {
      return next(new ValidationError("Please fill all the fields"));
    }
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can edit thier profile."));
    }

    const existingShop = await prisma.shops.findUnique({
      where: { sellerId: req.seller.id },
    });

    if (!existingShop) {
      return next(new ValidationError("Shop not found for this seller."));
    }

    const updatedShop = await prisma.shops.update({
      where: { sellerId: req.seller.id },
      data: {
        name,
        bio,
        address,
        opening_hours,
      },
      include: {
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Shop profile updated successfully!",
      shop: {
        ...updatedShop,
        avatar: updatedShop.avatar?.url || DEFAULT_PROFILE_IMAGE,
        coverBanner: updatedShop.coverBanner || DEFAULT_COVER_IMAGE,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// get seller (publick preview)
export const getSellerInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid shop id format" });
    }

    const shop = await prisma.shops.findUnique({
      where: { id: req.params.id },
      include: {
        avatar: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: {
                  select: {
                    id: true,
                    url: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    const followersCount = await prisma.followers.count({
      where: { shopId: shop?.id },
    });

    const productsCount = await prisma.products.count({
      where: {
        shopId: shop?.id,
        starting_date: null,
      },
    });

    const eventsCount = await prisma.products.count({
      where: {
        shopId: shop?.id,
        starting_date: {
          not: null,
        },
      },
    });

    const shopWithDefaults = {
      ...shop,
      avatar: shop?.avatar?.url || DEFAULT_PROFILE_IMAGE,
      coverBanner: shop?.coverBanner || DEFAULT_COVER_IMAGE,
      reviews:
        shop?.reviews?.map((review: any) => ({
          ...review,
          user: {
            ...review.user,
            avatar: review.user?.avatar?.url || DEFAULT_PROFILE_IMAGE,
          },
        })) || [],
    };

    res.status(201).json({
      success: true,
      shop: shopWithDefaults,
      followersCount,
      productsCount,
      eventsCount,
    });
  } catch (error) {
    return next(error);
  }
};

// get seller products (public preview)
export const getSellerProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
const skip = (page - 1) * limit;

    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid shop id format" });
    }

    const [products, total] = await Promise.all([
       prisma.products.findMany({
         where: {
           isDeleted: { not: true },
           starting_date: null,
           shopId: req.params.id!,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          images: true,
          Shop: {
            include: {
              avatar: true,
              sellers: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.products.count({
        where: {
          isDeleted: { not: true },
          starting_date: null,
          shopId: req.params.id!,
        },
      }),
    ]);

    const productsWithDefaults = products.map((product: any) => ({
      ...product,
      Shop: {
        ...product.Shop,
        avatar: {
          url: product.Shop?.avatar?.url || DEFAULT_PROFILE_IMAGE,
        },
        coverBanner: product.Shop?.coverBanner || DEFAULT_COVER_IMAGE,
      },
    }));

    res.status(200).json({
      success: true,
      products: productsWithDefaults,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// get seller events (public preview)
export const getSellerEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const eventStatus = req.query.eventStatus as string;
const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
 

    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid shop id format" });
    }

    const whereClause: any = {
      isDeleted: { not: true },
      starting_date: {
        not: null,
      },
      shopId: req.params.id!,
    };


    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          short_description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          detailed_description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }


    const now = new Date();
    if (eventStatus && eventStatus !== 'all') {
      switch (eventStatus) {
        case 'active':
          whereClause.starting_date = {
            ...whereClause.starting_date,
            lte: now,
          };
          whereClause.ending_date = {
            gte: now,
          };
          break;
        case 'upcoming':
          whereClause.starting_date = {
            ...whereClause.starting_date,
            gt: now,
          };
          break;
        case 'ended':
          whereClause.ending_date = {
            lt: now,
          };
          break;
      }
    }


    if (dateFrom) {
      whereClause.starting_date = {
        ...whereClause.starting_date,
        gte: new Date(dateFrom),
      };
    }
    if (dateTo) {
      whereClause.ending_date = {
        ...whereClause.ending_date,
        lte: new Date(dateTo),
      };
    }


    const orderByClause: any = {};
    const validSortFields = ['title', 'regular_price', 'sale_price', 'stock', 'starting_date', 'ending_date', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderByClause[sortField] = sortOrder === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: orderByClause,
        include: {
          images: true,
          Shop: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.products.count({
        where: whereClause,
      }),
    ]);


    const shopId = req.params.id!;
    const now2 = new Date();

    const [activeEvents, upcomingEvents, endedEvents] = await Promise.all([
      prisma.products.count({
        where: {
          shopId,
          starting_date: { not: null, lte: now2 },
          ending_date: { not: null, gte: now2 },
        },
      }),
      prisma.products.count({
        where: {
          shopId,
          starting_date: { not: null, gt: now2 },
        },
      }),
      prisma.products.count({
        where: {
          shopId,
          ending_date: { not: null, lt: now2 },
        },
      }),
    ]);

    const totalEvents = activeEvents + upcomingEvents + endedEvents;

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      summary: {
        totalEvents,
        activeEvents,
        upcomingEvents,
        endedEvents,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Create event by updating product with starting_date and ending_date
export const createEvent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendZodValidationError(res, parsed.error);
    }
    const { productId, starting_date, ending_date, discount_percentage } =
      parsed.data;
    const startDate = starting_date;
    const endDate = ending_date;

    const shopId = req.seller?.shop?.id;
    if (!shopId) {
      return next(new AuthError("Shop not found for this seller"));
    }

    const existingProduct = await prisma.products.findFirst({
      where: {
        id: productId,
        shopId,
      },
    });

    if (!existingProduct) {
      const productExists = await prisma.products.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (productExists) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return next(new ValidationError("Product not found or doesn't belong to this seller"));
    }

    if (existingProduct.starting_date) {
      return next(new ValidationError("Product is already set as an event"));
    }

    const updateData: any = {
      starting_date: startDate,
      ending_date: endDate,
    };

    if (discount_percentage && discount_percentage > 0 && discount_percentage <= 100) {
      const discountedPrice = existingProduct.regular_price * (1 - discount_percentage / 100);
      updateData.sale_price = Math.round(discountedPrice * 100) / 100;
    }


    const updatedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: updateData,
      include: {
        images: true,
        Shop: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Event created successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return next(error);
  }
};

// Update event by modifying product dates and discount
export const updateEvent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = updateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendZodValidationError(res, parsed.error);
    }
    const { productId, starting_date, ending_date, discount_percentage } =
      parsed.data;
    const startDate = starting_date;
    const endDate = ending_date;

    const shopId = req.seller?.shop?.id;
    if (!shopId) {
      return next(new AuthError("Shop not found for this seller"));
    }

    const existingProduct = await prisma.products.findFirst({
      where: {
        id: productId,
        shopId,
      },
    });

    if (!existingProduct) {
      const productExists = await prisma.products.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (productExists) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return next(new ValidationError("Product not found or doesn't belong to this seller"));
    }

    if (!existingProduct.starting_date) {
      return next(new ValidationError("Product is not set as an event"));
    }

    const updateData: any = {
      starting_date: startDate,
      ending_date: endDate,
    };

    if (discount_percentage && discount_percentage > 0 && discount_percentage <= 100) {
      const originalPrice = existingProduct.regular_price;
      const discountedPrice = originalPrice * (1 - discount_percentage / 100);
      updateData.sale_price = Math.round(discountedPrice * 100) / 100;
    } else if (discount_percentage === 0) {
      updateData.sale_price = existingProduct.regular_price;
    }


    const updatedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: updateData,
      include: {
        images: true,
        Shop: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return next(error);
  }
};

// Remove event by clearing product dates (convert back to regular product)
export const removeEvent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return next(new ValidationError("Product ID is required!"));
    }

    const shopId = req.seller?.shop?.id;
    if (!shopId) {
      return next(new AuthError("Shop not found for this seller"));
    }

    const existingProduct = await prisma.products.findFirst({
      where: {
        id: productId,
        shopId,
      },
    });

    if (!existingProduct) {
      const productExists = await prisma.products.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (productExists) {
        return res.status(403).json({ message: "Forbidden" });
      }
      return next(new ValidationError("Product not found or doesn't belong to this seller"));
    }

    if (!existingProduct.starting_date) {
      return next(new ValidationError("Product is not set as an event"));
    }

    const updatedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        starting_date: null,
        ending_date: null,
        sale_price: existingProduct.regular_price,
      },
      include: {
        images: true,
        Shop: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Event removed successfully. Product converted back to regular product.",
      product: updatedProduct,
    });
  } catch (error) {
    return next(error);
  }
};

//follow a shop
export const followShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return next(new ValidationError("Shop id is required!"));
    }
    const existingFollow = await prisma.followers.findFirst({
      where: {
        userId: req.user?.id,
        shopId: shopId,
      },
    });
    if (existingFollow) {
      return res.status(200).json({
        success: true,
        message: "You are already following this shop.",
      });
    }
    const follow = await prisma.followers.create({
      data: {
        userId: req.user?.id,
        shopId: shopId,
      },
    });

    res.status(201).json({
      success: true,
      follow,
    });
  } catch (error) {
    return next(error);
  }
};

//unfollow a shop
export const unfollowShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return next(new ValidationError("Shop id is required!"));
    }

    const existingFollow = await prisma.followers.findFirst({
      where: {
        userId: req.user?.id,
        shopId: shopId,
      },
    });
    if (!existingFollow) {
      return res.status(404).json({
        success: false,
        message: "You are not following this shop",
      });
    }
    await prisma.followers.delete({
      where: {
        id: existingFollow.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully unfollowed the shop.",
    });
  } catch (error) {
    return next(error);
  }
};

//is following
export const isFollowing = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req.params.id;
    if (!shopId) {
      return next(new ValidationError("Shop id is required!"));
    }

    if (!/^[0-9a-fA-F]{24}$/.test(shopId)) {
      return res.status(400).json({ status: "error", message: "Invalid shop id format" });
    }

    const isFollowing = await prisma.followers.findFirst({
      where: {
        userId: req.user?.id,
        shopId: shopId,
      },
    });

    res.status(200).json({
      success: true,
      isFollowing,
    });
  } catch (error) {
    return next(error);
  }
};

// create review for shop
export const createShopReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId, rating, reviews } = req.body;

    if (!shopId || !rating || !reviews) {
      return next(
        new ValidationError("Shop ID, rating, and review are required!")
      );
    }

    if (!req.user?.id) {
      return next(
        new AuthError("Only authenticated users can create reviews.")
      );
    }

    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { sellerId: true },
    });

    if (!shop) {
      return next(new ValidationError("Shop not found."));
    }

    if (shop.sellerId === req.user.id) {
      return next(new ValidationError("You cannot review your own shop."));
    }

    const hasPurchased = await prisma.orders.findFirst({
      where: {
        shopId,
        userId: req.user.id,
        status: "Paid",
      },
    });

    if (!hasPurchased) {
      return next(
        new ValidationError("You can only review shops you have purchased from.")
      );
    }

    const existingReview = await prisma.shopReviws.findFirst({
      where: {
        userId: req.user.id,
        shopsId: shopId,
      },
    });

    if (existingReview) {
      return next(new ValidationError("You have already reviewed this shop."));
    }
    const review = await prisma.shopReviws.create({
      data: {
        userId: req.user.id,
        shopsId: shopId,
        rating: parseFloat(rating),
        reviews,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const agg = await prisma.shopReviws.aggregate({
      where: { shopsId: shopId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const averageRating = agg._count.rating > 0 ? (agg._avg.rating ?? 0) : 0;

    await prisma.shops.update({
      where: { id: shopId },
      data: { ratings: averageRating },
    });

    res.status(201).json({
      success: true,
      review,
      message: "Review created successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

// get shop reviews
export const getShopReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
const skip = (page - 1) * limit;

    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ status: "error", message: "Invalid shop id format" });
    }

    const [reviews, total] = await Promise.all([
       prisma.shopReviws.findMany({
         where: { shopsId: req.params.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.shopReviws.count({
        where: { shopsId: req.params.id },
      }),
    ]);

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// delete review
export const deleteShopReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { reviewId } = req.body;

    if (!reviewId) {
      return next(new ValidationError("Review ID is required!"));
    }

    if (!req.user?.id) {
      return next(
        new AuthError("Only authenticated users can delete reviews.")
      );
    }

    const review = await prisma.shopReviws.findFirst({
      where: {
        id: reviewId,
        userId: req.user.id,
      },
    });

    if (!review) {
      return next(
        new ValidationError(
          "Review not found or you don't have permission to delete it."
        )
      );
    }

    await prisma.shopReviws.delete({
      where: { id: reviewId },
    });

    const agg = await prisma.shopReviws.aggregate({
      where: { shopsId: review.shopsId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    const averageRating = agg._count.rating > 0 ? (agg._avg.rating ?? 0) : 0;

    await prisma.shops.update({
      where: { id: review.shopsId },
      data: { ratings: averageRating },
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

// get user's review for a shop
export const getUserReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req.params.id;

    if (!req.user?.id) {
      return res.status(200).json({
        success: true,
        userReview: null,
      });
    }

    const userReview = await prisma.shopReviws.findFirst({
      where: {
        shopsId: shopId,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      userReview,
    });
  } catch (error) {
    return next(error);
  }
};

// get shop analytics
export const getShopAnalytics = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can access shop analytics."));
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId: req.seller.id },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found."));
    }

    const analytics = await prisma.shopAnalytics.findUnique({
      where: { shopId: shop.id },
    });

    const followersCount = await prisma.followers.count({
      where: { shopId: shop.id },
    });

    const reviewsCount = await prisma.shopReviws.count({
      where: { shopsId: shop.id },
    });

    const productsCount = await prisma.products.count({
      where: { shopId: shop.id },
    });

    res.status(200).json({
      success: true,
      analytics: analytics || {
        totalVisitors: 0,
        countryStats: {},
        cityStats: {},
        deviceStats: {},
        lastVisitedAt: null,
      },
      stats: {
        followersCount,
        reviewsCount,
        productsCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Dashboard endpoints for seller analytics
export const getShopRevenue = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can access shop revenue data."));
    }

    const period = (req.query.period as "7d" | "30d" | "90d") || "30d";
    const data = await fetchShopRevenueData(req.seller.id, period);
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const getShopStats = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can access shop stats."));
    }

    const data = await fetchShopStats(req.seller.id);
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const getShopRecentOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can access shop recent orders."));
    }

    const limit = parseInt(req.query.limit as string) || 5;
    const data = await fetchShopRecentOrders(req.seller.id, limit);
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const getShopDeviceUsage = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can access shop device usage."));
    }

    const data = await fetchShopDeviceUsage(req.seller.id);
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const getShopWorldActivity = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next(
        new AuthError("Only sellers can access shop world activity.")
      );
    }

    const data = await fetchShopWorldActivity(req.seller.id);
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const getShopVisitorAnalytics = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can access visitor analytics."));
    }

    const data = await fetchShopVisitorAnalytics(req.seller.id);
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

export const getShopTopSellingProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.id) {
      return next(
        new AuthError("Only sellers can access top selling products.")
      );
    }

    const data = await fetchShopTopSellingProducts(req.seller.id);
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
};

// Track shop visitor
export const trackShopVisitor = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;
    const userId = req.user?.id;

    if (!shopId || !userId) {
      return next(new ValidationError("Shop ID and User ID are required"));
    }

    if (!/^[0-9a-fA-F]{24}$/.test(shopId)) {
      return res.status(400).json({ status: "error", message: "Invalid shopId format" });
    }

    const shop = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { id: true },
    });

    if (!shop) {
      return next(new NotFoundError("Shop not found"));
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    const existingVisitor = await prisma.uniqueShopVisitors.findUnique({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
    });

    const isNewVisitor = !existingVisitor;

    
    await prisma.uniqueShopVisitors.upsert({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
      update: {
        visitedAt: new Date(),
      },
      create: {
        shopId,
        userId,
        visitedAt: new Date(),
      },
    });

    await prisma.shopAnalytics.upsert({
      where: { shopId },
      update: {
        totalVisitors: isNewVisitor ? { increment: 1 } : undefined,
        lastVisitedAt: new Date(),
      },
      create: {
        shopId,
        totalVisitors: 1,
        lastVisitedAt: new Date(),
      },
    });

    res.status(200).json({ message: "Visitor tracked successfully" });
  } catch (error) {
    return next(error);
  }
};

// Identity Verification Controllers

// Get verification status
export const getVerificationStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        isVerified: true,
        verificationStatus: true,
        idFrontImage: true,
        idBackImage: true,
        personalImage: true,
        termsAccepted: true,
        termsAcceptedAt: true,
        verificationSubmittedAt: true,
        verificationReviewedAt: true,
        verificationNotes: true,
      },
    });

    if (!seller) {
      return next(new NotFoundError("Seller not found"));
    }

    res.status(200).json({
      success: true,
      verification: seller,
    });
  } catch (error) {
    return next(error);
  }
};

// Upload verification document
export const uploadVerificationDocument = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentType, imageData } = req.body;
    const sellerId = req.seller?.id;

    if (!documentType || !imageData) {
      return next(
        new ValidationError("Document type and image data are required")
      );
    }

    const validDocumentTypes = ["idFront", "idBack", "contract", "personal"];
    if (!validDocumentTypes.includes(documentType)) {
      return next(new ValidationError("Invalid document type"));
    }

    if (!isValidImageBase64(imageData)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image file. Only JPEG, PNG, and WebP are allowed.",
      });
    }

    const uploadResponse = await imagekit.upload({
      file: imageData,
      fileName: `verification_${documentType}_${sellerId}_${Date.now()}`,
      folder: "/seller_verification",
    });

    
    const updateData: any = {};
    switch (documentType) {
      case "idFront":
        updateData.idFrontImage = uploadResponse.url;
        break;
      case "idBack":
        updateData.idBackImage = uploadResponse.url;
        break;
      case "contract":
        updateData.contractSignedImage = uploadResponse.url;
        break;
      case "personal":
        updateData.personalImage = uploadResponse.url;
        break;
    }

    await prisma.sellers.update({
      where: { id: sellerId },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      imageUrl: uploadResponse.url,
    });
  } catch (error) {
    return next(error);
  }
};

// Accept terms and conditions
export const acceptTerms = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;
    const { confirmed } = req.body;

    if (!confirmed) {
      return next(new ValidationError("Terms confirmation is required"));
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      return next(new NotFoundError("Seller not found"));
    }

    await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Terms and conditions accepted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Submit verification for review
export const submitVerification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: {
        idFrontImage: true,
        idBackImage: true,
        personalImage: true,
        termsAccepted: true,
        verificationStatus: true,
      },
    });

    if (!seller) {
      return next(new NotFoundError("Seller not found"));
    }

    
    if (!seller.idFrontImage || !seller.idBackImage || !seller.personalImage) {
      return next(
        new ValidationError(
          "All verification documents (ID front, ID back, and personal photo) must be uploaded before submission"
        )
      );
    }

    if (!seller.termsAccepted) {
      return next(
        new ValidationError(
          "You must accept the terms and conditions before submitting verification"
        )
      );
    }

    
    if (seller.verificationStatus === "Pending") {
      return next(
        new ValidationError("Verification already submitted and pending review")
      );
    }

    if (seller.verificationStatus === "Approved") {
      return next(new ValidationError("Verification already approved"));
    }

    
    if (
      seller.verificationStatus !== "None" &&
      seller.verificationStatus !== "RequiresResubmission"
    ) {
      return next(
        new ValidationError(
          "Verification can only be submitted when status is None or RequiresResubmission"
        )
      );
    }

    await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        verificationStatus: "Pending",
        verificationSubmittedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Verification submitted successfully for review",
    });
  } catch (error) {
    return next(error);
  }
};

// Download contract template
export const downloadContract = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const contractContent = `
SELLER VERIFICATION CONTRACT

This contract serves as a verification document for seller identity on the Bingo-The-Awaken platform.

Seller Information:
- Email: ${req.seller?.email || "[EMAIL]"}
- Name: ${req.seller?.name || "[NAME]"}
- Country: ${req.seller?.country || "[COUNTRY]"}

By signing this document, I confirm that:
1. All information provided is accurate and truthful
2. I am authorized to sell products on this platform
3. I will comply with all platform terms and conditions
4. I understand that providing false information may result in account suspension

Signature: _____________________     Date: _____________________

Please sign this document, take a clear photo of the signed contract, and upload it as part of your verification process.

---
Bingo-The-Awaken Platform
Generated on: ${new Date().toLocaleDateString()}
    `;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="seller_verification_contract.txt"'
    );
    res.status(200).send(contractContent);
  } catch (error) {
    return next(error);
  }
};

// Get all notifications for seller with pagination and filtering
export const getSellerNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

   
    const whereClause: any = {
      receiverId: sellerId,
    };

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

   
    const [notifications, totalNotifications] = await Promise.all([
      prisma.notifications.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notifications.count({ where: whereClause }),
    ]);

    
    const unreadCount = await prisma.notifications.count({
      where: {
        receiverId: sellerId,
        status: "Unread",
      },
    });

    const totalPages = Math.ceil(totalNotifications / limit);

    res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        totalNotifications,
        unreadCount,
        readCount: totalNotifications - unreadCount,
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching seller notifications:", error);
    return next(error);
  }
};

// Mark a single notification as read
export const markSellerNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const { notificationId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(notificationId)) {
      return res.status(400).json({ status: "error", message: "Invalid notificationId format" });
    }

    const notification = await prisma.notifications.findFirst({
      where: {
        id: notificationId,
        receiverId: sellerId,
      },
    });

    if (!notification) {
      return next(new NotFoundError("Notification not found"));
    }

    await prisma.notifications.update({
      where: { id: notificationId },
      data: { status: "Read" },
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return next(error);
  }
};

// Mark all notifications as read for seller
export const markAllSellerNotificationsAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    await prisma.notifications.updateMany({
      where: {
        receiverId: sellerId,
        status: "Unread",
      },
      data: { status: "Read" },
    });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return next(error);
  }
};

// Delete a notification
export const deleteSellerNotification = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;
    const { notificationId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(notificationId)) {
      return res.status(400).json({ status: "error", message: "Invalid notificationId format" });
    }

    const notification = await prisma.notifications.findFirst({
      where: {
        id: notificationId,
        receiverId: sellerId,
      },
    });

    if (!notification) {
      return next(new NotFoundError("Notification not found"));
    }

    await prisma.notifications.delete({
      where: { id: notificationId },
    });

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return next(error);
  }
};

// Bulk delete read notifications
export const bulkDeleteReadNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    // Delete all read notifications for the seller
    const deletedNotifications = await prisma.notifications.deleteMany({
      where: {
        receiverId: sellerId,
        status: "Read",
      },
    });

    res.status(200).json({
      success: true,
      message: `${deletedNotifications.count} read notifications deleted successfully`,
      deletedCount: deletedNotifications.count,
    });
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    return next(error);
  }
};

// Legacy function for backward compatibility
export const sellerNotifications = getSellerNotifications;