import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";
import { sendApiError } from "@packages/error-handler/send-api-error";
import { imagekit } from "@packages/libs/imagekit";
import { Prisma } from "@prisma/client";
import {
  fetchRevenueData,
  fetchDeviceUsage,
  fetchWorldActivity,
  fetchSystemStats,
  fetchResourceMonitor,
} from "../utils/dashboardData";
import { sendEmail } from '../utils/sendMail';

export async function getRevenue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await fetchRevenueData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return next(error);
  }
}

export async function getDeviceUsage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await fetchDeviceUsage();
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getWorldActivity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await fetchWorldActivity();
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getSystemStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await fetchSystemStats();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching system stats:", error);
    return next(error);
  }
}

export async function getResourceMonitor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await fetchResourceMonitor();
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

// get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const showDeleted = req.query.showDeleted === "true";
    const where = showDeleted
      ? { isDeleted: true, starting_date: null }
      : { isDeleted: false, starting_date: null };

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          detailed_description: true,
          short_description: true,
          sale_price: true,
          regular_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          subCategory: true,
          isDeleted: true,
          tags: true,
          images: {
            select: { url: true },
            take: 1,
          },
          Shop: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({ where }),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);
    res.status(200).json({
      success: true,
      data: products,
      meta: {
        totalProducts,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//get all events
export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const showDeleted = req.query.showDeleted === "true";
    const where = showDeleted
      ? { isDeleted: true, starting_date: { not: null } }
      : { isDeleted: false, starting_date: { not: null } };

    const [events, totalEvents] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          stock: true,
          createdAt: true,
          ratings: true,
          category: true,
          isDeleted: true,
          starting_date: true,
          ending_date: true,
          images: {
            select: { url: true },
            take: 1,
          },
          Shop: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({ where }),
    ]);

    const totalPages = Math.ceil(totalEvents / limit);
    res.status(200).json({
      success: true,
      data: events,
      meta: {
        totalEvents,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//get all admins
export const getAllAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const admins = await prisma.users.findMany({
      where: {
        role: "admin",
      },
    });

    res.status(201).json({
      success: true,
      admins,
    });
  } catch (error) {
    return next(error);
  }
};

//add new admin
export const addNewAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, role } = req.body;

    if (!email) return next(new ValidationError("Email is required"));
    const VALID_ROLES = ["admin", "user", "seller"];
    if (!role || !VALID_ROLES.includes(role)) {
      return next(new ValidationError("Invalid role value"));
    }

    const isUser = await prisma.users.findUnique({ where: { email } });
    if (!isUser) {
      return next(new ValidationError("Something went wrong!"));
    }

    const updateRole = await prisma.users.update({
      where: { email },
      data: {
        role,
      },
    });

    res.status(200).json({
      success: true,
      updateRole,
    });
  } catch (error) {
    return next(error);
  }
};

// fetch all customizations
export const getAllCustomizations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();

    return res.status(200).json({
      categories: config?.categories || [],
      subCategories: config?.subCategories || {},
      logo: config?.logo || null,
      banner: config?.banner || null,
    });
  } catch (error) {
    return next(error);
  }
};

