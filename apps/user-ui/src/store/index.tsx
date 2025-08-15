import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as cartApi from '../services/cartApi';
import * as wishlistApi from '../services/wishlistApi';

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
  stock?: number;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  compare: Product[];
  showSideCart: boolean;
  showLoginPrompt: {
    show: boolean;
    action: "cart" | "wishlist" | "chat" | null;
  };
  showPersonalizationModal: {
    show: boolean;
    type: "required" | "optional" | null;
    product: any;
  };
  isLoadingCart: boolean;
  isLoadingWishlist: boolean;
  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  removeFromCart: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  updateCartItemQuantity: (
    id: string,
    quantity: number,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: string
  ) => void;
  removeFromWishlist: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: string) => void;
  toggleSideCart: () => void;
  closeSideCart: () => void;
  closeLoginPrompt: () => void;
  showChatLoginPrompt: () => void;
  showPersonalizationPrompt: (type: "required" | "optional", product: any) => void;
  closePersonalizationModal: () => void;
  clearCart: () => void;
  clearWishlist: () => void;
  clearAllUserData: () => void;
  clearSessionData: () => void;
  getAuthenticatedCart: (user: any) => Product[];
  loadCartFromBackend: (user: any) => Promise<void>;
  loadWishlistFromBackend: (user: any) => Promise<void>;
  syncCartWithBackend: boolean;
  syncWishlistWithBackend: boolean;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      compare: [],
      showSideCart: false,
      showLoginPrompt: { show: false, action: null },
      showPersonalizationModal: { show: false, type: null, product: null },
      isLoadingCart: false,
      isLoadingWishlist: false,
      syncCartWithBackend: true,
      syncWishlistWithBackend: true,

      addToCart: async (product, user, location, deviceInfo) => {
        if (!user?.id) {
          set({ showLoginPrompt: { show: true, action: "cart" } });
          return;
        }

        try {
         
          const response = await cartApi.addToCart(product.id, product.quantity ?? 1);
          
          if (response.success) {
   
            set((state) => {
              const existing = state.cart?.find((item) => item.id === product.id);
              const requestedQuantity = product.quantity ?? 1;
              
              if (existing) {
                return {
                  cart: state.cart.map((item) =>
                    item.id === product.id
                      ? {
                          ...item,
                          quantity: (item.quantity ?? 1) + requestedQuantity,
                        }
                      : item
                  ),
                };
              }
              
              return {
                cart: [
                  ...state.cart,
                  { ...product, quantity: requestedQuantity },
                ],
              };
            });

            set({ showSideCart: true });

           
            if (location && deviceInfo) {

              fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: user?.id,
                  productId: product?.id,
                  shopId: product?.shopId,
                  action: "add_to_cart",
                  country: location?.country || "Unknown",
                  city: location?.city || "Unknown",
                  device: deviceInfo || "Unknown Device",
                }),
              }).catch(error => {
                console.warn('Analytics tracking failed (non-critical):', error);
              });
            }
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
          
          console.warn('Backend unavailable - adding to cart locally only');
          

          set((state) => {
            const existing = state.cart?.find((item) => item.id === product.id);
            const requestedQuantity = product.quantity ?? 1;
            
            if (existing) {
              return {
                cart: state.cart.map((item) =>
                  item.id === product.id
                    ? {
                        ...item,
                        quantity: (item.quantity ?? 1) + requestedQuantity,
                      }
                    : item
                ),
              };
            }
            
            return {
              cart: [
                ...state.cart,
                { ...product, quantity: requestedQuantity },
              ],
            };
          });

          set({ showSideCart: true });
        }
      },

 
      removeFromCart: async (id, user, location, deviceInfo) => {
        if (!user?.id) return;

        try {

          const response = await cartApi.removeFromCart(id);
          
          if (response.success) {
           
            const removeProduct = get().cart.find((item) => item.id === id);
            

            set((state) => ({
              cart: state.cart?.filter((item) => item.id !== id),
            }));

        
            if (location && deviceInfo && removeProduct) {

              fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: user?.id,
                  productId: removeProduct?.id,
                  shopId: removeProduct?.shopId,
                  action: "remove_from_cart",
                  country: location?.country || "Unknown",
                  city: location?.city || "Unknown",
                  device: deviceInfo || "Unknown Device",
                }),
              }).catch(error => {
                console.warn('Analytics tracking failed (non-critical):', error);
              });
            }
          }
        } catch (error) {
          console.error('Error removing from cart:', error);
         
          console.warn('Backend unavailable - removing from cart locally only');
          
 
          const removeProduct = get().cart.find((item) => item.id === id);
          
        
          set((state) => ({
            cart: state.cart?.filter((item) => item.id !== id),
          }));


          if (location && deviceInfo && removeProduct) {
            fetch("/api/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user?.id,
                productId: removeProduct?.id,
                shopId: removeProduct?.shopId,
                action: "remove_from_cart",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device: deviceInfo || "Unknown Device",
              }),
            }).catch(error => {
              console.warn('Analytics tracking failed (non-critical):', error);
            });
          }
        }
      },
      addToWishlist: async (product, user, location, deviceInfo) => {
        if (!user?.id) {
          set({ showLoginPrompt: { show: true, action: "wishlist" } });
          return;
        }

        try {

          const response = await wishlistApi.addToWishlist(product.id);
          
          if (response.success) {

            set((state) => {
              if (state.wishlist.find((item) => item.id === product.id))
                return state;
              return { wishlist: [...state.wishlist, product] };
            });


            if (location && deviceInfo) {

              fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: user?.id,
                  productId: product?.id,
                  shopId: product?.shopId,
                  action: "add_to_wishlist",
                  country: location?.country || "Unknown",
                  city: location?.city || "Unknown",
                  device: deviceInfo || "Unknown Device",
                }),
              }).catch(error => {
                console.warn('Analytics tracking failed (non-critical):', error);
              });
            }
          }
        } catch (error) {
          console.error('Error adding to wishlist:', error);

          console.warn('Backend unavailable - adding to wishlist locally only');
          

          set((state) => {
            if (state.wishlist.find((item) => item.id === product.id))
              return state;
            return { wishlist: [...state.wishlist, product] };
          });


          if (location && deviceInfo) {
            fetch("/api/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user?.id,
                productId: product?.id,
                shopId: product?.shopId,
                action: "add_to_wishlist",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device: deviceInfo || "Unknown Device",
              }),
            }).catch(error => {
              console.warn('Analytics tracking failed (non-critical):', error);
            });
          }
        }
      },
      removeFromWishlist: async (id, user, location, deviceInfo) => {
        if (!user?.id) return;

        try {

          const response = await wishlistApi.removeFromWishlist(id);
          
          if (response.success) {
           
            const removeProduct = get().wishlist.find((item) => item.id === id);


            set((state) => ({
              wishlist: state.wishlist.filter((item) => item.id !== id),
            }));

           
            if (location && deviceInfo && removeProduct) {

              fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: user?.id,
                  productId: removeProduct?.id,
                  shopId: removeProduct?.shopId,
                  action: "remove_from_wishlist",
                  country: location?.country || "Unknown",
                  city: location?.city || "Unknown",
                  device: deviceInfo || "Unknown Device",
                }),
              }).catch(error => {
                console.warn('Analytics tracking failed (non-critical):', error);
              });
            }
          }
        } catch (error) {
          console.error('Error removing from wishlist:', error);

          console.warn('Backend unavailable - removing from wishlist locally only');
          
        
          const removeProduct = get().wishlist.find((item) => item.id === id);


          set((state) => ({
            wishlist: state.wishlist.filter((item) => item.id !== id),
          }));

        
          if (location && deviceInfo && removeProduct) {
            fetch("/api/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user?.id,
                productId: removeProduct?.id,
                shopId: removeProduct?.shopId,
                action: "remove_from_wishlist",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device: deviceInfo || "Unknown Device",
              }),
            }).catch(error => {
              console.warn('Analytics tracking failed (non-critical):', error);
            });
          }
        }
      },
      addToCompare: (product) => {
        set((state) => {
          if (state.compare.find((item) => item.id === product.id))
            return state;
          return { compare: [...state.compare, product] };
        });
      },
      removeFromCompare: (id) => {
        set((state) => ({
          compare: state.compare.filter((item) => item.id !== id),
        }));
      },
      toggleSideCart: () => {
        set((state) => ({ showSideCart: !state.showSideCart }));
      },
      closeSideCart: () => {
        set({ showSideCart: false });
      },

      updateCartItemQuantity: (id, quantity, user, location, deviceInfo) => {
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id === id) {
              const itemStock = item.stock ?? 0;
              
              if (quantity <= 0) {
                return { ...item, quantity: 1 };
              } else if (itemStock > 0 && quantity > itemStock) {
                return { ...item, quantity: itemStock }; 
              } else {
                return { ...item, quantity };
              }
            }
            return item;
          }),
        }));

        //send analytics event via API
        if (user?.id && location && deviceInfo) {
          fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user?.id,
              productId: id,
              shopId: get().cart.find((item) => item.id === id)?.shopId,
              action: "update_cart_quantity",
              country: location?.country || "Unknown",
              city: location?.city || "Unknown",
              device: deviceInfo || "Unknown Device",
            }),
          });
        }
      },
      closeLoginPrompt: () => {
        set({ showLoginPrompt: { show: false, action: null } });
      },
      showChatLoginPrompt: () => {
        set({ showLoginPrompt: { show: true, action: "chat" } });
      },
      showPersonalizationPrompt: (type: "required" | "optional", product: any) => {
        set({ showPersonalizationModal: { show: true, type, product } });
      },
      closePersonalizationModal: () => {
        set({ showPersonalizationModal: { show: false, type: null, product: null } });
      },
      clearCart: () => {
        set({ cart: [] });
      },
      clearWishlist: () => {
        set({ wishlist: [] });
      },
      clearAllUserData: () => {
        set({ 
          cart: [], 
          wishlist: [], 
          compare: [],
          showSideCart: false,
          showLoginPrompt: { show: false, action: null },
          showPersonalizationModal: { show: false, type: null, product: null }
        });
      },
      clearSessionData: () => {
       
        set({ 
          cart: [], 
          wishlist: [], 
          compare: [],
          showSideCart: false,
          showLoginPrompt: { show: false, action: null },
          showPersonalizationModal: { show: false, type: null, product: null }
        });
        
        
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('store-storage', JSON.stringify({
              state: {
                cart: [],
                wishlist: [], 
                compare: [],
                showSideCart: false,
                showLoginPrompt: { show: false, action: null },
                showPersonalizationModal: { show: false, type: null, product: null }
              },
              version: 0
            }));
          } catch (error) {
            console.error('Failed to persist store to localStorage:', error);
          }
        }
      },
      getAuthenticatedCart: (user: any) => {

        const state = get();
        return user?.id ? state.cart : [];
      },


      loadCartFromBackend: async (user: any) => {
        if (!user?.id) return;
        
        set({ isLoadingCart: true });
        try {
          const response = await cartApi.getCartItems();
          if (response.success) {
            set({ cart: response.cart });
          }
        } catch (error) {
          console.error('Error loading cart from backend:', error);
        } finally {
          set({ isLoadingCart: false });
        }
      },


      loadWishlistFromBackend: async (user: any) => {
        if (!user?.id) return;
        
        set({ isLoadingWishlist: true });
        try {
          const response = await wishlistApi.getWishlistItems();
          if (response.success) {
            set({ wishlist: response.wishlist });
          }
        } catch (error) {
          console.error('Error loading wishlist from backend:', error);
        } finally {
          set({ isLoadingWishlist: false });
        }
      },
    }),
    { name: "store-storage" }
  )
);
