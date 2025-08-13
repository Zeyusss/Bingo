import { Router } from 'express';
import {
  getAllAbandonedCarts,
  processAbandonedCartsController,
  getAbandonedCartStatsController,
  sendTestAbandonedCartEmail,
  triggerAbandonedCartEmailForUser,
  trackAbandonedCartController
} from '../controllers/abandonedCart.controller';
import isAuthenticated from '../../../../packages/middleware/isAuthenticated';

const router = Router();


router.post('/track', trackAbandonedCartController);


router.get('/all', isAuthenticated, getAllAbandonedCarts);
router.post('/process', isAuthenticated, processAbandonedCartsController);
router.get('/stats', isAuthenticated, getAbandonedCartStatsController);
router.post('/test-email', isAuthenticated, sendTestAbandonedCartEmail);
router.post('/trigger/:userId', isAuthenticated, triggerAbandonedCartEmailForUser);

export default router;
