import { Request, Response } from 'express';
import { 
  getAbandonedCarts, 
  processAbandonedCarts, 
  getAbandonedCartStats,
  sendAbandonedCartEmail,
  trackAbandonedCart 
} from '../services/abandonedCart.service';

// Track abandoned cart (Frontend endpoint)
export const trackAbandonedCartController = async (req: Request, res: Response) => {
  try {
    const cartData = req.body;
    
    if (!cartData.userId || !cartData.items || !Array.isArray(cartData.items)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart data provided'
      });
    }

    const result = await trackAbandonedCart(cartData);

    return res.status(200).json({
      success: true,
      message: 'Abandoned cart tracked successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Error tracking abandoned cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to track abandoned cart',
      error: error.message
    });
  }
};

// Get all abandoned carts (Admin endpoint)
export const getAllAbandonedCarts = async (req: Request, res: Response) => {
  try {
    const hoursThreshold = parseFloat(req.query.hours as string) || 24;
    const abandonedCarts = await getAbandonedCarts(hoursThreshold);

    return res.status(200).json({
      success: true,
      data: abandonedCarts,
      count: abandonedCarts.length,
      message: `Found ${abandonedCarts.length} abandoned carts`
    });
  } catch (error: any) {
    console.error('Error getting abandoned carts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get abandoned carts',
      error: error.message
    });
  }
};

// Process abandoned carts and send emails (Admin endpoint)
export const processAbandonedCartsController = async (req: Request, res: Response) => {
  try {
    const result = await processAbandonedCarts();

    return res.status(200).json({
      success: true,
      data: result,
      message: `Processed abandoned carts. Sent: ${result.sent}, Errors: ${result.errors}`
    });
  } catch (error: any) {
    console.error('Error processing abandoned carts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process abandoned carts',
      error: error.message
    });
  }
};

// Get abandoned cart statistics (Admin dashboard)
export const getAbandonedCartStatsController = async (req: Request, res: Response) => {
  try {
    const hoursThreshold = parseFloat(req.query.hours as string) || 24;
    const stats = await getAbandonedCartStats(hoursThreshold);

    return res.status(200).json({
      success: true,
      data: stats,
      message: 'Abandoned cart statistics retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error getting abandoned cart stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get abandoned cart statistics',
      error: error.message
    });
  }
};

// Send test abandoned cart email (Admin endpoint)
export const sendTestAbandonedCartEmail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user's current cart
    const abandonedCarts = await getAbandonedCarts(0); 
    const userCart = abandonedCarts.find(cart => cart.userId === userId);

    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: 'No cart found for this user'
      });
    }

    await sendAbandonedCartEmail(userCart);

    return res.status(200).json({
      success: true,
      message: 'Test abandoned cart email sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending test abandoned cart email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};

// Manual trigger for specific user (Admin endpoint)
export const triggerAbandonedCartEmailForUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const abandonedCarts = await getAbandonedCarts(0);
    const userCart = abandonedCarts.find(cart => cart.userId === userId);

    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: 'No abandoned cart found for this user'
      });
    }

    await sendAbandonedCartEmail(userCart);

    res.status(200).json({
      success: true,
      message: 'Abandoned cart email sent successfully',
      data: {
        userId: userCart.userId,
        userEmail: userCart.userEmail,
        itemCount: userCart.cartItems.length,
        totalAmount: userCart.totalAmount
      }
    });
  } catch (error: any) {
    console.error('Error triggering abandoned cart email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send abandoned cart email',
      error: error.message
    });
    
  }

};