// get all users
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const showDeleted = req.query.showDeleted === "true";
    const where = showDeleted ? { isDeleted: true } : { isDeleted: false };

    const [users, totalUsers] = await Promise.all([
      prisma.users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          isDeleted: true,
          isBlocked: true,
          blockedAt: true,
          deletedAt: true,
        },
      }),
      prisma.users.count({ where }),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);
    res.status(200).json({
      success: true,
      data: users,
      meta: {
        totalUsers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// get all sellers
export const getAllSellers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const showDeleted = req.query.showDeleted === "true";
    const where = showDeleted ? { isDeleted: true } : { isDeleted: false };

    const [sellers, totalSellers] = await Promise.all([
      prisma.sellers.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          isDeleted: true,
          isBlocked: true,
          blockedAt: true,
          deletedAt: true,
          shop: {
            select: {
              name: true,
              avatar: true,
              address: true,
            },
          },
        },
      }),
      prisma.sellers.count({ where }),
    ]);

    const totalPages = Math.ceil(totalSellers / limit);
    res.status(200).json({
      success: true,
      data: sellers,
      meta: {
        totalSellers,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Block/Unblock user
export const blockUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    const user = await prisma.users.update({
      where: { id: userId },
      data: { isBlocked, blockedAt: isBlocked ? new Date() : null },
    });

    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid userId format" });
    }

    await prisma.users.update({
      where: { id: userId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    await prisma.orders.updateMany({
      where: { userId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    res
      .status(200)
      .json({ success: true, message: "User and orders soft deleted" });
  } catch (error) {
    return next(error);
  }
};

// Update user
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;

    const user = await prisma.users.update({
      where: { id: userId },
      data: { name, email, role },
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return next(error);
  }
};

// Restore soft-deleted user
export const restoreUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    await prisma.users.update({
      where: { id: userId },
      data: { isDeleted: false, deletedAt: null },
    });
    await prisma.orders.updateMany({
      where: { userId },
      data: { isDeleted: false, deletedAt: null },
    });
    res
      .status(200)
      .json({ success: true, message: "User and orders restored" });
  } catch (error) {
    return next(error);
  }
};

// Block/Unblock seller
export const blockSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(sellerId)) {
      return next(new ValidationError("Invalid seller ID format"));
    }
    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    if (!seller) {
      return next(new ValidationError("Seller not found"));
    }
    const updatedSeller = await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        isBlocked: !seller.isBlocked,
        blockedAt: !seller.isBlocked ? new Date() : null,
      },
    });
    res.status(200).json({
      success: true,
      message: `Seller ${updatedSeller.isBlocked ? "blocked" : "unblocked"} successfully`,
      seller: updatedSeller,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete seller
export const deleteSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(sellerId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid sellerId format" });
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }
    await prisma.sellers.update({
      where: { id: sellerId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    if (seller.shop) {
      await prisma.shops.update({
        where: { id: seller.shop.id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
      await prisma.products.updateMany({
        where: { shopId: seller.shop.id },
        data: { isDeleted: true, deletedAt: new Date() },
      });
    }
    res.status(200).json({
      success: true,
      message: "Seller, shop, and products soft deleted",
    });
  } catch (error) {
    return next(error);
  }
};

// Update seller
export const updateSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;
    const { name, email } = req.body;
    const seller = await prisma.sellers.update({
      where: { id: sellerId },
      data: { name, email },
    });
    res
      .status(200)
      .json({ success: true, message: "Seller updated successfully", seller });
  } catch (error) {
    return next(error);
  }
};

// Promote user to seller
export const promoteUserToSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid userId format" });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const existingSeller = await prisma.sellers.findUnique({
      where: { email: user.email },
    });
    if (existingSeller) {
      return res
        .status(400)
        .json({ success: false, message: "User is already a seller." });
    }

    const { phone_number, country } = req.body;
    if (!phone_number || !country) {
      return res.status(400).json({
        success: false,
        message: "phone_number and country are required to promote to seller",
      });
    }
    const seller = await prisma.sellers.create({
      data: {
        name: user.name,
        email: user.email,
        phone_number,
        country,
        password: user.password,
      },
    });
    await prisma.users.update({
      where: { id: userId },
      data: { isDeleted: true },
    });
    res
      .status(200)
      .json({ success: true, message: "User promoted to seller", seller });
  } catch (error) {
    return next(error);
  }
};

