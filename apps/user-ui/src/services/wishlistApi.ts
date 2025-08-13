import axios from '../utils/axiosInstance';

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  regular_price: number;
  sale_price?: number;
  image: string;
  shopId: string;
  stock: number;
  slug: string;
  wishlistItemId: string;
  createdAt: string;
}

export interface WishlistResponse {
  success: boolean;
  wishlist: WishlistItem[];
  message?: string;
}

export interface WishlistActionResponse {
  success: boolean;
  message: string;
  wishlistItem?: any;
}

export interface WishlistCheckResponse {
  success: boolean;
  isInWishlist: boolean;
}


export const getWishlistItems = async (): Promise<WishlistResponse> => {
  try {
    const response = await axios.get('/product/api/wishlist');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching wishlist items:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch wishlist items');
  }
};


export const addToWishlist = async (productId: string): Promise<WishlistActionResponse> => {
  try {
    const response = await axios.post('/product/api/wishlist/add', {
      productId
    });
    return response.data;
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    throw new Error(error.response?.data?.message || 'Failed to add item to wishlist');
  }
};


export const removeFromWishlist = async (productId: string): Promise<WishlistActionResponse> => {
  try {
    const response = await axios.delete(`/product/api/wishlist/remove/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove item from wishlist');
  }
};


export const clearWishlist = async (): Promise<WishlistActionResponse> => {
  try {
    const response = await axios.delete('/product/api/wishlist/clear');
    return response.data;
  } catch (error: any) {
    console.error('Error clearing wishlist:', error);
    throw new Error(error.response?.data?.message || 'Failed to clear wishlist');
  }
};


export const isInWishlist = async (productId: string): Promise<WishlistCheckResponse> => {
  try {
    const response = await axios.get(`/product/api/wishlist/check/${productId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error checking wishlist status:', error);
    throw new Error(error.response?.data?.message || 'Failed to check wishlist status');
  }
};
