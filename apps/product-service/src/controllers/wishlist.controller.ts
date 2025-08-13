import { Request, Response } from 'express';
import prisma from '@packages/libs/prisma';

// Get user's wishlist items
export const getWishlistItems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const wishlistItems = await prisma.wishlist_items.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            Shop: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformedItems = wishlistItems.map(item => ({
      id: item.product.id,
      title: item.product.title,
      price: item.product.sale_price || item.product.regular_price,
      regular_price: item.product.regular_price,
      sale_price: item.product.sale_price,
      image: item.product.images[0]?.url || '',
      shopId: item.product.shopId,
      stock: item.product.stock,
      slug: item.product.slug,
      wishlistItemId: item.id,
      createdAt: item.createdAt
    }));

    return res.json({
      success: true,
      wishlist: transformedItems
    });
  } catch (error: any) {
    console.error('Error fetching wishlist items:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add item to wishlist
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { productId } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }


    const product = await prisma.products.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    
    const existingWishlistItem = await prisma.wishlist_items.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingWishlistItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }


    const newWishlistItem = await prisma.wishlist_items.create({
      data: {
        userId,
        productId
      },
      include: {
        product: {
          include: {
            Shop: true,
            images: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Item added to wishlist successfully',
      wishlistItem: newWishlistItem
    });
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { productId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const deletedItem = await prisma.wishlist_items.deleteMany({
      where: {
        userId,
        productId
      }
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    return res.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Clear entire wishlist
export const clearWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    await prisma.wishlist_items.deleteMany({
      where: { userId }
    });

    return res.json({
      success: true,
      message: 'Wishlist cleared successfully'
    });
  } catch (error: any) {
    console.error('Error clearing wishlist:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Check if item is in wishlist
export const isInWishlist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { productId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const wishlistItem = await prisma.wishlist_items.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    return res.json({
      success: true,
      isInWishlist: !!wishlistItem
    });
  } catch (error: any) {
    console.error('Error checking wishlist status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
