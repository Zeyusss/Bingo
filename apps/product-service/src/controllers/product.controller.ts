import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagekit";
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

const DEFAULT_PROFILE_IMAGE =
  "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756";
const DEFAULT_COVER_IMAGE =
  "https://ik.imagekit.io/w7lwh7wre/cover-handmade.webp?updatedAt=175424311149";

//get product category
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();
    if (!config) {
      return res.status(404).json({ message: "Categories not found" });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// create discount code
export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;
    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });
    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          "Discount code already available please use a different code!"
        )
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });
    res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    return next(error);
  }
};

// get discount code
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
    });
    res.status(200).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    return next(error);
  }
};

// delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });
    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized access!"));
    }

    await prisma.discount_codes.delete({ where: { id } });

    return res
      .status(200)
      .json({ message: "Discount code successfully deleted" });
  } catch (error) {
    return next(error);
  }
};

// upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;
    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });
    res.status(201).json({
      file_url: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    return next(error);
  }
};

// delete product image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);

    res.status(201).json({
      success: true,
      response,
    });
  } catch (error) {
    return next(error);
  }
};

//create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes = [],
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
      starting_date = null,
      ending_date = null,
    } = req.body;

    if (
      !title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price
    ) {
      return next(new ValidationError("Missing required fields"));
    }
    if (!req.seller.id) {
      return next(new AuthError("Only seller can create products"));
    }

    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      },
    });
    if (slugChecking) {
      return next(
        new ValidationError("Slug already exist! Please use a different slug!")
      );
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        starting_date,
        ending_date,
        discount_codes: discountCodes.map((codeId: string) => codeId),
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: customProperties || {},
        custom_specifications: custom_specifications || {},
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true },
    });
    res.status(200).json({
      success: true,
      newProduct,
    });
  } catch (error) {
    return next(error);
  }
};

// get logged in seller products
export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: {
        images: true,
      },
    });
    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

//delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized action"));
    }
    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted"));
    }

    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        "Product is scheduled for deletion in 24 hours. You can restore it within this period before it is permanently deleted.",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {}
};

// update product
export const updateProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const {
      title,
      detailed_description,
      regular_price,
      sale_price,
      category,
      subCategory,
      stock,
      tags,
    } = req.body;

    let whereCondition: any = { id: productId };

    if (req.user?.role === "seller") {
      whereCondition.Shop = {
        sellerId: req.user.id,
      };
    }

    const existingProduct = await prisma.products.findFirst({
      where: whereCondition,
    });

    if (!existingProduct) {
      return next(
        new NotFoundError(
          "Product not found or you don't have permission to update it"
        )
      );
    }

    const updatedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        title: title || existingProduct.title,
        detailed_description:
          detailed_description || existingProduct.detailed_description,
        regular_price: regular_price
          ? parseFloat(regular_price)
          : existingProduct.regular_price,
        sale_price: sale_price
          ? parseFloat(sale_price)
          : existingProduct.sale_price,
        category: category || existingProduct.category,
        subCategory: subCategory || existingProduct.subCategory,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        tags: tags
          ? Array.isArray(tags)
            ? tags
            : tags.split(",").map((tag: string) => tag.trim())
          : existingProduct.tags,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    return next(error);
  }
};

//restore product

export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
      select: { id: true, shopId: true, isDeleted: true },
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized action"));
    }

    if (!product.isDeleted) {
      return res
        .status(400)
        .json({ message: "Product is not in deleted state" });
    }

    await prisma.products.update({
      where: { id: productId },
      data: { isDeleted: false, deletedAt: null },
    });

    return res.status(200).json({ message: "Product successfully restored!" });
  } catch (error) {
    return res.status(500).json({ message: "Error restoring product", error });
  }
};

