import { create } from "zustand";
import { persist } from "zustand/middleware";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  compare: Product[];
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
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      compare: [],

      // add to cart
      addToCart: (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.cart?.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: (item.quantity ?? 1) + (product.quantity ?? 1),
                    }
                  : item
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              { ...product, quantity: product.quantity ?? 1 },
            ],
          };
        });
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
      // add to wishlist
      addToWishlist: (product, user, location, deviceInfo) => {
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
    if (state.compare.find((item) => item.id === product.id)) return state;
    return { compare: [...state.compare, product] };
  });
},
removeFromCompare: (id) => {
  set((state) => ({
    compare: state.compare.filter((item) => item.id !== id),
  }));
},
    }),
    { name: "store-storage" }
  )
);
