import { Router } from 'express';
import { isAuthenticated } from '../../../packages/middleware/isAuthenticated';
import {
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller';

const router = Router();

// Get user's cart
router.get('/', isAuthenticated, getUserCart);

// Add item to cart
router.post('/add', isAuthenticated, addToCart);

// Update cart item quantity
router.put('/update', isAuthenticated, updateCartItemQuantity);

// Remove item from cart
router.delete('/remove/:cartItemId', isAuthenticated, removeFromCart);

// Clear entire cart
router.delete('/clear', isAuthenticated, clearCart);

export default router;
