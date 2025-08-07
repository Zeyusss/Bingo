import { Request, Response } from 'express';
import redis from '@packages/libs/redis';
import { sendAbandonedCartEmail } from '../services/abandonedCartEmailService';

interface AbandonedCartItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
}

interface AbandonedCart {
  userId: string;
  userEmail: string;
  userName: string;
  items: AbandonedCartItem[];
  totalAmount: number;
  createdAt: Date;
  lastUpdated: Date;
  emailSent: boolean;
  emailOptOut: boolean;
}

export const trackAbandonedCart = async (req: Request, res: Response) => {
  try {
    const { userId, userEmail, userName, items, totalAmount } = req.body;

    if (!userId || !userEmail || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const cartKey = `abandoned_cart:${userId}`;
    
    
    const existingCartData = await redis.hgetall(cartKey);
    
    const abandonedCart: AbandonedCart = {
      userId,
      userEmail,
      userName,
      items,
      totalAmount,
      createdAt: existingCartData.createdAt ? new Date(existingCartData.createdAt) : new Date(),
      lastUpdated: new Date(),
      emailSent: existingCartData.emailSent === 'true',
      emailOptOut: existingCartData.emailOptOut === 'true'
    };

 
    await redis.hset(cartKey, {
      userId: abandonedCart.userId,
      userEmail: abandonedCart.userEmail,
      userName: abandonedCart.userName,
      items: JSON.stringify(abandonedCart.items),
      totalAmount: abandonedCart.totalAmount.toString(),
      createdAt: abandonedCart.createdAt.toISOString(),
      lastUpdated: abandonedCart.lastUpdated.toISOString(),
      emailSent: abandonedCart.emailSent.toString(),
      emailOptOut: abandonedCart.emailOptOut.toString()
    });
    

    await redis.expire(cartKey, 30 * 24 * 60 * 60);

    return res.json({
      success: true,
      message: 'Abandoned cart tracked successfully'
    });
  } catch (error: any) {
    console.error('Error tracking abandoned cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAbandonedCarts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (userId) {
      const cartKey = `abandoned_cart:${userId}`;
      const cartData = await redis.hgetall(cartKey);
      
      if (!cartData || Object.keys(cartData).length === 0) {
        return res.json({
          success: true,
          cart: null
        });
      }
      
      const cart: AbandonedCart = {
        userId: cartData.userId,
        userEmail: cartData.userEmail,
        userName: cartData.userName,
        items: JSON.parse(cartData.items),
        totalAmount: parseFloat(cartData.totalAmount),
        createdAt: new Date(cartData.createdAt),
        lastUpdated: new Date(cartData.lastUpdated),
        emailSent: cartData.emailSent === 'true',
        emailOptOut: cartData.emailOptOut === 'true'
      };
      
      return res.json({
        success: true,
        cart
      });
    }


    const allCarts: AbandonedCart[] = [];

    return res.json({
      success: true,
      carts: allCarts
    });
  } catch (error: any) {
    console.error('Error fetching abandoned carts:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const markEmailSent = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const cartKey = `abandoned_cart:${userId}`;
    

    const cartData = await redis.hgetall(cartKey);
    if (!cartData || Object.keys(cartData).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }


    await redis.hset(cartKey, 'emailSent', 'true');

    return res.json({
      success: true,
      message: 'Email status updated'
    });
  } catch (error: any) {
    console.error('Error updating email status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const optOutFromEmails = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const cartKey = `abandoned_cart:${userId}`;
    

    const cartData = await redis.hgetall(cartKey);
    if (!cartData || Object.keys(cartData).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

   
    await redis.hset(cartKey, 'emailOptOut', 'true');

    return res.json({
      success: true,
      message: 'Successfully opted out from abandoned cart emails'
    });
  } catch (error: any) {
    console.error('Error opting out:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const removeAbandonedCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const cartKey = `abandoned_cart:${userId}`;
    
    await redis.del(cartKey);

    return res.json({
      success: true,
      message: 'Abandoned cart removed'
    });
  } catch (error: any) {
    console.error('Error removing abandoned cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const sendEmailReminder = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const cartKey = `abandoned_cart:${userId}`;
    
    const cartData = await redis.hgetall(cartKey);
    
    if (!cartData || Object.keys(cartData).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    if (cartData.emailOptOut === 'true' || cartData.emailSent === 'true') {
      return res.json({
        success: true,
        message: 'No email to send'
      });
    }
    
    const cart: AbandonedCart = {
      userId: cartData.userId,
      userEmail: cartData.userEmail,
      userName: cartData.userName,
      items: JSON.parse(cartData.items),
      totalAmount: parseFloat(cartData.totalAmount),
      createdAt: new Date(cartData.createdAt),
      lastUpdated: new Date(cartData.lastUpdated),
      emailSent: cartData.emailSent === 'true',
      emailOptOut: cartData.emailOptOut === 'true'
    };
    
    const result = await sendAbandonedCartEmail(cart);
    
    if (result.success) {
      return res.json({
        success: true,
        message: 'Email reminder sent successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email reminder',
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Error sending email reminder:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
