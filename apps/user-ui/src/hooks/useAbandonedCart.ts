import { useEffect, useCallback } from 'react';
import { useStore } from '../store';
import useUser from './useUser';
import axiosInstance from '../utils/axiosInstance';

export default function useAbandonedCart() {
  const { cart } = useStore();
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id || !cart?.length) return;

    const trackAbandonedCart = async () => {
      try {
        const items = cart.map(item => ({
          productId: item.id,
          quantity: item.quantity || 1,
          price: item.price,
          productName: item.title,
          productImage: item.image
        }));

        const totalAmount = cart.reduce(
          (total, item) => total + (item.price * (item.quantity || 1)), 
          0
        );

        await axiosInstance.post('/product/api/abandoned-cart/track', {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          items,
          totalAmount
        });
      } catch (error) {
        console.error('Error tracking abandoned cart:', error);
      }
    };

    const timeoutId = setTimeout(trackAbandonedCart, 5 * 60 * 1000);

    return () => clearTimeout(timeoutId);
  }, [cart, user]);

  const removeAbandonedCart = useCallback(async () => {
    if (!user?.id) return;

    try {
      await axiosInstance.delete(`/order/api/abandoned-cart/remove/${user.id}`);
    } catch (error) {
      console.error('Error removing abandoned cart:', error);
    }
  }, [user?.id]);

  const optOutFromEmails = useCallback(async () => {
    if (!user?.id) return;

    try {
      await axiosInstance.put(`/order/api/abandoned-cart/opt-out/${user.id}`);
    } catch (error) {
      console.error('Error opting out:', error);
    }
  }, [user?.id]);

  return {
    removeAbandonedCart,
    optOutFromEmails
  };
}