// Demote seller to user
export const demoteSellerToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(sellerId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid sellerId format" });
    }

    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }
    const existingUser = await prisma.users.findUnique({
      where: { email: seller.email },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    const user = await prisma.users.create({
      data: {
        name: seller.name,
        email: seller.email,
        password: seller.password,
        role: "user",
      },
    });
    await prisma.sellers.update({
      where: { id: sellerId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    res
      .status(200)
      .json({ success: true, message: "Seller demoted to user", user });
  } catch (error) {
    return next(error);
  }
};

// Restore soft-deleted seller
export const restoreSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;
    const seller = await prisma.sellers.update({
      where: { id: sellerId },
      data: { isDeleted: false, deletedAt: null },
      include: { shop: true },
    });
    if (seller.shop) {
      await prisma.shops.update({
        where: { id: seller.shop.id },
        data: { isDeleted: false, deletedAt: null },
      });
      await prisma.products.updateMany({
        where: { shopId: seller.shop.id },
        data: { isDeleted: false, deletedAt: null },
      });
    }
    res.status(200).json({
      success: true,
      message: "Seller, shop, and products restored",
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

// Get full user details (with orders)
export const getUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        orders: true,
      },
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

// Get full seller details (with shop and products)
export const getSellerDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(sellerId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid sellerId format" });
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: {
        shop: {
          include: {
            products: true,
            orders: true,
          },
        },
      },
    });
    if (!seller)
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });

    let totalShopSales = 0;
    let totalBuyerPurchases = 0;
    if (seller.shop && seller.shop.orders) {
      for (const order of seller.shop.orders) {
        if (!order.isDeleted && order.status === "Paid") {
          totalShopSales += order.total || 0;
          totalBuyerPurchases += 1;
        }
      }
    }

    let totalProductValue = 0;
    if (seller.shop && seller.shop.products) {
      for (const prod of seller.shop.products) {
        if (!prod.isDeleted) {
          totalProductValue += prod.sale_price || 0;
        }
      }
    }

    let totalPurchasesAnalytics = 0;
    if (
      seller.shop &&
      seller.shop.products &&
      seller.shop.products.length > 0
    ) {
      const productIds = seller.shop.products.map((p) => p.id);
      const analytics = await prisma.productAnalytics.findMany({
        where: { productId: { in: productIds } },
        select: { purchases: true },
      });
      totalPurchasesAnalytics = analytics.reduce(
        (sum, a) => sum + (a.purchases || 0),
        0,
      );
    }

    res.status(200).json({
      success: true,
      seller,
      totalShopSales,
      uniqueBuyersCount: totalBuyerPurchases,
      totalProductValue,
      totalPurchasesAnalytics,
    });
  } catch (error) {
    return next(error);
  }
};

// Promote seller to admin
export const promoteSellerToAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;
    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    if (!seller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller not found" });
    }
    const existingUser = await prisma.users.findUnique({
      where: { email: seller.email },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    const user = await prisma.users.create({
      data: {
        name: seller.name,
        email: seller.email,
        password: seller.password,
        role: "admin",
      },
    });
    await prisma.sellers.update({
      where: { id: sellerId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    res
      .status(200)
      .json({ success: true, message: "Seller promoted to admin", user });
  } catch (error) {
    return next(error);
  }
};

// CATEGORY & SUBCATEGORY
export const getConfig = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.site_config.findFirst();
    return res.status(200).json({
      categories: config?.categories || [],
      subCategories: config?.subCategories || {},
    });
  } catch (error) {
    return next(error);
  }
};

export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryName } = req.body;
    if (!categoryName || typeof categoryName !== "string") {
      return sendApiError(res, 400, "categoryName is required");
    }
    const config = await prisma.site_config.findFirst();
    if (!config) return sendApiError(res, 500, "Site config not found");
    if (config.categories.includes(categoryName)) {
      return sendApiError(res, 400, "Category already exists");
    }
    const updated = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        categories: { set: [...config.categories, categoryName] },
        subCategories: {
          ...(config.subCategories as Prisma.JsonObject),
          [categoryName]: [],
        },
      },
    });
    return res
      .status(201)
      .json({ success: true, categories: updated.categories });
  } catch (error) {
    return next(error);
  }
};

