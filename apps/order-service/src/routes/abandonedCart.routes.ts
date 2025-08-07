import { Router } from 'express';
import {
  trackAbandonedCart,
  getAbandonedCarts,
  markEmailSent,
  optOutFromEmails,
  removeAbandonedCart,
  sendEmailReminder
} from '../controllers/abandonedCart.controller';

const router = Router();

router.post('/track', trackAbandonedCart);
router.get('/list/:userId?', getAbandonedCarts);
router.put('/email-sent/:userId', markEmailSent);
router.put('/opt-out/:userId', optOutFromEmails);
router.delete('/remove/:userId', removeAbandonedCart);
router.post('/send-reminder/:userId', sendEmailReminder);

export default router;
