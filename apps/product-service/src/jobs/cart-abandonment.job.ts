import cron from 'node-cron';
import { processAbandonedCarts } from '../services/abandonedCart.service';
import prisma from '@packages/libs/prisma';

// Audit logging helper for cron jobs
const cronAuditLog = (jobName: string, action: string, details: any, success: boolean, error?: string) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    jobName,
    action,
    details,
    success,
    error,
    service: 'abandoned-cart-cron'
  };
  console.log(`CRON_AUDIT: ${JSON.stringify(logEntry)}`);
};

// ===== JOB 1: DAILY EMAIL REMINDERS =====
// Runs daily at 10:00 AM UTC to send reminder emails for recently abandoned carts
const dailyReminderJob = cron.schedule('0 10 * * *', async () => {
  const startTime = Date.now();
  const jobId = `daily_${Date.now()}`;
  
  try {
    cronAuditLog('daily_reminder', 'started', { jobId }, true);
    
    const result = await processAbandonedCarts();
    const processingTime = Date.now() - startTime;
    
    cronAuditLog('daily_reminder', 'completed', {
      jobId,
      emailsSent: result.sent,
      errors: result.errors,
      processingTimeMs: processingTime
    }, true);
    
    // Critical logging for monitoring
    if (result.errors > 0) {
      console.error(`CRITICAL: Daily reminder job encountered ${result.errors} errors`);
    }
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('CRITICAL: Error in daily reminder job:', error);
    cronAuditLog('daily_reminder', 'failed', {
      jobId,
      error: error.message,
      processingTimeMs: processingTime
    }, false, error.message);
  }
}, {
  timezone: "UTC"
});

// ===== JOB 2: FOLLOW-UP EMAIL REMINDERS =====
// Runs every 3 days at 2:00 PM UTC for follow-up emails
const followUpReminderJob = cron.schedule('0 14 */3 * *', async () => {
  const startTime = Date.now();
  const jobId = `followup_${Date.now()}`;
  
  try {
    cronAuditLog('followup_reminder', 'started', { jobId }, true);
    
    const result = await processAbandonedCarts();
    const processingTime = Date.now() - startTime;
    
    cronAuditLog('followup_reminder', 'completed', {
      jobId,
      emailsSent: result.sent,
      errors: result.errors,
      processingTimeMs: processingTime
    }, true);
    
    // Critical logging for monitoring
    if (result.errors > 0) {
      console.error(`CRITICAL: Follow-up reminder job encountered ${result.errors} errors`);
    }
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('CRITICAL: Error in follow-up reminder job:', error);
    cronAuditLog('followup_reminder', 'failed', {
      jobId,
      error: error.message,
      processingTimeMs: processingTime
    }, false, error.message);
  }
}, {
  timezone: "UTC"
});

// ===== JOB 3: WEEKLY CLEANUP (7+ DAYS OLD) =====
// Runs every Sunday at 3:00 AM UTC to delete carts abandoned for more than 7 days
const weeklyCleanupJob = cron.schedule('0 3 * * 0', async () => {
  const startTime = Date.now();
  const jobId = `weekly_cleanup_${Date.now()}`;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  try {
    cronAuditLog('weekly_cleanup', 'started', { 
      jobId, 
      cutoffDate: sevenDaysAgo.toISOString() 
    }, true);
    
    // Efficient MongoDB query to delete old abandoned carts
    const deleteResult = await prisma.abandoned_carts.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo
        }
      }
    });
    
    // Also clean up related cart items older than 7 days
    const cartItemsDeleteResult = await prisma.cart_items.deleteMany({
      where: {
        createdAt: {
          lt: sevenDaysAgo
        },
       
        updatedAt: {
          lt: sevenDaysAgo
        }
      }
    });
    
    const processingTime = Date.now() - startTime;
    
    cronAuditLog('weekly_cleanup', 'completed', {
      jobId,
      abandonedCartsDeleted: deleteResult.count,
      cartItemsDeleted: cartItemsDeleteResult.count,
      cutoffDate: sevenDaysAgo.toISOString(),
      processingTimeMs: processingTime
    }, true);
    
    // Critical logging for monitoring
    if (deleteResult.count > 0) {
      console.log(`Weekly cleanup: Deleted ${deleteResult.count} abandoned carts older than 7 days`);
    }
    
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('CRITICAL: Error in weekly cleanup job:', error);
    cronAuditLog('weekly_cleanup', 'failed', {
      jobId,
      error: error.message,
      cutoffDate: sevenDaysAgo.toISOString(),
      processingTimeMs: processingTime
    }, false, error.message);
  }
}, {
  timezone: "UTC"
});

// ===== JOB 4: MONTHLY DEEP CLEANUP (30+ DAYS OLD) =====
// Runs on the 1st of every month at 4:00 AM UTC to delete any remaining carts older than 30 days
const monthlyDeepCleanupJob = cron.schedule('0 4 1 * *', async () => {
  const startTime = Date.now();
  const jobId = `monthly_cleanup_${Date.now()}`;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  try {
    cronAuditLog('monthly_deep_cleanup', 'started', { 
      jobId, 
      cutoffDate: thirtyDaysAgo.toISOString() 
    }, true);
    
    // Deep cleanup: Remove any carts older than 30 days (safety net)
    const deleteResult = await prisma.abandoned_carts.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    // Clean up orphaned cart items
    const cartItemsDeleteResult = await prisma.cart_items.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    // Clean up orphaned abandoned_carts records (users with no cart items)
    const orphanedAbandonedCartsResult = await prisma.abandoned_carts.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        user: {
          cartItems: {
            none: {}
          }
        }
      }
    });
    
    const processingTime = Date.now() - startTime;
    
    cronAuditLog('monthly_deep_cleanup', 'completed', {
      jobId,
      abandonedCartsDeleted: deleteResult.count,
      cartItemsDeleted: cartItemsDeleteResult.count,
      orphanedAbandonedCartsDeleted: orphanedAbandonedCartsResult.count,
      cutoffDate: thirtyDaysAgo.toISOString(),
      processingTimeMs: processingTime
    }, true);
    
    // Critical logging for monitoring
    const totalDeleted = deleteResult.count + cartItemsDeleteResult.count + orphanedAbandonedCartsResult.count;
    if (totalDeleted > 0) {
      console.log(`Monthly deep cleanup: Deleted ${totalDeleted} total records older than 30 days`);
    }
    
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error('CRITICAL: Error in monthly deep cleanup job:', error);
    cronAuditLog('monthly_deep_cleanup', 'failed', {
      jobId,
      error: error.message,
      cutoffDate: thirtyDaysAgo.toISOString(),
      processingTimeMs: processingTime
    }, false, error.message);
  }
}, {
  timezone: "UTC"
});

// Initialize and log all cron jobs
console.log('Abandoned cart cron jobs initialized:');
console.log('Daily reminders: Every day at 10:00 AM UTC');
console.log('Follow-up reminders: Every 3 days at 2:00 PM UTC');
console.log('Weekly cleanup: Every Sunday at 3:00 AM UTC (>7 days)');
console.log('Monthly deep cleanup: 1st of month at 4:00 AM UTC (>30 days)');

export { 
  dailyReminderJob, 
  followUpReminderJob, 
  weeklyCleanupJob, 
  monthlyDeepCleanupJob 
};