export const addSubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryName, subcategoryName } = req.body;
    if (!categoryName || !subcategoryName) {
      return sendApiError(
        res,
        400,
        "categoryName and subcategoryName are required",
      );
    }
    const config = await prisma.site_config.findFirst();
    if (!config) return sendApiError(res, 500, "Site config not found");
    const subCategories = {
      ...(config.subCategories as Record<string, string[]>),
    };
    if (!subCategories[categoryName]) {
      return sendApiError(res, 400, "Category does not exist");
    }
    if (subCategories[categoryName].includes(subcategoryName)) {
      return sendApiError(res, 400, "Subcategory already exists");
    }
    subCategories[categoryName] = [
      ...subCategories[categoryName],
      subcategoryName,
    ];
    const updated = await prisma.site_config.update({
      where: { id: config.id },
      data: { subCategories: subCategories as Prisma.JsonObject },
    });
    return res
      .status(201)
      .json({ success: true, subCategories: updated.subCategories });
  } catch (error) {
    return next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name } = req.params;
    const config = await prisma.site_config.findFirst();
    if (!config) return sendApiError(res, 500, "Site config not found");
    if (!config.categories.includes(name)) {
      return sendApiError(res, 404, "Category not found");
    }
    const newCategories = config.categories.filter((cat) => cat !== name);
    const subCategories = {
      ...(config.subCategories as Record<string, string[]>),
    };
    delete subCategories[name];
    const updated = await prisma.site_config.update({
      where: { id: config.id },
      data: {
        categories: { set: newCategories },
        subCategories: subCategories as Prisma.JsonObject,
      },
    });
    return res
      .status(200)
      .json({ success: true, categories: updated.categories });
  } catch (error) {
    return next(error);
  }
};

export const deleteSubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { category, name } = req.params;
    const config = await prisma.site_config.findFirst();
    if (!config) return sendApiError(res, 500, "Site config not found");
    const subCategories = {
      ...(config.subCategories as Record<string, string[]>),
    };
    if (!subCategories[category]) {
      return sendApiError(res, 404, "Category not found");
    }
    if (!subCategories[category].includes(name)) {
      return sendApiError(res, 404, "Subcategory not found");
    }
    subCategories[category] = subCategories[category].filter(
      (sub: string) => sub !== name,
    );
    const updated = await prisma.site_config.update({
      where: { id: config.id },
      data: { subCategories: subCategories as Prisma.JsonObject },
    });
    return res
      .status(200)
      .json({ success: true, subCategories: updated.subCategories });
  } catch (error) {
    return next(error);
  }
};

// Reorder categories
export const reorderCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return sendApiError(res, 400, "categories array is required");
    }

    const config = await prisma.site_config.findFirst();
    if (!config) return sendApiError(res, 500, "Site config not found");

    const existingCategories = config.categories;
    const isValid = categories.every((cat: string) =>
      existingCategories.includes(cat),
    );

    if (!isValid) {
      return sendApiError(res, 400, "Invalid category names provided");
    }

    const updated = await prisma.site_config.update({
      where: { id: config.id },
      data: { categories: { set: categories } },
    });

    return res.status(200).json({
      success: true,
      message: "Categories reordered successfully",
      categories: updated.categories,
    });
  } catch (error) {
    return next(error);
  }
};

