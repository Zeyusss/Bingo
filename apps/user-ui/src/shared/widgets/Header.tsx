"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ShoppingCart, Menu } from "lucide-react";
import ProfileIcon from "../../assets/svgs/profile-icon";
import HeartIcon from "../../assets/svgs/heart-icon";
import CompareIcon from "../../assets/svgs/compare-icon";
import useUser from "../../hooks/useUser";
import "../../styles/root.css";
import { useStore } from "../../store";
import TopBar from "../components/homepage/TopBar";
import CategoryBar from "./CategoryBar";
import SidebarMobile from "./SidebarMobile";
import MobileBottomNav from "./MobileBottomNav";
import AdvancedSearchBar from "../components/search/AdvancedSearchBar";
import { useRouter } from "next/navigation";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const compare = useStore((state: any) => state.compare);
  const totalCartItems = cart.reduce(
    (sum: number, item: any) => sum + (item.quantity ?? 1),
    0
  );

  const router = useRouter();

  const [showMobileHeader, setShowMobileHeader] = useState(true);


  useEffect(() => {
  

  if (typeof window === 'undefined') return;
  
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateScroll = () => {
    const currentScrollY = window.scrollY;
    setShowMobileHeader(currentScrollY < lastScrollY);
    lastScrollY = currentScrollY;
    ticking = false;
  };

  const handleScroll = () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  const handleSearch = (query: string, filters?: any) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'relevance') {
          if (Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(','));
          } else if (typeof value === 'boolean') {
            params.set(key, value.toString());
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <TopBar />

      <div
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 lg:hidden border-b bg-white transition-transform duration-300 ${
          showMobileHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Menu className="cursor-pointer" onClick={() => setIsSidebarOpen(true)} />
        <Link href="/" className="text-xl font-bold text-black">
          Bingo
        </Link>
        {user?.id && (
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-5 h-5 text-black" />
            {totalCartItems > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {totalCartItems}
              </div>
            )}
          </Link>
        )}
      </div>


      <div className="h-[60px] lg:hidden" />


      <div className="w-[88%] m-auto items-center justify-between py-4 hidden lg:flex">
        <Link href={"/"}>
          <span className="text-2xl font-semibold text-black">Bingo</span>
        </Link>

        <div className="w-[50%] relative">
          <AdvancedSearchBar
            placeholder="Search for products..."
            onSearch={handleSearch}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/compare"
            className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
          >
            <CompareIcon />
            {compare.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {compare.length}
              </div>
            )}
          </Link>

          {user?.id && (
            <Link
              href="/wishlist"
              className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
            >
              <HeartIcon />
              {wishlist.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlist.length}
                </div>
              )}
            </Link>
          )}

          {user ? (
            <Link
              href="/profile"
              className="px-4 py-2 rounded-full bg-gray-100 flex items-center gap-2 border border-gray-200 hover:bg-gray-200"
            >
              <ProfileIcon />
              <span className="text-sm font-medium">{user?.name?.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-full bg-gray-100 flex items-center gap-2 border border-gray-200 hover:bg-gray-200"
            >
              <ProfileIcon />
              <span className="text-sm font-medium">Login / Register</span>
            </Link>
          )}

          {user?.id && (
            <Link
              href="/cart"
              className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <ShoppingCart className="text-black w-5 h-5" />
              {totalCartItems > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center border border-white">
                  {totalCartItems}
                </div>
              )}
            </Link>
          )}
        </div>
      </div>

      <div className="border-b border-gray-300" />
      <CategoryBar />
      <SidebarMobile isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <MobileBottomNav />
    </div>
  );
};

export default Header;
