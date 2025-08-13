"use client";

import { ShoppingBag } from "lucide-react";
import { useStore } from "../../../store";
import useUser from "../../../hooks/useUser";

interface FloatingCartButtonProps {
  onClick: () => void;
}

export default function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const { getAuthenticatedCart } = useStore();
  const { user, isLoading } = useUser();
  

  const cart = getAuthenticatedCart(user);
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);


  if (!user || isLoading || totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
      aria-label="Open shopping cart"
    >
      <div className="relative">
        <ShoppingBag size={24} className="transition-transform duration-300 group-hover:scale-110" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium animate-pulse shadow-lg">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </div>
    </button>
  );
}