// Reorder subcategories within a category
export const reorderSubcategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryName, subcategories } = req.body;
    if (!categoryName || !Array.isArray(subcategories)) {
      return sendApiError(
        res,
        400,
        "categoryName and subcategories array are required",
      );
    }

    const config = await prisma.site_config.findFirst();
    if (!config) return sendApiError(res, 500, "Site config not found");

    const subCategories = {
      ...(config.subCategories as Record<string, string[]>),
    };

    if (!subCategories[categoryName]) {
      return sendApiError(res, 404, "Category not found");
    }

    const existingSubcategories = subCategories[categoryName];
    const isValid = subcategories.every((sub: string) =>
      existingSubcategories.includes(sub),
    );

    if (!isValid) {
      return sendApiError(res, 400, "Invalid subcategory names provided");
    }

    subCategories[categoryName] = subcategories;

    const updated = await prisma.site_config.update({
      where: { id: config.id },
      data: { subCategories: subCategories as Prisma.JsonObject },
    });

    return res.status(200).json({
      success: true,
      message: "Subcategories reordered successfully",
      subCategories: updated.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// Move subcategory from one category to another
export const moveSubcategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { subcategoryName, fromCategory, toCategory } = req.body;

    if (!subcategoryName || !fromCategory || !toCategory) {
      return sendApiError(
        res,
        400,
        "subcategoryName, fromCategory, and toCategory are required",
      );
    }

    const config = await prisma.site_config.findFirst();
    if (!config) return sendApiError(res, 500, "Site config not found");

    const subCategories = {
      ...(config.subCategories as Record<string, string[]>),
    };

    if (!subCategories[fromCategory]) {
      return sendApiError(res, 404, "Source category not found");
    }

    if (!subCategories[toCategory]) {
      return sendApiError(res, 404, "Target category not found");
    }

    if (!subCategories[fromCategory].includes(subcategoryName)) {
      return sendApiError(res, 404, "Subcategory not found in source category");
    }

    if (subCategories[toCategory].includes(subcategoryName)) {
      return sendApiError(
        res,
        400,
        "Subcategory already exists in target category",
      );
    }

    subCategories[fromCategory] = subCategories[fromCategory].filter(
      (sub: string) => sub !== subcategoryName,
    );

    subCategories[toCategory] = [...subCategories[toCategory], subcategoryName];

    const updated = await prisma.site_config.update({
      where: { id: config.id },
      data: { subCategories: subCategories as Prisma.JsonObject },
    });

    return res.status(200).json({
      success: true,
      message: "Subcategory moved successfully",
      subCategories: updated.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// Verification Management Controllers

// Get pending verifications
export const getPendingVerifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const pendingVerifications = await prisma.sellers.findMany({
      where: {
        OR: [
          { verificationStatus: "Pending" },
          { verificationStatus: "RequiresResubmission" },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        country: true,
        termsAccepted: true,
        termsAcceptedAt: true,
        verificationSubmittedAt: true,
        verificationStatus: true,
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        verificationSubmittedAt: "asc",
      },
      skip,
      take: Number(limit),
    });

    const totalCount = await prisma.sellers.count({
      where: {
        OR: [
          { verificationStatus: "Pending" },
          { verificationStatus: "RequiresResubmission" },
        ],
      },
    });

    res.status(200).json({
      success: true,
      verifications: pendingVerifications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        hasMore: skip + pendingVerifications.length < totalCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get verification details for a specific seller
export const getVerificationDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        country: true,
        verificationStatus: true,
        idFrontImage: true,
        idBackImage: true,
        personalImage: true,
        termsAccepted: true,
        termsAcceptedAt: true,
        verificationSubmittedAt: true,
        verificationReviewedAt: true,
        verificationNotes: true,
        createdAt: true,
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.status(200).json({
      success: true,
      verification: seller,
    });
  } catch (error) {
    return next(error);
  }
};

// Review verification (approve/reject)
export const reviewVerification = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.params;
    const { action, notes } = req.body;
    const adminId = req.user?.id;

    if (
      !action ||
      !["approve", "reject", "require_resubmission"].includes(action)
    ) {
      return next(
        new ValidationError(
          "Invalid action. Must be 'approve', 'reject', or 'require_resubmission'",
        ),
      );
    }

    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        verificationStatus: true,
        termsAccepted: true,
        name: true,
        email: true,
      },
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.verificationStatus !== "Pending") {
      return next(new ValidationError("Verification is not pending review"));
    }

    if (action === "approve" && !seller.termsAccepted) {
      return next(
        new ValidationError(
          "Cannot approve verification: Seller has not accepted terms and conditions",
        ),
      );
    }

    let newStatus: "Approved" | "Rejected" | "RequiresResubmission";
    let isVerified = false;

    switch (action) {
      case "approve":
        newStatus = "Approved";
        isVerified = true;
        break;
      case "reject":
        newStatus = "Rejected";
        break;
      case "require_resubmission":
        newStatus = "RequiresResubmission";
        break;
      default:
        return next(
          new ValidationError(
            "Invalid action. Must be 'approve', 'reject', or 'require_resubmission'",
          ),
        );
    }

    await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        verificationStatus: newStatus,
        isVerified,
        verificationReviewedAt: new Date(),
        verificationNotes: notes || null,
        adminReviewerId: adminId,
      },
    });

    await sendEmail(seller.email, 'Seller Verification Update', 'seller-verification-result-mail', { name: seller.name, status: newStatus, notes: notes || '' });

    res.status(200).json({
      success: true,
      message: `Verification ${action}d successfully`,
      status: newStatus,
    });
  } catch (error) {
    return next(error);
  }
};

