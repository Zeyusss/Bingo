import { create } from "zustand";
import { persist } from "zustand/middleware";

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
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      compare: [],
      showSideCart: false,
      showLoginPrompt: { show: false, action: null },

      addToCart: (product, user, location, deviceInfo) => {
        if (!user?.id) {
          set({ showLoginPrompt: { show: true, action: "cart" } });
          return;
        }

        set((state) => {
          const existing = state.cart?.find((item) => item.id === product.id);
          const requestedQuantity = product.quantity ?? 1;
          const productStock = product.stock ?? 0;
          
          // If no stock available, don't add anything
          if (productStock === 0) {
            return state;
          }
          
          if (existing) {
            const currentQuantity = existing.quantity ?? 1;
            const newQuantity = currentQuantity + requestedQuantity;
            
            
            if (productStock > 0 && newQuantity > productStock) {
              
              const availableToAdd = Math.max(0, productStock - currentQuantity);
              if (availableToAdd > 0) {
                return {
                  cart: state.cart.map((item) =>
                    item.id === product.id
                      ? {
                          ...item,
                          quantity: currentQuantity + availableToAdd,
                        }
                      : item
                  ),
                };
              }
              
              return state;
            }
            
            
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: newQuantity,
                    }
                  : item
              ),
            };
          }
          
          
          if (productStock > 0 && requestedQuantity > productStock) {
            
            return {
              cart: [
                ...state.cart,
                { ...product, quantity: productStock },
              ],
            };
          }
          
         
          return {
            cart: [
              ...state.cart,
              { ...product, quantity: requestedQuantity },
            ],
          };
        });

        if (user?.id) {
          set({ showSideCart: true });
        }

        //send analytics event via API
        if (user?.id && location && deviceInfo) {
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
          });
        }
      },

      //remove from cart
      removeFromCart: (id, user, location, deviceInfo) => {
        //find product
        const removeProduct = get().cart.find((item) => item.id === id);
        set((state) => ({
          cart: state.cart?.filter((item) => item.id !== id),
        }));
        //send analytics event via API
        if (user?.id && location && deviceInfo && removeProduct) {
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
          });
        }
      },
      addToWishlist: (product, user, location, deviceInfo) => {
        if (!user?.id) {
          set({ showLoginPrompt: { show: true, action: "wishlist" } });
          return;
        }

        set((state) => {
          if (state.wishlist.find((item) => item.id === product.id))
            return state;
          return { wishlist: [...state.wishlist, product] };
        });

        if (user?.id && location && deviceInfo) {
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
          });
        }
      },
      removeFromWishlist: (id, user, location, deviceInfo) => {
        const removeProduct = get().wishlist.find((item) => item.id === id);

        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));

        //send analytics event via API
        if (user?.id && location && deviceInfo && removeProduct) {
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
          });
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
    }),
    { name: "store-storage" }
  )
);
