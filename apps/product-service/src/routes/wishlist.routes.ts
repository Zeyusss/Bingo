import { Router } from 'express';
import {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isInWishlist
} from '../controllers/wishlist.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router = Router();

router.use(isAuthenticated);

router.get('/', getWishlistItems);


router.post('/add', addToWishlist);


router.delete('/remove/:productId', removeFromWishlist);


router.delete('/clear', clearWishlist);


router.get('/check/:productId', isInWishlist);

export default router;
