"use client";

import { ShoppingCart, Heart, User, MessageCircle } from "lucide-react";
import Link from "next/link";

interface LoginPromptProps {
  action: "cart" | "wishlist" | "chat";
  onClose?: () => void;
}

export default function LoginPrompt({ action, onClose }: LoginPromptProps) {
  const actionText = action === "cart" ? "add items to your cart" : action === "wishlist" ? "add items to your wishlist" : "chat with sellers";
  const Icon = action === "cart" ? ShoppingCart : action === "wishlist" ? Heart : MessageCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Login Required
          </h3>
          <p className="text-gray-600">
            You need to be logged in to {actionText}. Join thousands of satisfied customers!
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            onClick={onClose}
          >
            <User className="inline h-4 w-4 mr-2" />
            Log In
          </Link>
          
          <Link
            href="/signup"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors"
            onClick={onClose}
          >
            Create Account
          </Link>
          
          {onClose && (
            <button
              onClick={onClose}
              className="block w-full text-gray-500 hover:text-gray-700 py-2 font-medium transition-colors"
            >
              Continue Browsing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