// Get verification statistics for admin dashboard
export const getVerificationStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [
      totalSellers,
      pendingVerifications,
      approvedVerifications,
      rejectedVerifications,
      requiresResubmission,
      sellersWithTermsAccepted,
      sellersWithoutTerms,
    ] = await Promise.all([
      prisma.sellers.count(),

      prisma.sellers.count({
        where: { verificationStatus: "Pending" },
      }),

      prisma.sellers.count({
        where: { verificationStatus: "Approved" },
      }),

      prisma.sellers.count({
        where: { verificationStatus: "Rejected" },
      }),

      prisma.sellers.count({
        where: { verificationStatus: "RequiresResubmission" },
      }),

      prisma.sellers.count({
        where: { termsAccepted: true },
      }),

      prisma.sellers.count({
        where: { termsAccepted: false },
      }),
    ]);

    const verificationRate =
      totalSellers > 0 ? (approvedVerifications / totalSellers) * 100 : 0;
    const termsAcceptanceRate =
      totalSellers > 0 ? (sellersWithTermsAccepted / totalSellers) * 100 : 0;

    res.status(200).json({
      success: true,
      stats: {
        total: {
          sellers: totalSellers,
          pending: pendingVerifications,
          approved: approvedVerifications,
          rejected: rejectedVerifications,
          requiresResubmission: requiresResubmission,
        },
        terms: {
          accepted: sellersWithTermsAccepted,
          notAccepted: sellersWithoutTerms,
          acceptanceRate: Math.round(termsAcceptanceRate * 100) / 100,
        },
        rates: {
          verificationRate: Math.round(verificationRate * 100) / 100,
          termsAcceptanceRate: Math.round(termsAcceptanceRate * 100) / 100,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Get all verifications history (for admin dashboard with filtering)
export const getVerificationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page = 1, limit = 10, status, termsAccepted, search } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    if (status && status !== "all") {
      whereClause.verificationStatus = status;
    }

    if (termsAccepted !== undefined) {
      whereClause.termsAccepted = termsAccepted === "true";
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const [verifications, totalCount] = await Promise.all([
      prisma.sellers.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          country: true,
          verificationStatus: true,
          termsAccepted: true,
          termsAcceptedAt: true,
          verificationSubmittedAt: true,
          verificationReviewedAt: true,
          verificationNotes: true,
          isVerified: true,
          createdAt: true,
          shop: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          verificationReviewedAt: "desc",
        },
        skip,
        take: Number(limit),
      }),

      prisma.sellers.count({
        where: whereClause,
      }),
    ]);

    res.status(200).json({
      success: true,
      verifications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalCount,
        hasMore: skip + verifications.length < totalCount,
      },
      filters: {
        status: status || "all",
        termsAccepted: termsAccepted || "all",
        search: search || "",
      },
    });
  } catch (error) {
    return next(error);
  }
};

