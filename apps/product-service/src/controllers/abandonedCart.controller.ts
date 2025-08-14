import { Request, Response } from 'express';
import prisma from '@packages/libs/prisma';
import { 
  getAbandonedCarts, 
  processAbandonedCarts, 
  getAbandonedCartStats,
  sendAbandonedCartEmail,
  trackAbandonedCart 
} from '../services/abandonedCart.service';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Audit logging helper
const auditLog = (action: string, userId: string, details: any, success: boolean, error?: string) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    success,
    error,
    service: 'abandoned-cart'
  };
  console.log(`🔍 AUDIT: ${JSON.stringify(logEntry)}`);
  // In production: send to logging service (e.g., Winston, DataDog, etc.)
};

// Rate limiting helper
const checkRateLimit = (key: string, maxRequests: number, windowMs: number): { allowed: boolean; resetTime?: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, resetTime: record.resetTime };
  }
  
  record.count++;
  return { allowed: true };
};

// Input validation helper
const validateUserId = (userId: string): { valid: boolean; error?: string } => {
  if (!userId) {
    return { valid: false, error: 'User ID is required' };
  }
  if (typeof userId !== 'string') {
    return { valid: false, error: 'User ID must be a string' };
  }
  if (userId.length < 10 || userId.length > 50) {
    return { valid: false, error: 'User ID must be between 10 and 50 characters' };
  }
  if (!/^[a-zA-Z0-9]+$/.test(userId)) {
    return { valid: false, error: 'User ID contains invalid characters' };
  }
  return { valid: true };
};

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const filter = req.query.filter as string || 'all';

    // Get all abandoned carts first
    const allAbandonedCarts = await getAbandonedCarts(hoursThreshold);

    // Apply search filter
    let filteredCarts = allAbandonedCarts;
    if (search) {
      filteredCarts = allAbandonedCarts.filter(cart => 
        cart.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        cart.userName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply additional filters
    switch (filter) {
      case 'high-value':
        filteredCarts = filteredCarts.filter(cart => cart.totalAmount >= 100);
        break;
      case 'recent':
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);
        filteredCarts = filteredCarts.filter(cart => 
          new Date(cart.lastUpdated) >= last24Hours
        );
        break;
      case 'multiple-items':
        filteredCarts = filteredCarts.filter(cart => cart.cartItems.length > 1);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply pagination
    const totalItems = filteredCarts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCarts = filteredCarts.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      data: paginatedCarts,
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      message: `Found ${totalItems} abandoned carts`
    });
  } catch (error: any) {
    console.error('Error fetching abandoned carts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch abandoned carts',
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
      data: {
        totalCarts: stats.totalAbandonedCarts,
        totalValue: stats.totalAbandonedValue,
        emailsSent: stats.emailsSent,
        recoveryRate: stats.recoveryRate
      },
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



// Automated trigger for specific user (Used by cron jobs and automated systems)
export const triggerAbandonedCartEmailForUser = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { userId } = req.params;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  try {
    // Input validation
    const validation = validateUserId(userId);
    if (!validation.valid) {
      auditLog('automated_trigger_failed', userId || 'unknown', { reason: 'validation_error', error: validation.error }, false, validation.error);
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: 'INVALID_INPUT',
        timestamp: new Date().toISOString()
      });
    }

    // Rate limiting for automated systems (stricter)
    const rateLimitKey = `automated:${clientIP}:${userId}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000); // 5 requests per hour
    if (!rateLimit.allowed) {
      auditLog('automated_trigger_rate_limited', userId, { clientIP, userAgent }, false, 'Rate limit exceeded');
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Maximum 5 requests per hour for automated systems.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((rateLimit.resetTime! - Date.now()) / 1000),
        timestamp: new Date().toISOString()
      });
    }

    auditLog('automated_trigger_started', userId, { clientIP, userAgent }, true);

    // Use restrictive threshold for automated systems (24 hours max)
    const abandonedCarts = await getAbandonedCarts(24);
    const userCart = abandonedCarts.find(cart => cart.userId === userId);

    if (!userCart) {
      auditLog('automated_trigger_no_cart', userId, { searchThreshold: '24 hours' }, false, 'No cart found');
      return res.status(404).json({
        success: false,
        message: 'No abandoned cart found for this user within the last 24 hours',
        code: 'CART_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    // Enhanced spam protection with database transaction
    const existingRecord = await prisma.abandoned_carts.findUnique({
      where: { userId: userCart.userId }
    });

    if (existingRecord?.emailSentAt) {
      const hoursSinceLastEmail = (Date.now() - existingRecord.emailSentAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastEmail < 24) {
        auditLog('automated_trigger_spam_prevented', userId, { 
          hoursSinceLastEmail: hoursSinceLastEmail.toFixed(2),
          lastEmailSent: existingRecord.emailSentAt.toISOString()
        }, false, 'Spam prevention');
        return res.status(429).json({
          success: false,
          message: `Email was already sent ${hoursSinceLastEmail.toFixed(1)} hours ago. Minimum 24 hours between emails.`,
          code: 'EMAIL_COOLDOWN_ACTIVE',
          retryAfter: Math.ceil((24 - hoursSinceLastEmail) * 3600),
          lastEmailSent: existingRecord.emailSentAt.toISOString(),
          timestamp: new Date().toISOString()
        });
      }
    }

    // Validate cart data before sending
    if (!userCart.userEmail || !userCart.cartItems || userCart.cartItems.length === 0) {
      auditLog('automated_trigger_invalid_cart', userId, { 
        hasEmail: !!userCart.userEmail,
        itemCount: userCart.cartItems?.length || 0
      }, false, 'Invalid cart data');
      return res.status(422).json({
        success: false,
        message: 'Cart data is incomplete or invalid',
        code: 'INVALID_CART_DATA',
        timestamp: new Date().toISOString()
      });
    }

    // Send email with error handling
    await sendAbandonedCartEmail(userCart);
    
    const processingTime = Date.now() - startTime;
    auditLog('automated_trigger_success', userId, {
      userEmail: userCart.userEmail,
      cartValue: userCart.totalAmount,
      itemCount: userCart.cartItems.length,
      processingTimeMs: processingTime
    }, true);

    return res.status(200).json({
      success: true,
      message: `Recovery email sent successfully to ${userCart.userEmail}`,
      data: {
        userId: userCart.userId,
        userEmail: userCart.userEmail,
        cartValue: userCart.totalAmount,
        itemCount: userCart.cartItems.length,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString()
      },
      metadata: {
        source: 'automated_system',
        version: '1.0.0'
      }
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('Error triggering automated abandoned cart email:', error);
    auditLog('automated_trigger_error', userId || 'unknown', {
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime
    }, false, error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred while processing the request',
      code: 'INTERNAL_SERVER_ERROR',
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Admin manual override trigger (Used by admin UI for manual intervention)
export const adminForceAbandonedCartEmail = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { userId } = req.params;
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  const adminUser = (req as any).user?.id || 'unknown'; // Assuming auth middleware adds user info
  
  try {
    // Input validation
    const validation = validateUserId(userId);
    if (!validation.valid) {
      auditLog('admin_trigger_failed', userId || 'unknown', { 
        reason: 'validation_error', 
        error: validation.error,
        adminUser,
        clientIP 
      }, false, validation.error);
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: 'INVALID_INPUT',
        timestamp: new Date().toISOString()
      });
    }

    // Rate limiting for admin (more permissive but still protected)
    const rateLimitKey = `admin:${clientIP}:${adminUser}`;
    const rateLimit = checkRateLimit(rateLimitKey, 20, 60 * 60 * 1000); // 20 requests per hour for admin
    if (!rateLimit.allowed) {
      auditLog('admin_trigger_rate_limited', userId, { 
        adminUser, 
        clientIP, 
        userAgent 
      }, false, 'Admin rate limit exceeded');
      return res.status(429).json({
        success: false,
        message: 'Admin rate limit exceeded. Maximum 20 requests per hour.',
        code: 'ADMIN_RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((rateLimit.resetTime! - Date.now()) / 1000),
        timestamp: new Date().toISOString()
      });
    }

    auditLog('admin_trigger_started', userId, { 
      adminUser, 
      clientIP, 
      userAgent,
      action: 'force_email_trigger'
    }, true);

    // Try multiple thresholds to find the cart - admin can access older carts
    let userCart = null;
    let foundThreshold = 0;
    const thresholds = [0, 24, 168, 720]; // immediate, 1 day, 1 week, 1 month
    
    for (const hours of thresholds) {
      const abandonedCarts = await getAbandonedCarts(hours);
      userCart = abandonedCarts.find(cart => cart.userId === userId);
      
      if (userCart) {
        foundThreshold = hours;
        break;
      }
    }

    if (!userCart) {
      auditLog('admin_trigger_no_cart', userId, { 
        adminUser,
        searchThresholds: thresholds,
        reason: 'cart_not_found'
      }, false, 'No cart found');
      return res.status(404).json({
        success: false,
        message: 'No abandoned cart found for this user. The user may not have any items in their cart or the cart may be too old.',
        code: 'CART_NOT_FOUND',
        searchedThresholds: thresholds.map(h => `${h} hours`),
        timestamp: new Date().toISOString()
      });
    }

    // Validate cart data before sending
    if (!userCart.userEmail || !userCart.cartItems || userCart.cartItems.length === 0) {
      auditLog('admin_trigger_invalid_cart', userId, { 
        adminUser,
        hasEmail: !!userCart.userEmail,
        itemCount: userCart.cartItems?.length || 0,
        cartData: userCart
      }, false, 'Invalid cart data');
      return res.status(422).json({
        success: false,
        message: 'Cart data is incomplete or invalid',
        code: 'INVALID_CART_DATA',
        details: {
          hasEmail: !!userCart.userEmail,
          itemCount: userCart.cartItems?.length || 0
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check recent email history but allow admin override
    const existingRecord = await prisma.abandoned_carts.findUnique({
      where: { userId: userCart.userId }
    });

    let emailHistory = null;
    let warningMessage = '';
    if (existingRecord?.emailSentAt) {
      const hoursSinceLastEmail = (Date.now() - existingRecord.emailSentAt.getTime()) / (1000 * 60 * 60);
      warningMessage = ` (Previous email sent ${hoursSinceLastEmail.toFixed(1)} hours ago)`;
      emailHistory = {
        lastEmailSent: existingRecord.emailSentAt.toISOString(),
        hoursSinceLastEmail: hoursSinceLastEmail.toFixed(2),
        isOverride: hoursSinceLastEmail < 24
      };
    }

    // Send email with comprehensive error handling
    try {
      await sendAbandonedCartEmail(userCart);
    } catch (emailError: any) {
      auditLog('admin_trigger_email_failed', userId, {
        adminUser,
        userEmail: userCart.userEmail,
        emailError: emailError.message,
        cartValue: userCart.totalAmount
      }, false, `Email sending failed: ${emailError.message}`);
      
      return res.status(502).json({
        success: false,
        message: 'Failed to send email due to email service error',
        code: 'EMAIL_SERVICE_ERROR',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { error: emailError.message })
      });
    }
    
    const processingTime = Date.now() - startTime;
    auditLog('admin_trigger_success', userId, {
      adminUser,
      userEmail: userCart.userEmail,
      cartValue: userCart.totalAmount,
      itemCount: userCart.cartItems.length,
      foundThreshold: `${foundThreshold} hours`,
      emailHistory,
      processingTimeMs: processingTime
    }, true);

    return res.status(200).json({
      success: true,
      message: `Admin recovery email sent successfully to ${userCart.userEmail}${warningMessage}`,
      data: {
        userId: userCart.userId,
        userEmail: userCart.userEmail,
        cartValue: userCart.totalAmount,
        itemCount: userCart.cartItems.length,
        lastUpdated: userCart.lastUpdated,
        foundThreshold: `${foundThreshold} hours`,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
        adminOverride: true,
        ...(emailHistory && { emailHistory })
      },
      metadata: {
        source: 'admin_override',
        adminUser,
        version: '1.0.0'
      }
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('Error in admin abandoned cart email trigger:', error);
    auditLog('admin_trigger_error', userId || 'unknown', {
      adminUser,
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime
    }, false, error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred while processing admin request',
      code: 'INTERNAL_SERVER_ERROR',
      requestId: `admin_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Manual test endpoint to verify abandoned cart processing (Admin endpoint)
export const testAbandonedCartProcessing = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const adminUser = (req as any).user?.id || 'unknown';
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    auditLog('test_processing_started', 'system', { 
      adminUser, 
      clientIP, 
      requestId 
    }, true);
    
    const result = await processAbandonedCarts();
    const processingTime = Date.now() - startTime;
    
    auditLog('test_processing_success', 'system', {
      adminUser,
      emailsSent: result.sent,
      errors: result.errors,
      processingTimeMs: processingTime,
      requestId
    }, true);
    
    return res.status(200).json({
      success: true,
      message: 'Abandoned cart processing test completed successfully',
      data: {
        emailsSent: result.sent,
        errors: result.errors,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
        requestId
      },
      metadata: {
        source: 'admin_test',
        adminUser,
        version: '1.0.0'
      }
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('Error in test abandoned cart processing:', error);
    auditLog('test_processing_error', 'system', {
      adminUser,
      error: error.message,
      stack: error.stack,
      processingTimeMs: processingTime,
      requestId
    }, false, error.message);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to test abandoned cart processing',
      code: 'TEST_PROCESSING_ERROR',
      requestId,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};