// get All Products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    const baseFilter = {
      isDeleted: false,
      OR: [{ starting_date: null }, { ending_date: null }],
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { totalSales: "desc" as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
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
        where: baseFilter,
        orderBy: {
          totalSales: "desc",
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy,
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
    ]);
    res.status(200).json({
      products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

// get All Events
export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const baseFilter = {
      AND: [{ starting_date: { not: null } }, { ending_date: { not: null } }],
    };

    const [events, total, top10BySales] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          Shop: {
            include: {
              avatar: true,
            },
          },
        },
        where: baseFilter,
        orderBy: {
          totalSales: "desc",
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        take: 10,
        where: baseFilter,
        orderBy: {
          totalSales: "desc",
        },
      }),
    ]);
    res.status(200).json({
      events,
      top10BySales,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

//get product details
export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ message: "Product slug is required" });
    }
    const product = await prisma.products.findUnique({
      where: { slug },
      include: {
        images: true,
        Shop: {
          include: {
            avatar: true,
          },
        },
      },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ product });
  } catch (error) {
    return next(error);
  }
};

//get filtered products
export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      starting_date: null,
      isDeleted: false,
    };
    if (categories && (categories as string[]).length > 0) {
      const categoryArray = Array.isArray(categories)
        ? categories
        : String(categories).split(",");

      filters.category = {
        in: categoryArray,
      };
    }

    if (colors && (colors as string[]).length > 0) {
      const colorArray = Array.isArray(colors)
        ? colors
        : String(colors).split(",");
      filters.colors = {
        hasSome: colorArray,
      };
    }
    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          Shop: {
            include: {
              avatar: true,
            },
          },
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//get filtered offers
export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12,
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      NOT: {
        starting_date: null,
      },
    };
    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors],
      };
    }
    if (sizes && (sizes as string[]).length > 0) {
      filters.sizes = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          Shop: {
            include: {
              avatar: true,
            },
          },
        },
      }),
      prisma.products.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//get filtered Shops
export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let {
      category = [],
      country = [],
      page = 1,
      limit = 12,
      minRating,
      sortBy = "newest",
    } = req.query;
    if (typeof category === "string") category = category.split(",");
    if (typeof country === "string") country = country.split(",");

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const parsedMinRating = minRating ? Number(minRating) : 0;
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (Array.isArray(category) && category.length > 0 && category[0] !== "") {
      filters.category = { hasSome: category };
    }
    if (Array.isArray(country) && country.length > 0 && country[0] !== "") {
      filters.country = { in: country };
    }

    // Build orderBy for sorting
    let orderBy: any = {};
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Get all shops
    const allShops = await prisma.shops.findMany({
      where: filters,
      include: {
        sellers: true,
        followers: true,
        reviews: true,
        avatar: {
          select: {
            id: true,
            url: true,
          },
        },
      },
      orderBy,
    });

    const shopsWithRatings = allShops
      .map((shop) => {
        const shopReviews = (shop as any).reviews || [];
        const rating =
          shopReviews.length > 0
            ? shopReviews.reduce(
                (sum: number, review: any) => sum + review.rating,
                0
              ) / shopReviews.length
            : 0;

        return {
          ...shop,
          rating: rating ? Math.round(rating * 10) / 10 : 0,
          avatar: (shop as any).avatar || null,
          reviews: undefined,
        };
      })
      .filter((shop) => {
        return (
          parsedMinRating === 0 ||
          (shop.rating && shop.rating >= parsedMinRating)
        );
      });

    if (sortBy === "rating") {
      shopsWithRatings.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "followers") {
      shopsWithRatings.sort(
        (a, b) =>
          ((b as any).followers?.length || 0) -
          ((a as any).followers?.length || 0)
      );
    }

    const total = shopsWithRatings.length;
    const paginatedShops = shopsWithRatings.slice(skip, skip + parsedLimit);
    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      shops: paginatedShops,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// search Products
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required." });
    }
    const products = await prisma.products.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            short_description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.status(200).json({ products });
  } catch (error) {
    return next(error);
  }
};

