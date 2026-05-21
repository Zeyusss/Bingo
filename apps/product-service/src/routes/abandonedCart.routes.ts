import { Router } from 'express';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isAdmin } from "@packages/middleware/authorizeRoles";
import {
  trackAbandonedCartController,
  getAllAbandonedCarts,
  processAbandonedCartsController,
  getAbandonedCartStatsController,
  sendTestAbandonedCartEmail,
  triggerAbandonedCartEmailForUser,
  adminForceAbandonedCartEmail,
  testAbandonedCartProcessing
} from '../controllers/abandonedCart.controller';

const router = Router();

// Public endpoint for tracking abandoned carts (used by frontend)
router.post('/track', trackAbandonedCartController);

// Admin endpoints (protected)
router.get('/all', isAuthenticated, getAllAbandonedCarts);
router.get('/stats', isAuthenticated, getAbandonedCartStatsController);
router.post('/process', isAuthenticated, processAbandonedCartsController);
router.post('/test-email', isAuthenticated, sendTestAbandonedCartEmail);

// automated trigger (restrictive - used by cron jobs)
router.post('/trigger/:userId', isAuthenticated, triggerAbandonedCartEmailForUser);

// admin manual override 
router.post('/admin/force-trigger/:userId', isAuthenticated, isAdmin, adminForceAbandonedCartEmail);

router.post('/test-processing', isAuthenticated, testAbandonedCartProcessing);

export default router;
