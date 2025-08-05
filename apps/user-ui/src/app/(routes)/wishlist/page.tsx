"use client";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "apps/user-ui/src/shared/components/cards/product-card";
import { useState } from "react";
import Footer from "apps/user-ui/src/shared/components/homepage/Footer";

const WishlistPage = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const isAllSelected =
    wishlist.length > 0 && selectedItems.length === wishlist.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlist.map((item: any) => item.id));
    }
  };
  const removeSelectedItems = () => {
    selectedItems.forEach((id) => {
      removeFromWishlist(id, user, location, deviceInfo);
    });
    setSelectedItems([]);
  };

  const removeItem = (id: string) => {
    removeFromWishlist(id, user, location, deviceInfo);
  };
  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };
  return (
<div className="flex flex-col min-h-screen">
  <main className="flex-grow pb-[200px]">

    <div className="md:w-[80%] w-[95%] m-auto">
        <div className="pb-[50px]">
          <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost">
            Wishlist
          </h1>
          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full" />
          <span className="text-[#55585b]">Wishlist</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-24 h-24 text-gray-300 mb-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 7.036a5.754 5.754 0 00-10.248-3.79 5.754 5.754 0 00-10.248 3.79c0 6.27 10.248 11.46 10.248 11.46s10.248-5.19 10.248-11.46z"
              />
            </svg>
            <h2 className="text-3xl font-bold mb-4">This wishlist is empty.</h2>
            <p className="text-gray-600 text-center max-w-md px-4">
              You don't have any products in the wishlist yet. You will find a
              lot of interesting products on our "Shop" page.
            </p>
            <Link href="/products" className="mt-6">
              <button className="mt-6 bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-full text-lg font-semibold transition duration-300">
                Return to shop
              </button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-6 font-jost">
              Your products wishlist
            </h2>
            {/* Global Action Bar */}
            {selectedItems.length > 0 && (
              <div className="flex justify-between items-center bg-transparent px-4 py-2 rounded-md mb-6 border border-gray-300 shadow-sm">
                <button
                  onClick={removeSelectedItems}
                  className="text-red-600 font-medium hover:underline"
                >
                  × Remove
                </button>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-[14px] h-[14px] accent-orange-500 border border-gray-300 rounded-sm"
                  />
                  <span className="text-sm text-gray-700">Select all</span>
                </label>
              </div>
            )}

            {/* Product Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 ">
              {wishlist.map((product: any) => (
                <div key={product.id} className="relative min-h-[420px] flex flex-col justify-between">

                  {/* Per-card Remove + Checkbox */}
                  <div className="flex justify-between items-center px-1 h-6 mb-2">

                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      × Remove
                    </button>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-[14px] h-[14px] accent-orange-500 border border-gray-300 rounded-sm"
                    />
                  </div>

                  {/* Product Card */}
                  <ProductCard
                    product={product}
                    isEvent={!!product.starting_date}
                    view="grid"
                    isWishlist={true}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      </main>
      <Footer />
    </div>
   
  );
};

export default WishlistPage;