// top shops
export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      select: { shopId: true, total: true },
    });

    const salesByShop: Record<string, number> = {};
    for (const order of orders) {
      if (!order.shopId) continue;
      salesByShop[order.shopId] =
        (salesByShop[order.shopId] || 0) + (order.total || 0);
    }

    const topShopIds = Object.entries(salesByShop)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([shopId]) => shopId);
    const shops = await prisma.shops.findMany({
      where: {
        id: { in: topShopIds },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverBanner: true,
        address: true,
        ratings: true,
        category: true,
        _count: { select: { followers: true } },
      },
    });

    const enrichedShops = shops.map((shop) => {
      return {
        ...shop,
        avatar: shop.avatar?.url || DEFAULT_PROFILE_IMAGE,
        coverBanner: shop.coverBanner || DEFAULT_COVER_IMAGE,
        followersCount: shop._count.followers,
        totalSales: salesByShop[shop.id] || 0,
      };
    });
    const top10Shops = enrichedShops.sort(
      (a, b) => b.totalSales - a.totalSales
    );
    return res.status(200).json({ shops: top10Shops });
  } catch (error) {
    return next(error);
  }
};

export const getCategoriesWithCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }

    const categoryCounts = await Promise.all(
      config.categories.map(async (category: string) => {
        const count = await prisma.products.count({
          where: {
            category,
            isDeleted: false,
          },
        });
        return {
          name: category,
          count,
        };
      })
    );
    return res.status(200).json({
      categories: categoryCounts,
    });
  } catch (error) {
    return next(error);
  }
};

export const getBestSellersByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = req.query.category as string;
    const limit = parseInt(req.query.limit as string) || 8;

    const products = await prisma.products.findMany({
      where: {
        isDeleted: false,
        status: "Active",
        ...(category && category !== "All" ? { category: category } : {}),
      },
      orderBy: {
        totalSales: "desc",
      },
      take: limit,
      include: {
        Shop: {
          include: {
            avatar: true,
          },
        },
        images: true,
      },
    });

    return res.status(200).json({ products });
  } catch (err) {
    return next(err);
  }
};

export const getBrandsShowcase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const brands = await prisma.shops.findMany({
      take: 10,
      include: {
        avatar: true,
        sellers: {
          select: {
            country: true,
          },
        },
      },
    });

    const data = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      city: brand.address,
      country: brand.sellers?.country || "",
      avatarUrl: brand.avatar?.url || "",
    }));

    res.status(200).json({ brands: data });
  } catch (error) {
    return next(error);
  }
};

export const getThreeProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        isDeleted: false,
        status: "Active",
      },
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Shop: {
          include: {
            avatar: true,
          },
        },
        images: true,
      },
    });

    return res.status(200).json({ products });
  } catch (err) {
    return next(err);
  }
};

export const getColorsWithCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        isDeleted: false,
        status: "Active",
      },
      select: {
        colors: true,
      },
    });

    const colorCounts: { [key: string]: number } = {};

    products.forEach((product) => {
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach((color: string) => {
          if (color && color.trim()) {
            colorCounts[color] = (colorCounts[color] || 0) + 1;
          }
        });
      }
    });

    const colorsWithCount = Object.entries(colorCounts).map(
      ([colorValue, count]) => ({
        name: getColorName(colorValue),
        code: getColorCode(colorValue),
        count: count,
      })
    );
    res.status(200).json({ colors: colorsWithCount });
  } catch (error) {
    next(error);
  }
};

