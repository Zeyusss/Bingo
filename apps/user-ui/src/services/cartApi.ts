import axios from '../utils/axiosInstance';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  regular_price: number;
  sale_price?: number;
  image: string;
  quantity: number;
  shopId: string;
  stock: number;
  slug: string;
  cartItemId: string;
  createdAt: string;
}

export interface CartResponse {
  success: boolean;
  cart: CartItem[];
  message?: string;
}

export interface CartActionResponse {
  success: boolean;
  message: string;
  cartItem?: any;
}


export const getCartItems = async (): Promise<CartResponse> => {
  try {
    const response = await axios.get('/product/api/cart');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cart items:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch cart items');
  }
};


export const addToCart = async (productId: string, quantity: number = 1): Promise<CartActionResponse> => {
  try {
    const response = await axios.post('/product/api/cart/add', {
      productId,
      quantity
    });
    return response.data;
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to add item to cart');
  }
};


export const updateCartItemQuantity = async (productId: string, quantity: number): Promise<CartActionResponse> => {
  try {
    const response = await axios.put('/product/api/cart/update', {
      productId,
      quantity
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    throw new Error(error.response?.data?.message || 'Failed to update cart item');
  }
};


export const removeFromCart = async (productId: string): Promise<CartActionResponse> => {
  try {
    const response = await axios.delete(`/product/api/cart/remove/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error removing from cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
  }
};


export const clearCart = async (): Promise<CartActionResponse> => {
  try {
    const response = await axios.delete('/product/api/cart/clear');
    return response.data;
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
};
