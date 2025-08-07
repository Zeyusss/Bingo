import { NextFunction, Request, Response } from "express";
import {
  NotFoundError,
  AuthError,
  ForbiddenError,
  ValidationError,
} from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";


const DEFAULT_PROFILE_IMAGE = "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756";
const DEFAULT_COVER_IMAGE = "https://ik.imagekit.io/w7lwh7wre/cover-handmade.webp?updatedAt=175424311149";
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

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });
    if (!seller || !seller.shop) {
      return next(new NotFoundError("Seller or Shop not found"));
    }

    const deletedAt = new Date();
    deletedAt.setDate(deletedAt.getDate() + 28);

    await prisma.$transaction([
      prisma.sellers.update({
        where: { id: sellerId },
        data: {
          isDeleted: true,
          deletedAt,
        },
      }),
      prisma.shops.update({
        where: { id: seller.shop.id },
        data: {
          isDeleted: true,
          deletedAt,
        },
      }),
    ]);

    return res.status(200).json({
      message:
        "Shop and seller marked for deletion. They will be permanently removed from the system after 28 days unless the deletion is canceled.",
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
    if (!seller.isDeleted || !seller.deletedAt || !seller.shop.isDeleted) {
      return next(
        new ForbiddenError(
          "Shop and seller marked for deletion. They will be permanently removed from the system after 28 days unless the deletion is canceled."
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

    const uploadResponse = await imagekit.upload({
      file,
      fileName,
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
      reviews: shop?.reviews?.map((review: any) => ({
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
    next(error);
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
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: {
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
                  name: true
                }
              }
            }
          },
        },
      }),
      prisma.products.count({
        where: {
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
          url: product.Shop?.avatar?.url || DEFAULT_PROFILE_IMAGE
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
    next(error);
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

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: {
          starting_date: {
            not: null,
          },
          shopId: req.params.id!,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          images: true,
        },
      }),
      prisma.products.count({
        where: {
          starting_date: {
            not: null,
          },
          shopId: req.params.id!,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
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
    next(error);
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
    next(error);
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
    next(error);
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

    const allReviews = await prisma.shopReviws.findMany({
      where: { shopsId: shopId },
    });

    const averageRating =
      allReviews.reduce((sum, review) => sum + review.rating, 0) /
      allReviews.length;

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
    next(error);
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
    next(error);
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

    const allReviews = await prisma.shopReviws.findMany({
      where: { shopsId: review.shopsId },
    });

    const averageRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) /
          allReviews.length
        : 0;

    await prisma.shops.update({
      where: { id: review.shopsId },
      data: { ratings: averageRating },
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully!",
    });
  } catch (error) {
    next(error);
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
    next(error);
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
    const { shopId, userId } = req.body;

    if (!shopId || !userId) {
      return next(new ValidationError("Shop ID and User ID are required"));
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
        totalVisitors: {
          increment: 1,
        },
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