//get all notifications
export const getAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    const adminUsers = await prisma.users.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    const adminIds = adminUsers.map((admin) => admin.id);

    if (adminIds.length > 0) {
      whereClause.receiverId = { in: adminIds };
    } else {
      return res.status(200).json({
        success: true,
        data: [],
        meta: {
          totalNotifications: 0,
          currentPage: page,
          totalPages: 0,
          unreadCount: 0,
        },
      });
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      prisma.notifications.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          message: true,
          status: true,
          redirect_link: true,
          createdAt: true,
          creatorId: true,
        },
      }),
      prisma.notifications.count({ where: whereClause }),
      prisma.notifications.count({
        where: {
          ...whereClause,
          status: "Unread",
        },
      }),
    ]);

    const totalPages = Math.ceil(totalNotifications / limit);

    res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        totalNotifications,
        currentPage: page,
        totalPages,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return next(error);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { notificationId } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(notificationId)) {
      return next(new ValidationError("Invalid notification ID format"));
    }
    const adminId = req.user?.id;
    const existing = await prisma.notifications.findUnique({
      where: { id: notificationId },
    });
    if (!existing) {
      return next(new ValidationError("Notification not found"));
    }
    if (existing.receiverId !== adminId) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }
    const notification = await prisma.notifications.update({
      where: { id: notificationId },
      data: { status: "Read" },
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
  } catch (error) {
    return next(error);
  }
};

// Delete notification (ADMIN ONLY)
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { notificationId } = req.params;

    await prisma.notifications.delete({
      where: { id: notificationId },
    });

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Mark all notifications as read (ADMIN ONLY)
export const markAllNotificationsAsRead = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    await prisma.notifications.updateMany({
      where: {
        receiverId: req.user.id,
        status: "Unread",
      },
      data: { status: "Read" },
    });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return next(error);
  }
};

// get all users notification
export const getUserNotifications = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      receiverId: req.user.id,
    };

    if (status && status !== "all") {
      whereClause.status = status;
    }

    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      prisma.notifications.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          message: true,
          status: true,
          redirect_link: true,
          createdAt: true,
          creatorId: true,
        },
      }),
      prisma.notifications.count({ where: whereClause }),
      prisma.notifications.count({
        where: {
          receiverId: req.user.id,
          status: "Unread",
        },
      }),
    ]);

    const totalPages = Math.ceil(totalNotifications / limit);

    res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        totalNotifications,
        currentPage: page,
        totalPages,
        unreadCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Mark user notification as read
export const markUserNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await prisma.notifications.update({
      where: {
        id: id,
        receiverId: req.user.id,
      },
      data: {
        status: "Read",
      },
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    return next(error);
  }
};

// Delete user notification
export const deleteUserNotification = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    await prisma.notifications.delete({
      where: {
        id: id,
        receiverId: req.user.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    return next(error);
  }
};

// Mark all user notifications as read
export const markAllUserNotificationsAsRead = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    await prisma.notifications.updateMany({
      where: {
        receiverId: req.user.id,
        status: "Unread",
      },
      data: {
        status: "Read",
      },
    });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return next(error);
  }
};

// Delete all read user notifications
export const deleteAllReadUserNotifications = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    await prisma.notifications.deleteMany({
      where: {
        receiverId: req.user.id,
        status: "Read",
      },
    });

    res.status(200).json({
      success: true,
      message: "All read notifications deleted",
    });
  } catch (error) {
    return next(error);
  }
};

// Delete all read admin notifications (ADMIN ONLY)
export const deleteAllReadAdminNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminUsers = await prisma.users.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    const adminIds = adminUsers.map((admin) => admin.id);

    if (adminIds.length > 0) {
      await prisma.notifications.deleteMany({
        where: {
          receiverId: { in: adminIds },
          status: "Read",
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "All read admin notifications deleted",
    });
  } catch (error) {
    console.error("Error deleting read admin notifications:", error);
    return next(error);
  }
};

// SLIDER MANAGEMENT CONTROLLERS

// Get all sliders
export const getAllSliders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sliders = await prisma.sliders.findMany({
      orderBy: { position: "asc" },
    });

    // If no sliders exist, create some sample data
    if (sliders.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    } else {
      res.status(200).json({
        success: true,
        data: sliders,
      });
    }
  } catch (error) {
    return next(error);
  }
};

