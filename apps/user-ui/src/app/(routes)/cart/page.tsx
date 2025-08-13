"use client";
import { useQuery } from "@tanstack/react-query";
import { Phone, Lock, ShieldCheck, Loader2, X } from "lucide-react";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import useAbandonedCart from "apps/user-ui/src/hooks/useAbandonedCart";
import { useStore } from "apps/user-ui/src/store";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import InterestedInCard from "./InterestedInCard";
import ShippingAddressSection from "apps/user-ui/src/shared/components/shippingAddress";
import Footer from "apps/user-ui/src/shared/components/homepage/Footer";

const CartPage = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const { getAuthenticatedCart, removeFromCart } = useStore();
  

  const cart = getAuthenticatedCart(user);
  const { removeAbandonedCart } = useAbandonedCart();

  const [couponCode, setCouponCode] = useState("");
  const [discountProductId, setDiscountProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [storedCouponCode, setStoredCouponCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const subtotal = cart.reduce(
    (total: number, item: any) => total + item.quantity * item.sale_price,
    0
  );

  const { data: addresses = [] } = useQuery<any[], Error>({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
  });

  
  useEffect(() => {
    if (addresses.length && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const decreaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };

  const increaseQuantity = (id: string) => {
    useStore.setState((state: any) => ({
      cart: state.cart.map((item: any) => {
        if (item.id === id) {
          const currentQuantity = item.quantity ?? 1;
          const stock = item.stock ?? 0;
          
          if (stock > 0 && currentQuantity >= stock) {
            return item;
          }
          
          return { ...item, quantity: Math.min(currentQuantity + 1, stock) };
        }
        return item;
      }),
    }));
  };

  const removeItem = (id: string) => {
    removeFromCart(id, user, location, deviceInfo);
  };

  const couponCodeApplyHandler = async () => {
    setError("");
    if (!couponCode.trim()) {
      setError("Coupon code is required!");
      return;
    }
    try {
      const res = await axiosInstance.put("/order/api/verify-coupon", {
        couponCode: couponCode.trim(),
        cart,
      });

      if (res.data.valid) {
        setStoredCouponCode(couponCode.trim());
        setDiscountAmount(parseFloat(res.data.discountAmount));
        setDiscountPercent(res.data.discount);
        setDiscountProductId(res.data.discountedProductId);
        setCouponCode("");
      } else {
        setDiscountAmount(0);
        setDiscountPercent(0);
        setDiscountProductId("");
        setError(res.data.message || "Invalid coupon.");
      }
    } catch (err: any) {
      setDiscountAmount(0);
      setDiscountPercent(0);
      setDiscountProductId("");
      setError(err?.response?.data?.message || "Error verifying coupon.");
    }
  };

  const createPaymentSession = async () => {
    if (!selectedAddressId) {
      toast.error("Please select your address.");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "/order/api/create-payment-session",
        {
          cart,
          selectedAddressId,
          coupon: {
            conde: storedCouponCode,
            discountAmount,
            discountPercent,
            discountProductId,
          },
        }
      );
      router.push(`/checkout?sessionId=${res.data.sessionId}`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-[1240px] mx-auto px-4 py-10">
        <div className="lg:flex gap-8">
          {/* Left side */}
          <div className="w-full lg:w-[70%]">
            {/* Free Shipping Indicator */}
            <div className={`border rounded-md p-4 mb-6 ${
              subtotal >= 5000 
                ? "bg-green-50 border-green-200" 
                : "bg-orange-50 border-orange-200"
            }`}>
              {subtotal >= 5000 ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-green-700">
                      🎉 Your order qualifies for free shipping!
                    </p>
                  </div>
                  <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-green-500 rounded-full" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-orange-600">
                      Free shipping at $5,000
                    </p>
                    <p className="text-sm font-medium text-orange-800">
                      ${(5000 - subtotal).toFixed(2)} to go
                    </p>
                  </div>
                  <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-orange-600 mt-2">
                    Add ${(5000 - subtotal).toFixed(2)} more to your cart for free shipping
                  </p>
                </>
              )}
            </div>
            {/* Cart Items Table */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Shopping Cart Items</h3>
                <p className="text-sm text-gray-600 mt-1">{cart?.length || 0} {cart?.length === 1 ? 'item' : 'items'} in your cart</p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-sm font-medium text-gray-700">
                    <th className="px-6 py-4 w-12"></th>
                    <th className="px-6 py-4">PRODUCT</th>
                    <th className="px-6 py-4 text-center">PRICE</th>
                    <th className="px-6 py-4 text-center">QUANTITY</th>
                    <th className="px-6 py-4 text-right">SUBTOTAL</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item: any) => {
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 group hover:bg-orange-50 transition-colors duration-200"
                    >
                      {/* Remove Button */}
                      <td className="px-6 py-6 align-top">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Product Info */}
                      <td className="px-6 py-6">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Image
                              src={item.images?.[0]?.url || item.image || '/assets/categories/default.jpg'}
                              alt={item.title}
                              width={90}
                              height={90}
                              className="rounded-lg object-cover border border-gray-200 shadow-sm"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-base leading-tight mb-2">
                              {item.title}
                            </h4>
                            <div className="space-y-1">
                              {item?.selectedOptions?.color && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="font-medium">Color:</span>
                                  <span>{item.selectedOptions.color}</span>
                                </div>
                              )}
                              {item?.selectedOptions?.size && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="font-medium">Size:</span>
                                  <span>{item.selectedOptions.size}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-6 text-center">
                        <div className="font-semibold text-gray-900 text-lg">
                          ${(item.price || item.sale_price || item.regular_price || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">per item</div>
                      </td>

                      {/* Quantity */}
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="px-4 py-2 text-gray-700 hover:bg-orange-100 hover:text-orange-500 transition-colors duration-200 font-medium"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="px-4 py-2 text-sm font-medium bg-gray-50 min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className={`px-4 py-2 font-medium transition-colors duration-200 ${
                              item.stock && item.stock > 0 && item.quantity >= item.stock
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-orange-100 hover:text-orange-500'
                            }`}
                            disabled={item.stock && item.stock > 0 && item.quantity >= item.stock}
                          >
                            +
                          </button>
                        </div>
                        {item.stock && item.stock > 0 && (
                          <div className="text-xs text-gray-500 mt-2">
                            {item.stock} in stock
                          </div>
                        )}
                      </td>

                      {/* Subtotal */}
                      <td className="px-6 py-6 text-right">
                        <div className="font-bold text-orange-500 text-lg">
                          ${(item.quantity * (item.price || item.sale_price || item.regular_price || 0)).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>

              {/* Coupon Section */}
              <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 flex-1">
                    <div className="flex-1 max-w-xs">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon?</label>
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all duration-200"
                      />
                    </div>
                    <button
                      onClick={couponCodeApplyHandler}
                      className="bg-orange-400 hover:bg-orange-500 text-white rounded-lg px-6 py-3 font-medium transition-colors duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                    >
                      Apply Coupon
                    </button>
                  </div>
                  
                  {/* Cart Summary */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Cart Total</div>
                    <div className="text-2xl font-bold text-gray-900">${subtotal.toFixed(2)}</div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>


            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Phone className="text-orange-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our customer support team is ready to assist you.{" "}
                    <a href="#" className="text-blue-600 underline hover:text-blue-700 transition-colors">
                      Contact Us
                    </a>
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Lock className="text-orange-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Secure Checkout</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">Your payment information is encrypted and secure.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow duration-200">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <ShieldCheck className="text-orange-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy Protected</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">We respect your privacy and protect your data.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="w-full lg:w-[30%] mt-10 lg:mt-0 space-y-6">
            <div className="bg-white p-6 shadow rounded-lg">
              <h2 className="font-bold text-lg mb-4">Cart Totals</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span className={subtotal >= 5000 ? "text-green-600 font-medium" : ""}>
                  {subtotal >= 5000 ? "Free shipping" : "Calculated at checkout"}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Shipping to:{" "}
                <span className="font-medium">
                  {(() => {
                    const selectedAddr = addresses.find((a: any) => a.id === selectedAddressId);
                    if (!selectedAddr) return "No address selected";
                    
                    let addressText = `${selectedAddr.city}, ${selectedAddr.country}`;
                    if (selectedAddr.phone) {
                      addressText = `${selectedAddr.phone} - ${addressText}`;
                    }
                    return addressText;
                  })()}
                </span>{" "}
                <button
                  className="text-blue-600 underline ml-2"
                  onClick={() => setShowAddressModal(true)}
                >
                  Add address
                </button>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-orange-500">
                  ${(subtotal - discountAmount).toFixed(2)}
                </span>
              </div>
              <button
                onClick={createPaymentSession}
                disabled={loading}
                className="mt-4 w-full bg-orange-400 hover:bg-orange-500 text-white rounded-full py-3 font-semibold"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                ) : (
                  "Proceed to checkout"
                )}
              </button>
            </div>

            <div className="bg-white p-6 shadow rounded-lg text-sm">
              <h4 className="font-semibold mb-3">Payment methods:</h4>

              <Image
                src="/assets/AddToCart/payment-methods.webp" 
                alt="Payment methods"
                width={320}
                height={40}
                className="object-contain"
              />

              <p className="text-gray-600 mt-3">
                We accept PayPal, Visa, Mastercard, Stripe, and Apple Pay.
              </p>

              <p className="mb-2">
                <strong>Delivery information:</strong> We gladly offer refunds
                if requested within 14 days of purchase.
              </p>
              <p>
                <strong>14 Days Money Back Guarantee:</strong> Your satisfaction
                is guaranteed.
              </p>
            </div>
          </div>
        </div>

        {/* Suggested products */}
        <InterestedInCard category="All" limit={5} />

        {/* Address modal */}
        {showAddressModal && (
          <div className="fixed inset-0 z-[60] bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-y-auto max-h-[90vh] p-4 relative">
              <button
                onClick={() => setShowAddressModal(false)}
                className="absolute top-3 right-4 text-gray-400 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
              <ShippingAddressSection
                onSelectAddress={(id:any) => {
                  setSelectedAddressId(id);
                  setShowAddressModal(false); 
                }}
              />
            </div>
          </div>
        )}
      </div>
      <Footer /> 
    </div>
  );
};

export default CartPage;
