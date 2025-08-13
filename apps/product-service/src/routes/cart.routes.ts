import { Router } from 'express';
import {
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router = Router();


router.use(isAuthenticated);


router.get('/', getCartItems);

router.post('/add', addToCart);

router.put('/update', updateCartItemQuantity);


router.delete('/remove/:productId', removeFromCart);


router.delete('/clear', clearCart);

export default router;