// Create new slider
export const createSlider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      isActive,
      startDate,
      endDate,
      textColor,
      textPosition,
      overlayOpacity,
      buttonText,
      buttonColor,
      buttonUrl,
      autoplaySpeed,
    } = req.body;

    if (!title || !imageUrl) {
      return next(new ValidationError("Title and image URL are required"));
    }

    // Get the highest position to add new slider at the end
    const lastSlider = await prisma.sliders.findFirst({
      orderBy: { position: "desc" },
    });

    const newPosition = lastSlider ? lastSlider.position + 1 : 0;

    const slider = await prisma.sliders.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        linkUrl: linkUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        textColor: textColor || "#ffffff",
        textPosition: textPosition || "left",
        overlayOpacity: overlayOpacity !== undefined ? overlayOpacity : 0.3,
        buttonText: buttonText || "Learn More",
        buttonColor: buttonColor || "#000000",
        buttonUrl: buttonUrl || null,
        autoplaySpeed: autoplaySpeed || 6000,
        position: newPosition,
      },
    });

    res.status(201).json({
      success: true,
      message: "Slider created successfully",
      data: slider,
    });
  } catch (error) {
    return next(error);
  }
};

// Update slider
export const updateSlider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sliderId } = req.params;
    const {
      title,
      description,
      imageUrl,
      linkUrl,
      isActive,
      startDate,
      endDate,
      textColor,
      textPosition,
      overlayOpacity,
      buttonText,
      buttonColor,
      buttonUrl,
      autoplaySpeed,
    } = req.body;

    if (!title || !imageUrl) {
      return next(new ValidationError("Title and image URL are required"));
    }

    const slider = await prisma.sliders.update({
      where: { id: sliderId },
      data: {
        title,
        description: description || null,
        imageUrl,
        linkUrl: linkUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        textColor: textColor || "#ffffff",
        textPosition: textPosition || "left",
        overlayOpacity: overlayOpacity !== undefined ? overlayOpacity : 0.3,
        buttonText: buttonText || "Learn More",
        buttonColor: buttonColor || "#000000",
        buttonUrl: buttonUrl || null,
        autoplaySpeed: autoplaySpeed || 6000,
      },
    });

    res.status(200).json({
      success: true,
      message: "Slider updated successfully",
      data: slider,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete slider
export const deleteSlider = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sliderId } = req.params;

    const slider = await prisma.sliders.findUnique({
      where: { id: sliderId },
    });

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    await prisma.sliders.delete({
      where: { id: sliderId },
    });

    // Reorder remaining sliders to fill the gap
    const remainingSliders = await prisma.sliders.findMany({
      where: { position: { gt: slider.position } },
      orderBy: { position: "asc" },
    });

    for (let i = 0; i < remainingSliders.length; i++) {
      await prisma.sliders.update({
        where: { id: remainingSliders[i].id },
        data: { position: slider.position + i },
      });
    }

    res.status(200).json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// Reorder sliders
export const reorderSliders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sliderIds } = req.body;

    if (!Array.isArray(sliderIds)) {
      return next(new ValidationError("sliderIds array is required"));
    }

    // Update positions based on the new order
    for (let i = 0; i < sliderIds.length; i++) {
      await prisma.sliders.update({
        where: { id: sliderIds[i] },
        data: { position: i },
      });
    }

    const updatedSliders = await prisma.sliders.findMany({
      orderBy: { position: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Sliders reordered successfully",
      data: updatedSliders,
    });
  } catch (error) {
    return next(error);
  }
};

// Upload slider image
export const uploadSliderImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { file, fileName, folder } = req.body;

    if (!file) {
      return next(new ValidationError("No image file provided"));
    }

    // Upload to ImageKit using base64
    const uploadResponse = await imagekit.upload({
      file: file,
      fileName: fileName || `slider_${Date.now()}`,
      folder: folder || "/sliders",
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });
  } catch (error) {
    return next(error);
  }
};
