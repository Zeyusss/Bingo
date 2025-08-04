import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";
import { imagekit } from '@packages/libs/imagekit';
import prisma from "@packages/libs/prisma";
import { NextFunction, Request, Response } from "express";
import { Prisma } from '@prisma/client';


const DEFAULT_PROFILE_IMAGE = "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756";
const DEFAULT_COVER_IMAGE = "https://ik.imagekit.io/w7lwh7wre/cover-handmade.webp?updatedAt=175424311149";

//get product category
export const getCategories = async (
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    try {
        const config = await prisma.site_config.findFirst();
        if(!config){
            return res.status(404).json({message: "Categories not found"})
        }

        return res.status(200).json({
            categories : config.categories,
            subCategories : config.subCategories,
        })
    } catch (error) {
        return next(error);
    }
};

// create discount code
export const createDiscountCodes = async (   
    req:any,
    res:Response,
    next:NextFunction) =>{
    try {
    const {public_name,discountType,discountValue,discountCode}=req.body;
    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
        where:{
            discountCode
        }
    });
    if(isDiscountCodeExist){
        return next(
            new ValidationError("Discount code already available please use a different code!")
        );
    }

    const discount_code = await prisma.discount_codes.create({
        data : {
            public_name,
            discountType,
            discountValue:parseFloat(discountValue),
            discountCode,
            sellerId : req.seller.id
        }
    });
    res.status(201).json({
        success:true,
        discount_code,
    });
    } catch (error) {
    return next(error)
    }

    }

// get discount code
export const getDiscountCodes = async (  
    req:any,
    res:Response,
    next:NextFunction)=>{
        try {
            const discount_codes = await prisma.discount_codes.findMany({
                where:{
                    sellerId: req.seller.id,
                }
            });
            res.status(200).json({
                success: true,
                discount_codes,
            })
        } catch (error) {
            return next(error)
        }

}

// delete discount code
export const deleteDiscountCode = async (
        req:any,
    res:Response,
    next:NextFunction
)=>{
try {
    const {id} = req.params;
    const sellerId = req.seller?.id;
    
    const discountCode = await prisma.discount_codes.findUnique({
        where:{id},
        select:{id:true,sellerId:true},
    })
    if(!discountCode){
        return next (new NotFoundError("Discount code not found!"))
    }

    if(discountCode.sellerId !== sellerId){
        return next (new ValidationError("Unauthorized access!"))
    }

    await prisma.discount_codes.delete({where:{id}})

    return res.status(200).json({message:"Discount code successfully deleted"})

} catch (error) {
    return next(error)
}
}

// upload product image
export const uploadProductImage = async (   
    req:Request,
    res:Response,
    next:NextFunction)=>{
try {
    const {fileName} = req.body;
    const response = await imagekit.upload({
        file:fileName,
        fileName:`product-${Date.now()}.jpg`,
        folder: "/products",
    });
    res.status(201).json({
        file_url: response.url,
        fileId:response.fileId,
    })
} catch (error) {
    return next(error)
}
}

// delete product image
export const deleteProductImage = async(
    req:Request,
    res:Response,
    next:NextFunction
) =>{
try {
    const {fileId} = req.body;
    
    const response = await imagekit.deleteFile(fileId);

    res.status(201).json({
        success: true,
        response
    })
} catch (error) {
    return next(error)
}
}