//  color name generation from hex codes
const getColorName = (hexCode: string): string => {
  if (!hexCode.startsWith("#")) {
    return hexCode;
  }

  const hex = hexCode.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const brightness = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max - min < 30) {
    if (brightness < 50) return "Black";
    if (brightness < 100) return "Dark Gray";
    if (brightness < 150) return "Gray";
    if (brightness < 200) return "Light Gray";
    return "White";
  }

  if (r >= g && r >= b) {
    if (g > b + 30) {
      return brightness > 200
        ? "Light Orange"
        : brightness > 80
        ? "Orange"
        : "Dark Orange";
    } else if (b > g + 30) {
      return brightness > 200
        ? "Light Pink"
        : brightness > 80
        ? "Pink"
        : "Dark Pink";
    } else {
      return brightness > 200
        ? "Light Red"
        : brightness > 80
        ? "Red"
        : "Dark Red";
    }
  } else if (g >= r && g >= b) {
    if (r > b + 30) {
      return brightness > 200
        ? "Light Yellow"
        : brightness > 80
        ? "Yellow"
        : "Dark Yellow";
    } else if (b > r + 30) {
      return brightness > 200
        ? "Light Teal"
        : brightness > 80
        ? "Teal"
        : "Dark Teal";
    } else {
      return brightness > 200
        ? "Light Green"
        : brightness > 80
        ? "Green"
        : "Dark Green";
    }
  } else {
    if (r > g + 30) {
      return brightness > 200
        ? "Light Purple"
        : brightness > 80
        ? "Purple"
        : "Dark Purple";
    } else if (g > r + 30) {
      return brightness > 200
        ? "Light Cyan"
        : brightness > 80
        ? "Cyan"
        : "Dark Cyan";
    } else {
      return brightness > 200
        ? "Light Blue"
        : brightness > 80
        ? "Blue"
        : "Dark Blue";
    }
  }
};

const getColorCode = (colorName: string): string => {
  const colorMap: { [key: string]: string } = {
    Red: "#FF0000",
    Blue: "#0000FF",
    Green: "#008000",
    Yellow: "#FFFF00",
    Black: "#000000",
    White: "#FFFFFF",
    Pink: "#FFC0CB",
    Purple: "#800080",
    Orange: "#FFA500",
    Brown: "#A52A2A",
    Gray: "#808080",
    Grey: "#808080",
    Navy: "#000080",
    Maroon: "#800000",
    Teal: "#008080",
    Olive: "#808000",
    Silver: "#C0C0C0",
    Gold: "#FFD700",
    Beige: "#F5F5DC",
    Cream: "#FFFDD0",
  };

  if (colorName.startsWith("#")) {
    return colorName;
  }

  return colorMap[colorName] || "#CCCCCC";
};

