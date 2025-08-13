import { Request, Response } from 'express';
import prisma from '@packages/libs/prisma';


export const getCartItems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const cartItems = await prisma.cart_items.findMany({
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

    const transformedItems = cartItems.map(item => ({
      id: item.product.id,
      title: item.product.title,
      price: item.product.sale_price || item.product.regular_price,
      regular_price: item.product.regular_price,
      sale_price: item.product.sale_price,
      image: item.product.images[0]?.url || '',
      quantity: item.quantity,
      shopId: item.product.shopId,
      stock: item.product.stock,
      slug: item.product.slug,
      cartItemId: item.id,
      createdAt: item.createdAt
    }));

    return res.json({
      success: true,
      cart: transformedItems
    });
  } catch (error: any) {
    console.error('Error fetching cart items:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { productId, quantity = 1 } = req.body;
    
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

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }


    const existingCartItem = await prisma.cart_items.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingCartItem) {

      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        });
      }

      const updatedItem = await prisma.cart_items.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
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
        message: 'Cart updated successfully',
        cartItem: updatedItem
      });
    } else {

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        });
      }

      const newCartItem = await prisma.cart_items.create({
        data: {
          userId,
          productId,
          quantity
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
        message: 'Item added to cart successfully',
        cartItem: newCartItem
      });
    }
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { productId, quantity } = req.body;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }

    if (quantity <= 0) {

      await prisma.cart_items.deleteMany({
        where: {
          userId,
          productId
        }
      });

      return res.json({
        success: true,
        message: 'Item removed from cart'
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

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    const updatedItem = await prisma.cart_items.updateMany({
      where: {
        userId,
        productId
      },
      data: { quantity }
    });

    return res.json({
      success: true,
      message: 'Cart item updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { productId } = req.params;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    await prisma.cart_items.deleteMany({
      where: {
        userId,
        productId
      }
    });

    return res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Clear entire cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    await prisma.cart_items.deleteMany({
      where: { userId }
    });

    return res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
