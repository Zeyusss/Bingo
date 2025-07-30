import { NextFunction, Request, Response } from "express";
import {
  fetchRevenueData,
  fetchDeviceUsage,
  fetchWorldActivity,
  fetchSystemStats,
  fetchResourceMonitor,
} from "../utils/dashboardData";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";
import { UserRole } from "@prisma/client";
import { Prisma } from "@prisma/client";

export async function getRevenue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await fetchRevenueData();
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getDeviceUsage(
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
) {
  try {
    const data = await fetchSystemStats();
    res.status(200).json(data);
  } catch (error) {
    return next(error);
  }
}

export async function getResourceMonitor(
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      prisma.products.findMany({
        where: {
          starting_date: null,
        },
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
          images: {
            select: { url: true },
            take: 1,
          },
          Shop: {
            select: { name: true },
          },
        },
      }),
      prisma.products.count({
        where: {
          starting_date: null,
        },
      }),
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
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [events, totalEvents] = await Promise.all([
      prisma.products.findMany({
        where: {
          starting_date: { not: null },
        },
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
      prisma.products.count({
        where: {
          starting_date: { not: null },
        },
      }),
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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { email, role } = req.body;

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

    res.status(201).json({
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
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
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
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { sellerId } = req.params;
    const { isBlocked } = req.body;

    const seller = await prisma.sellers.update({
      where: { id: sellerId },
      data: { isBlocked, blockedAt: isBlocked ? new Date() : null },
    });

    res.status(200).json({
      success: true,
      message: `Seller ${isBlocked ? "blocked" : "unblocked"} successfully`,
      seller,
    });
  } catch (error) {
    return next(error);
  }
};

// Delete seller
export const deleteSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.params;
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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
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
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { sellerId } = req.params;
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
        0
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
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { categoryName } = req.body;
    if (!categoryName || typeof categoryName !== "string") {
      return res.status(400).json({ error: "categoryName is required" });
    }
    const config = await prisma.site_config.findFirst();
    if (!config)
      return res.status(500).json({ error: "Site config not found" });
    if (config.categories.includes(categoryName)) {
      return res.status(400).json({ error: "Category already exists" });
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
  next: NextFunction
) => {
  try {
    const { categoryName, subcategoryName } = req.body;
    if (!categoryName || !subcategoryName) {
      return res
        .status(400)
        .json({ error: "categoryName and subcategoryName are required" });
    }
    const config = await prisma.site_config.findFirst();
    if (!config)
      return res.status(500).json({ error: "Site config not found" });
    const subCategories = {
      ...(config.subCategories as Record<string, string[]>),
    };
    if (!subCategories[categoryName]) {
      return res.status(400).json({ error: "Category does not exist" });
    }
    if (subCategories[categoryName].includes(subcategoryName)) {
      return res.status(400).json({ error: "Subcategory already exists" });
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
  next: NextFunction
) => {
  try {
    const { name } = req.params;
    const config = await prisma.site_config.findFirst();
    if (!config)
      return res.status(500).json({ error: "Site config not found" });
    if (!config.categories.includes(name)) {
      return res.status(404).json({ error: "Category not found" });
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
  next: NextFunction
) => {
  try {
    const { category, name } = req.params;
    const config = await prisma.site_config.findFirst();
    if (!config)
      return res.status(500).json({ error: "Site config not found" });
    const subCategories = {
      ...(config.subCategories as Record<string, string[]>),
    };
    if (!subCategories[category]) {
      return res.status(404).json({ error: "Category not found" });
    }
    if (!subCategories[category].includes(name)) {
      return res.status(404).json({ error: "Subcategory not found" });
    }
    subCategories[category] = subCategories[category].filter(
      (sub: string) => sub !== name
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
  next: NextFunction
) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "categories array is required" });
    }

    const config = await prisma.site_config.findFirst();
    if (!config)
      return res.status(500).json({ error: "Site config not found" });

    const existingCategories = config.categories;
    const isValid = categories.every((cat: string) =>
      existingCategories.includes(cat)
    );

    if (!isValid) {
      return res.status(400).json({ error: "Invalid category names provided" });
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
  next: NextFunction
) => {
  try {
    const { categoryName, subcategories } = req.body;
    if (!categoryName || !Array.isArray(subcategories)) {
      return res.status(400).json({
        error: "categoryName and subcategories array are required",
      });
    }

    const config = await prisma.site_config.findFirst();
    if (!config)
      return res.status(500).json({ error: "Site config not found" });

    const subCategories = {
      ...(config.subCategories as Record<string, string[]>),
    };

    if (!subCategories[categoryName]) {
      return res.status(404).json({ error: "Category not found" });
    }

    const existingSubcategories = subCategories[categoryName];
    const isValid = subcategories.every((sub: string) =>
      existingSubcategories.includes(sub)
    );

    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Invalid subcategory names provided" });
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
  next: NextFunction
) => {
  try {
    const { subcategoryName, fromCategory, toCategory } = req.body;

    if (!subcategoryName || !fromCategory || !toCategory) {
      return res.status(400).json({
        error: "subcategoryName, fromCategory, and toCategory are required",
      });
    }

    const config = await prisma.site_config.findFirst();
    if (!config)
      return res.status(500).json({ error: "Site config not found" });

    const subCategories = {
      ...(config.subCategories as Record<string, string[]>),
    };

    if (!subCategories[fromCategory]) {
      return res.status(404).json({ error: "Source category not found" });
    }

    if (!subCategories[toCategory]) {
      return res.status(404).json({ error: "Target category not found" });
    }

    if (!subCategories[fromCategory].includes(subcategoryName)) {
      return res
        .status(404)
        .json({ error: "Subcategory not found in source category" });
    }

    if (subCategories[toCategory].includes(subcategoryName)) {
      return res
        .status(400)
        .json({ error: "Subcategory already exists in target category" });
    }

    subCategories[fromCategory] = subCategories[fromCategory].filter(
      (sub: string) => sub !== subcategoryName
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