//create product
export const createProduct = async  ( 
    req:any,
    res:Response,
    next:NextFunction)=>{
try {
    const {
        title,short_description,detailed_description,warranty,custom_specifications,
        slug,tags,cash_on_delivery,brand,video_url,category,colors =[],sizes = [],
        discountCodes = [],stock,sale_price,regular_price,subCategory,customProperties = {},
        images=[],
         starting_date = null,   
  ending_date = null      
    } = req.body;

    if(!title || !slug || !short_description || !category || !subCategory || !sale_price || !images || !tags || !stock || !regular_price ){
        return next(new ValidationError("Missing required fields"))
    }
    if(!req.seller.id){
        return next(new AuthError("Only seller can create products"))
    }

    const slugChecking = await prisma.products.findUnique({
        where:{
            slug,
        }
    })
    if(slugChecking){
        return next(
            new ValidationError("Slug already exist! Please use a different slug!")
        )
    }

    const newProduct = await prisma.products.create({
        data:{
            title,
            short_description,
            detailed_description,
            warranty,
            cashOnDelivery: cash_on_delivery,
            slug,
            shopId:req.seller?.shop?.id,
            tags:Array.isArray(tags)? tags : tags.split(","),
            brand,
            video_url,
            category,
            subCategory,
            colors:colors || [],
            starting_date,   
            ending_date,     
            discount_codes: discountCodes.map((codeId:string)=> codeId),
            sizes: sizes || [],
            stock: parseInt(stock),
            sale_price:parseFloat(sale_price),
            regular_price: parseFloat(regular_price),
            custom_properties: customProperties || {},
            custom_specifications: custom_specifications || {},
            images: {
                create : images.filter((img:any)=> img && img.fileId && img.file_url).map((img:any)=>({
                file_id :img.fileId,
                url:img.file_url,
            })),
            }
        },
        include : {images : true},
    })
    res.status(200).json({
        success:true,
        newProduct
    })
} catch (error) {
    return next(error)
}
}

// get logged in seller products
export const getShopProducts = async (
        req:any,
    res:Response,
    next:NextFunction
)=>{
try {
    const products = await prisma.products.findMany({
    where : {
        shopId : req?.seller?.shop?.id,
    },
    include: {
        images: true,
    },
});
res.status(201).json({
    success : true,
    products,
});
} catch (error) {
    return next(error)
}
}

//delete product
export const deleteProduct = async (
    req:any,
    res:Response,
    next:NextFunction)=>{
try {
    const {productId} = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
        where:{id:productId},
        select : {id:true,shopId: true,isDeleted:true},
    })
    if(!product){
        return next(new ValidationError("Product not found"));
    }
    if(product.shopId !== sellerId){
        return next (new ValidationError("Unauthorized action"))
    }
    if (product.isDeleted){
        return next (new ValidationError("Product is already deleted"));
    }

    const deletedProduct = await prisma.products.update({
        where:{id:productId},
        data:{
            isDeleted :true,
            deletedAt: new Date(Date.now()+ 24 *60*60*1000),
        },
    });

    return res.status(200).json({
        message:"Product is scheduled for deletion in 24 hours. You can restore it within this period before it is permanently deleted.",
        deletedAt : deletedProduct.deletedAt,
    })
} catch (error) {

}
}


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
            tags
        } = req.body;


        let whereCondition: any = { id: productId };
        
        if (req.user?.role === 'seller') {
            whereCondition.Shop = {
                sellerId: req.user.id
            };
        }
        
        const existingProduct = await prisma.products.findFirst({
            where: whereCondition
        });

        if (!existingProduct) {
            return next(
                new NotFoundError("Product not found or you don't have permission to update it")
            );
        }

        const updatedProduct = await prisma.products.update({
            where: {
                id: productId
            },
            data: {
                title: title || existingProduct.title,
                detailed_description: detailed_description || existingProduct.detailed_description,
                regular_price: regular_price ? parseFloat(regular_price) : existingProduct.regular_price,
                sale_price: sale_price ? parseFloat(sale_price) : existingProduct.sale_price,
                category: category || existingProduct.category,
                subCategory: subCategory || existingProduct.subCategory,
                stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
                tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim())) : existingProduct.tags,
                updatedAt: new Date()
            }
        });

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        return next(error);
    }
};

//restore product 

