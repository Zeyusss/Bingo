"use client";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import useUser from "../../hooks/useUser";
import { useStore } from "../../store";
import ProfileIcon from "../../assets/svgs/profile-icon";
import HeartIcon from "../../assets/svgs/heart-icon";
import CompareIcon from "../../assets/svgs/compare-icon";
import axiosInstance from "../../utils/axiosInstance";
import { useState } from "react";

const HeaderMain = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const compare = useStore((state: any) => state.compare);

  const totalCartItems = cart.reduce(
    (sum: number, item: any) => sum + (item.quantity ?? 1),
    0
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const handleSearchClick = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSuggestions(true);
    try {
      const res = await axiosInstance.get(`/api/search?query=${searchQuery}`);
      setSuggestions(res.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="w-[80%] mx-auto hidden lg:flex items-center justify-between py-4">
      <Link href={"/"}>
        <span className="text-2xl font-semibold text-black">Bingo</span>
      </Link>
      <div className="w-[50%] relative">
        <div className="flex items-center h-[55px] bg-white border border-gray-200 rounded-full px-4 w-full">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search for products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none outline-none font-Poppins font-medium"
          />
        </div>
        {suggestions.length > 0 && (
          <div className="absolute w-full top-[60px] bg-white border z-10 rounded-md overflow-hidden">
            {suggestions.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                onClick={() => {
                  setSuggestions([]);
                  setSearchQuery("");
                }}
                className="block px-4 py-2 text-sm hover:bg-orange-500 hover:text-white transition"
              >
                {item.title}
              </Link>
            ))}
          </div>
        )}
        {loadingSuggestions && (
          <div className="absolute w-full top-[60px] bg-white border px-4 py-2 text-sm">
            Searching...
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link href="/compare" className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
          <CompareIcon />
          {compare.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {compare.length}
            </div>
          )}
        </Link>

        {user?.id && (
          <Link href="/wishlist" className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200">
            <HeartIcon />
            {wishlist.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {wishlist.length}
              </div>
            )}
          </Link>
        )}

        {!isLoading && user ? (
          <Link href="/profile" className="px-4 py-2 rounded-full bg-gray-100 flex items-center gap-2 border border-gray-200 hover:bg-gray-200">
            <ProfileIcon />
            <span className="text-sm font-medium">{user?.name?.split(" ")[0]}</span>
          </Link>
        ) : (
          <Link href="/login" className="px-4 py-2 rounded-full bg-gray-100 flex items-center gap-2 border border-gray-200 hover:bg-gray-200">
            <ProfileIcon />
            <span className="text-sm font-medium">Login / Register</span>
          </Link>
        )}

        {user?.id && (
          <Link href="/cart" className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
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
  );
};

export default HeaderMain;

