"use client";

import { useStore } from "../../../store";
import useUser from "../../../hooks/useUser";
import useLocationTracking from "../../../hooks/useLocationTracking";
import useDeviceTracking from "../../../hooks/useDeviceTracking";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SideCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SideCart({ isOpen, onClose }: SideCartProps) {
  const { cart, updateCartItemQuantity, removeFromCart } = useStore();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setIsAnimating(false), 300);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const safeParsePrice = (price: any): number => {
    if (typeof price === 'number' && !isNaN(price)) return price;
    if (typeof price === 'string') {
      const parsed = parseFloat(price.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const totalItems = cart?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0;
  const totalPrice = cart?.reduce((sum: number, item: any) => {
    const price = safeParsePrice(item.price);
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0) || 0;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, user, location, deviceInfo);
    } else {
      updateCartItemQuantity(itemId, newQuantity, user, location, deviceInfo);
    }
  };

  return (
    <>
      {(isOpen || isAnimating) && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
              }`}
              onClick={onClose}
            />
            <div className={`fixed right-0 top-0 h-full w-full max-w-md transform transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
              <div className="flex h-full flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Shopping Cart
                    </h2>
                    <p className="text-sm text-gray-500">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {!user?.id ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="h-10 w-10 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Sign in to shop
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-sm">
                        Create an account or sign in to save items, track orders, and enjoy a personalized shopping experience.
                      </p>
                      <div className="space-y-3 w-full max-w-xs">
                        <Link
                          href="/login"
                          className="block w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                          onClick={onClose}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          className="block w-full border border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-lg font-medium transition-colors text-center"
                          onClick={onClose}
                        >
                          Create Account
                        </Link>
                      </div>
                    </div>
                  ) : cart?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Your cart is empty
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Discover amazing products and add them to your cart!
                      </p>
                      <Link
                        href="/"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        onClick={onClose}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="px-4 py-2">
                      <div className="space-y-3">
                        {cart?.map((item: any) => {
                          const itemPrice = safeParsePrice(item.price || item.sale_price || item.regular_price);
                          const itemQuantity = item.quantity || 1;
                          const itemTotal = itemPrice * itemQuantity;
                          
                          return (
                            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <img
                                    src={item.images?.[0]?.url || item.image || "/assets/categories/default.jpg"}
                                    alt={item.name}
                                    className="h-16 w-16 object-cover rounded-md border"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                    {item.title || item.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 mb-2">
                                    ${itemPrice.toFixed(2)} each
                                  </p>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => handleQuantityChange(item.id, itemQuantity - 1)}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                                        disabled={itemQuantity <= 1}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </button>
                                      <span className="px-3 py-1 bg-gray-50 rounded text-sm font-medium min-w-[2.5rem] text-center">
                                        {itemQuantity}
                                      </span>
                                      <button
                                        onClick={() => handleQuantityChange(item.id, itemQuantity + 1)}
                                        className={`p-1 rounded transition-all ${
                                          itemQuantity >= (item.stock || 0)
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                        }`}
                                        disabled={itemQuantity >= (item.stock || 0)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </button>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      <span className="text-sm font-semibold text-gray-900">
                                        ${itemTotal.toFixed(2)}
                                      </span>
                                      <button
                                        onClick={() => removeFromCart(item.id, user, location, deviceInfo)}
                                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {user?.id && cart?.length > 0 && (
                  <div className="border-t bg-gray-50 px-4 py-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subtotal ({totalItems} items)</span>
                        <span className="text-lg font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 border">
                        {totalPrice >= 5000 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-700">
                              🎉 Your order qualifies for free shipping!
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Free shipping at $5,000</span>
                              <span className="text-sm font-medium text-gray-900">
                                ${(5000 - totalPrice).toFixed(2)} to go
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((totalPrice / 5000) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Link
                          href="/cart"
                          className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-lg font-semibold transition-colors shadow-sm"
                          onClick={onClose}
                        >
                          View Cart & Checkout
                        </Link>
                        <button
                          onClick={onClose}
                          className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-center py-3 rounded-lg font-medium transition-colors"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