export const restoreProduct = async (
    req:any,
    res:Response,
    next:NextFunction
)=>{
try {
    const {productId} = req.params;
const sellerId = req.seller?.shop?.id;

const product = await prisma.products.findUnique({
    where : {
        id:productId
    },
    select : { id : true , shopId : true , isDeleted : true},
})
if (!product){
    return next(new ValidationError("Product not found"))
}

if(product.shopId !== sellerId){
    return next (new ValidationError ("Unauthorized action"))
}

if(!product.isDeleted){
    return res.status(400).json({message: "Product is not in deleted state"})
}

await prisma.products.update({
    where:{id:productId},
    data:{isDeleted: false , deletedAt : null}
})

return res.status(200).json({message:"Product successfully restored!"})
} catch (error) {
    return res.status(500).json({message : "Error restoring product",error})
}
}


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
      OR: [
        { starting_date: null },
        { ending_date: null }
      ]
    };

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { totalSales: "desc" as Prisma.SortOrder };

     const [products,total,top10Products]=await Promise.all([
        prisma.products.findMany({
            skip,
            take:limit,
            include:{
                images:true,
                Shop:true,
            },
            where : baseFilter,
            orderBy : {
                totalSales:"desc",
            }
        }),
        prisma.products.count({where:baseFilter}),
        prisma.products.findMany({
            take:10,
            where:baseFilter,
            orderBy
        }),
     ])
res.status(200).json({
    products,
    top10By : type === "latest" ? "latest" : "topSales",
    top10Products,
    total,
    currentPage : page,
    totalPages : Math.ceil(total / limit),
})
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

      AND: [
        { starting_date: {not:null} },
        { ending_date:  {not:null}  }
      ]
    };


     const [events,total,top10BySales]=await Promise.all([
        prisma.products.findMany({
            skip,
            take:limit,
            include:{
                images:true,
                Shop:true,
            },
            where : baseFilter,
            orderBy : {
                totalSales:"desc",
            }
        }),
        prisma.products.count({where:baseFilter}),
        prisma.products.findMany({
            take:10,
            where:baseFilter,
            orderBy : {
                totalSales : "desc"
            }
        }),
     ])
res.status(200).json({
    events,
    top10BySales ,
    total,
    currentPage : page,
    totalPages : Math.ceil(total / limit),
})
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
      return res.status(400).json({ message: 'Product slug is required' });
    }
    const product = await prisma.products.findUnique({
      where: { slug },
      include: {
        images: true,
        Shop: true,
      },
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ product });
  } catch (error) {
    return next(error);
  }
};

//get filtered products
export const getFilteredProducts = async (
    req : Request,
    res:Response,
    next:NextFunction
)=>{
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
    :[0, 10000];
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1 ) * parsedLimit;

    const filters: Record<string,any> = {
        sale_price:{
            gte:parsedPriceRange[0],
            lte:parsedPriceRange[1],
        },
        starting_date: null ,
    };
    if(categories && (categories as string[]).length > 0){
        filters.category = {
            in:Array.isArray(categories)
            ? categories
            : String(categories).split(","),
        };
    }
    
    if(colors && (colors as string[]).length > 0){
        filters.colors = {
        hasSome : Array.isArray(colors) ? colors : [colors],
        }
    }
    if(sizes && (sizes as string[]).length > 0){
        filters.sizes = {
            hasSome : Array.isArray(sizes) ? sizes : [sizes],
        };
    }

    const [products , total] = await Promise.all([
        prisma.products.findMany({
            where:filters,
            skip,
            take : parsedLimit,
            include : {
                images : true,
                Shop : true,
            }
        }),
        prisma.products.count({where:filters})
    ])

    const totalPages = Math.ceil(total/parsedLimit);

    res.json({
        products,
        pagination:{
            total,
            page:parsedPage,
            totalPages,
        },
    });

} catch (error) {
     return next(error);
}
}