export const getNewProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, limit = 10 } = req.query;

    const products = await prisma.products.findMany({
      where: {
        isDeleted: false,
        status: "Active",
        ...(category && category !== "All"
          ? { category: category as string }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: parseInt(limit as string),
      include: {
        images: true,
        Shop: {
          include: {
            avatar: true,
          },
        },
      },
    });

    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
};

function calculateSimilarity(str1: string, str2: string): number {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLen = Math.max(len1, len2);
  return ((maxLen - matrix[len2][len1]) / maxLen) * 100;
}

const synonymsMap: Record<string, string[]> = {
  handmade: ["artisan", "craft", "handcrafted", "homemade", "custom"],
  jewelry: ["jewellery", "accessories", "ornaments"],
  clothing: ["apparel", "garments", "wear", "fashion"],
  art: ["artwork", "painting", "drawing", "creative"],
  home: ["house", "decor", "decoration", "interior"],
  vintage: ["retro", "antique", "classic", "old"],
  wooden: ["wood", "timber", "oak", "pine"],
  ceramic: ["pottery", "clay", "porcelain"],
};

function expandQueryWithSynonyms(query: string): string[] {
  const words = query.toLowerCase().split(" ");
  const expandedTerms = [query.toLowerCase()];

  words.forEach((word) => {
    Object.entries(synonymsMap).forEach(([key, synonyms]) => {
      if (synonyms.includes(word) || key === word) {
        expandedTerms.push(...synonyms, key);
      }
    });
  });

  return [...new Set(expandedTerms)];
}

// advanced search
export const searchAdvanced = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      query = "",
      categories = "",
      brand = "",
      minPrice,
      maxPrice,
      tags,
      inStock = true,
      sortBy = "relevance",
      page = 1,
      limit = 20,
    } = req.query;

    const searchQuery = query as string;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {
      isDeleted: false,
      status: "Active",
    };

    if (categories) {
      whereClause.category = categories;
    }

    if (minPrice || maxPrice) {
      whereClause.sale_price = {};
      if (minPrice) whereClause.sale_price.gte = parseFloat(minPrice as string);
      if (maxPrice) whereClause.sale_price.lte = parseFloat(maxPrice as string);
    }

    if (tags) {
      const tagArray = (tags as string).split(",").filter(Boolean);
      if (tagArray.length > 0) {
        whereClause.tags = {
          hasSome: tagArray,
        };
      }
    }

    if (inStock === "true" || inStock === true) {
      whereClause.stock = {
        gt: 0,
      };
    }

    const products = await prisma.products.findMany({
      where: whereClause,
      include: {
        Shop: {
          select: {
            id: true,
            name: true,
            avatar: {
              select: {
                url: true,
              },
            },
          },
        },
        images: {
          select: {
            url: true,
          },
          take: 5,
        },
      },
      skip,
      take: limitNum,
    });

    let scoredProducts = products;
    if (searchQuery.trim()) {
      const expandedTerms = expandQueryWithSynonyms(searchQuery);

      scoredProducts = products
        .map((product) => {
          let score = 0;

          const titleSimilarity = calculateSimilarity(
            product.title.toLowerCase(),
            searchQuery.toLowerCase()
          );
          if (titleSimilarity >= 70) score += titleSimilarity * 3;

          expandedTerms.forEach((term) => {
            if (product.title.toLowerCase().includes(term)) {
              score += 20;
            }
            if (product.category?.toLowerCase().includes(term)) {
              score += 15;
            }
            if (product.tags?.some((tag) => tag.toLowerCase().includes(term))) {
              score += 10;
            }
          });

          score += (product.totalSales || 0) * 0.1;
          score += (product.ratings || 0) * 5;

          return { ...product, relevanceScore: score };
        })
        .filter((product) => product.relevanceScore > 0);
    }

    switch (sortBy) {
      case "price_low":
        scoredProducts.sort(
          (a, b) => (a.sale_price || 0) - (b.sale_price || 0)
        );
        break;
      case "price_high":
        scoredProducts.sort(
          (a, b) => (b.sale_price || 0) - (a.sale_price || 0)
        );
        break;
      case "newest":
        scoredProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "popular":
        scoredProducts.sort(
          (a, b) => (b.totalSales || 0) - (a.totalSales || 0)
        );
        break;
      case "rating":
        scoredProducts.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
        break;
      default:
        if (searchQuery.trim()) {
          scoredProducts.sort(
            (a, b) => (b as any).relevanceScore - (a as any).relevanceScore
          );
        }
    }

    const totalCount = await prisma.products.count({ where: whereClause });
    const totalPages = Math.ceil(totalCount / limitNum);

    const cleanProducts = scoredProducts.map(
      ({ relevanceScore, ...product }: any) => product
    );

    res.status(200).json({
      success: true,
      products: cleanProducts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalResults: totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      filters: {
        query: searchQuery,
        categories,
        brand,
        minPrice,
        maxPrice,
        tags,
        inStock,
        sortBy,
      },
    });
  } catch (error) {
    next(error);
  }
};

const suggestionCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// search suggestions
export const getSearchSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query is required and must be a string",
      });
    }

    const searchQuery = q.trim().toLowerCase();

    if (searchQuery.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search query too long (max 100 characters)",
      });
    }

    const dangerousPatterns = /[';"\\]|--|\/\*|\*\/|xp_|sp_/i;
    if (dangerousPatterns.test(searchQuery)) {
      return res.status(400).json({
        success: false,
        message: "Invalid characters in search query",
      });
    }

    const cacheKey = `suggestions:${searchQuery}:${limit}`;
    const cached = suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.status(200).json(cached.data);
    }

    if (!searchQuery.trim()) {
      return res.status(200).json({
        success: true,
        suggestions: {
          products: [],
          categories: [],
          brands: [],
        },
      });
    }

    const maxLimit = Math.min(parseInt(limit as string) || 10, 20);
    const productLimit = Math.floor(maxLimit / 2) || 5;

    const productSuggestions = await prisma.products.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                title: {
                  contains: searchQuery,
                  mode: "insensitive",
                },
              },
              {
                title: {
                  startsWith: searchQuery,
                  mode: "insensitive",
                },
              },
            ],
          },
          {
            isDeleted: false,
          },
          {
            status: "Active",
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        sale_price: true,
        images: {
          take: 1,
          select: {
            url: true,
          },
        },
      },
      take: productLimit,
      orderBy: [
        {
          title: searchQuery.length > 2 ? "asc" : "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    const categories = await prisma.products.findMany({
      where: {
        category: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
      select: {
        category: true,
      },
      distinct: ["category"],
      take: 5,
    });

    const brands = await prisma.products.findMany({
      where: {
        Shop: {
          name: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
      },
      select: {
        Shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ["shopId"],
      take: 5,
    });

    const responseData = {
      success: true,
      suggestions: {
        products: productSuggestions.map((p) => ({
          id: p.id,
          name: p.title,
          slug: p.slug,
          category: p.category,
          price: p.sale_price,
          image: p.images[0]?.url || null,
          type: "product" as const,
        })),
        categories: categories
          .map((c) => ({
            id: c.category,
            name: c.category,
            type: "category" as const,
          }))
          .filter((item) => item.name),
        brands: brands
          .map((b) => ({
            id: b.Shop?.id,
            name: b.Shop?.name,
            avatar: null,
            type: "brand" as const,
          }))
          .filter((item) => item.name),
      },
    };

    suggestionCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    res.set({
      "Cache-Control": "public, max-age=300",
      ETag: `"${Buffer.from(JSON.stringify(responseData))
        .toString("base64")
        .slice(0, 16)}"`,
    });

    res.status(200).json(responseData);
  } catch (error) {
    return next(error);
  }
};

// popular search terms
export const getPopularSearches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const popularSearches = [
      "handmade jewelry",
      "wooden crafts",
      "ceramic pottery",
      "vintage clothing",
      "home decor",
      "artisan bags",
      "custom art",
      "handwoven textiles",
    ];

    res.status(200).json({
      success: true,
      searches: popularSearches,
    });
  } catch (error) {
    next(error);
  }
};

// available search filters
export const getSearchFilters = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.products.findMany({
      where: {
        isDeleted: false,
        status: "Active",
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    const priceRange = await prisma.products.aggregate({
      where: {
        isDeleted: false,
        status: "Active",
      },
      _min: {
        sale_price: true,
      },
      _max: {
        sale_price: true,
      },
    });

    const productsWithTags = await prisma.products.findMany({
      where: {
        isDeleted: false,
        status: "Active",
        tags: {
          isEmpty: false,
        },
      },
      select: {
        tags: true,
      },
    });

    const tagCounts = new Map<string, number>();

    productsWithTags.forEach((product) => {
      if (product.tags) {
        product.tags.forEach((tag) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    res.status(200).json({
      success: true,
      filters: {
        categories: categories
          .map((c) => ({
            name: c.category,
            value: c.category,
            count: 0,
          }))
          .filter((item) => item.name),
        priceRange: {
          min: priceRange._min.sale_price || 0,
          max: priceRange._max.sale_price || 1000,
          average:
            ((priceRange._min.sale_price || 0) +
              (priceRange._max.sale_price || 1000)) /
            2,
        },
        tags: Array.from(tagCounts.entries())
          .map(([tag, count]) => ({
            name: tag,
            count: count,
          }))
          .sort((a, b) => b.count - a.count),
        sortOptions: [
          { value: "relevance", label: "Most Relevant" },
          { value: "newest", label: "Newest First" },
          { value: "price_low", label: "Price: Low to High" },
          { value: "price_high", label: "Price: High to Low" },
          { value: "popular", label: "Most Popular" },
          { value: "rating", label: "Highest Rated" },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};
