"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "../../store";
import {
  ShoppingCart,
  Heart,
  User,
  Home,
  BarChart2,
  Store,
} from "lucide-react";
import ScrollToTopButton from "../components/homepage/ScrollToTopButton";
 

const MobileBottomNav = () => {
  const pathname = usePathname();
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const compare = useStore((state) => state.compare);

  const totalCartItems = cart.reduce(
    (sum, item) => sum + (item.quantity ?? 1),
    0
  );

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: Store },
    { href: "/wishlist", label: "Wishlist", icon: Heart, count: wishlist.length },
    { href: "/compare", label: "Compare", icon: BarChart2 },
    { href: "/cart", label: "Cart", icon: ShoppingCart, count: totalCartItems },
    { href: "/profile", label: "Account", icon: User },
  ];

  return (
    <>
      <ScrollToTopButton />
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-md flex justify-around py-2 lg:hidden">
        {navItems.map(({ href, label, icon: Icon, count }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center text-[11px] text-gray-700"
            >
              <div className="relative w-6 h-6 mb-1 flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-orange-500" : "text-gray-700"
                  }`}
                />
                {count && count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {count}
                  </span>
                )}
              </div>
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default MobileBottomNav;