//get filtered offers
export const getFilteredEvents = async (
        req : Request,
    res:Response,
    next:NextFunction
)=>{

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
    :[0, 10000];
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1 ) * parsedLimit;

    const filters: Record<string,any> = {
        sale_price:{
            gte:parsedPriceRange[0],
            lte:parsedPriceRange[1],
        },
        NOT : {
            starting_date : null,
        },
    };
    if(categories && (categories as string[]).length > 0){
        filters.category = {
            in:Array.isArray(categories)
            ? categories
            : String(categories).split(","),
        };
    }
    
    if(colors && (colors as string[]).length > 0){
        filters.colors = {
        hasSome : Array.isArray(colors) ? colors : [colors],
        }
    }
    if(sizes && (sizes as string[]).length > 0){
        filters.sizes = {
            hasSome : Array.isArray(sizes) ? sizes : [sizes],
        };
    }

    const [products , total] = await Promise.all([
        prisma.products.findMany({
            where:filters,
            skip,
            take : parsedLimit,
            include : {
                images : true,
                Shop : true,
            }
        }),
        prisma.products.count({where:filters})
    ])

    const totalPages = Math.ceil(total/parsedLimit);

    res.json({
        products,
        pagination:{
            total,
            page:parsedPage,
            totalPages,
        },
    });
    } catch (error) {
        return next(error);
    }

}

//get filtered Shops
export const getFilteredShops = async (
    req : Request,
    res:Response,
    next:NextFunction
)=>{
    try {
        let { category = [], country = [], page = 1, limit = 12 } = req.query;
        if (typeof category === 'string') category = category.split(',');
        if (typeof country === 'string') country = country.split(',');

        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        const skip = (parsedPage - 1 ) * parsedLimit;

        const filters: Record<string,any> = {};

        if (Array.isArray(category) && category.length > 0 && category[0] !== "") {
            filters.category = { hasSome: category };
        }
        if (Array.isArray(country) && country.length > 0 && country[0] !== "") {
            filters.country = { in: country };
        }

        const [shops , total] = await Promise.all([
            prisma.shops.findMany({
                where:filters,
                skip,
                take : parsedLimit,
                include : {
                    sellers:true,
                    followers:true,
                    reviews:true,
                    avatar: {
                        select: {
                            id: true,
                            url: true
                        }
                    }
                }
            }),
            prisma.shops.count({where:filters})
        ])

        const totalPages = Math.ceil(total/parsedLimit);

        // Calculate ratings for each shop
        const shopsWithRatings = shops.map(shop => {
            const shopReviews = (shop as any).reviews || [];
            const rating = shopReviews.length > 0 
                ? shopReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / shopReviews.length
                : null;
            
            return {
                ...shop,
                rating: rating ? Math.round(rating * 10) / 10 : null, // Round to 1 decimal
                avatar: (shop as any).avatar || null,
                // Remove reviews from response to keep it clean
                reviews: undefined
            };
        });

        res.json({
            shops: shopsWithRatings,
            pagination:{
                total,
                page:parsedPage,
                totalPages,
            },
        });
    } catch (error) {
        return next(error);
    }
}

// search Products
export const searchProducts = async(
    req : Request,
    res:Response,
    next:NextFunction
)=>{
try {
    const query = req.query.q as string;

    if(!query || query.trim().length === 0){
        return res.status(400).json({message : "Search query is required."})
    }
    const products = await prisma.products.findMany({
        where : {
            OR : [
                {
                    title : {
                        contains : query,
                        mode : "insensitive",
                    },
                },
                {
                    short_description : {
                        contains : query,
                        mode : "insensitive"
                    },
                },
            ],
        },
        select : {
            id: true,
            title : true,
            slug: true,
        },
        take : 10,
        orderBy : {
            createdAt : "desc",
        },
    });
    return res.status(200).json({products});
} catch (error) {
    return next(error);
}
}

// top shops
export const topShops = async (
    req : Request,
    res:Response,
    next:NextFunction
)=>{
try {

    const orders = await prisma.orders.findMany({
        select: { shopId: true, total: true }
    });


    const salesByShop: Record<string, number> = {};
    for (const order of orders) {
        if (!order.shopId) continue;
        salesByShop[order.shopId] = (salesByShop[order.shopId] || 0) + (order.total || 0);
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
    const top10Shops = enrichedShops.sort((a, b) => b.totalSales - a.totalSales);
    return res.status(200).json({ shops: top10Shops });
} catch (error) {
    console.error("Error fetching top shops:", error);
    return next(error);
}
}