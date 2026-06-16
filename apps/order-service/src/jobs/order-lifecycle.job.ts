import cron from 'node-cron';
import prisma from '@packages/libs/prisma';
import { sendEmail } from '../utils/send-email';
import { createLogger } from '@packages/utils/logs/structured-logger';

const logger = createLogger('order-service');

const ABANDONMENT_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
const RECOVERY_EMAIL_DELAY_MS = 60 * 60 * 1000;  // 1 hour after abandonment
const CLEANUP_AGE_DAYS = 30;

// ─── Job 1: Mark stale pending_payment orders as abandoned ───────────────────
// Runs every 15 minutes. Finds orders stuck in pending_payment for > 1 hour
// (i.e. user started checkout but never completed payment) and marks them abandoned.
const markAbandonedJob = cron.schedule('*/15 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - ABANDONMENT_THRESHOLD_MS);

    const result = await prisma.orders.updateMany({
      where: {
        status: 'pending_payment',
        createdAt: { lt: cutoff },
      },
      data: {
        status: 'abandoned',
      },
    });

    if (result.count > 0) {
      logger.info(`[order-lifecycle] Marked ${result.count} orders as abandoned`);
    }
  } catch (error) {
    logger.error(`[order-lifecycle] markAbandonedJob failed: ${error}`);
  }
});

// ─── Job 2: Send recovery emails for abandoned orders ────────────────────────
// Runs every 30 minutes. Finds abandoned orders where no recovery email has been
// sent yet and the order has been abandoned for at least 1 hour.
// Fetches product details for the email template, sends the email, marks sentAt.
const sendRecoveryEmailsJob = cron.schedule('*/30 * * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - RECOVERY_EMAIL_DELAY_MS);

    const abandonedOrders = await prisma.orders.findMany({
      where: {
        status: 'abandoned',
        recoveryEmailSentAt: null,
        updatedAt: { lt: cutoff },
      },
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (abandonedOrders.length === 0) return;

    logger.info(`[order-lifecycle] Sending recovery emails for ${abandonedOrders.length} abandoned orders`);

    for (const order of abandonedOrders) {
      try {
        if (!order.user?.email) continue;

        // Fetch product details for email (title + image)
        const productIds = order.items.map((i) => i.productId);
        const products = await prisma.products.findMany({
          where: { id: { in: productIds } },
          select: { id: true, title: true, images: true },
        });
        const productById = new Map(products.map((p) => [p.id, p]));

        const cartItems = order.items.map((item) => {
          const product = productById.get(item.productId);
          return {
            name: product?.title || 'Product',
            image: (product?.images as { url: string }[])?.[0]?.url || null,
            quantity: item.quantity,
            price: item.price,
          };
        });

        const cartUrl = `${process.env.USER_UI_URL || 'http://localhost:3000'}/cart`;
        const unsubscribeUrl = `${process.env.USER_UI_URL || 'http://localhost:3000'}/unsubscribe?userId=${order.userId}`;

        await sendEmail(
          order.user.email,
          "You left something behind at Bingo!",
          'abandoned-cart',
          {
            userName: order.user.name || 'there',
            cartItems,
            totalAmount: order.total,
            cartUrl,
            unsubscribeUrl,
          }
        );

        await prisma.orders.update({
          where: { id: order.id },
          data: { recoveryEmailSentAt: new Date() },
        });

        logger.info(`[order-lifecycle] Recovery email sent for order ${order.id} to ${order.user.email}`);
      } catch (orderError) {
        logger.error(`[order-lifecycle] Failed to send recovery email for order ${order.id}: ${orderError}`);
      }
    }
  } catch (error) {
    logger.error(`[order-lifecycle] sendRecoveryEmailsJob failed: ${error}`);
  }
});

// ─── Job 3: Clean up old abandoned orders ────────────────────────────────────
// Runs once daily at 3am. Soft-deletes abandoned orders older than 30 days
// to prevent DB bloat, while preserving the data for analytics via isDeleted flag.
const cleanupAbandonedOrdersJob = cron.schedule('0 3 * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - CLEANUP_AGE_DAYS * 24 * 60 * 60 * 1000);

    const result = await prisma.orders.updateMany({
      where: {
        status: 'abandoned',
        createdAt: { lt: cutoff },
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    if (result.count > 0) {
      logger.info(`[order-lifecycle] Soft-deleted ${result.count} old abandoned orders`);
    }
  } catch (error) {
    logger.error(`[order-lifecycle] cleanupAbandonedOrdersJob failed: ${error}`);
  }
});

export { markAbandonedJob, sendRecoveryEmailsJob, cleanupAbandonedOrdersJob };
