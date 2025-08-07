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
  const cart = useStore((state: any) => state.cart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
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
      cart: state.cart.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
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
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
              <p className="text-sm font-medium text-orange-600">
                Your order qualifies for free shipping!
              </p>
              <div className="mt-2 h-2 bg-orange-100 rounded-full overflow-hidden">
                <div className="h-full w-full bg-orange-400 rounded-full" />
              </div>
            </div>
            {/* Table */}
            <div className="bg-white shadow rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-700">
                    <th className="p-4"></th> {/* Remove button (X) */}
                    <th className="p-4">PRODUCT</th>
                    <th className="p-4 text-center">PRICE</th>
                    <th className="p-4 text-center">QUANTITY</th>
                    <th className="p-4 text-right">SUBTOTAL</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item: any) => (
                    <tr
                      key={item.id}
                      className="border-t group hover:bg-orange-50 transition"
                    >
                      {/* Remove Button */}
                      <td className="p-4 align-top">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </td>

                      {/* Product Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <Image
                            src={item.images[0]?.url}
                            alt={item.title}
                            width={80}
                            height={80}
                            className="rounded object-cover"
                          />
                          <div>
                            <div className="font-semibold text-gray-800">
                              {item.title}
                            </div>
                            {item?.selectedOptions?.color && (
                              <div className="text-sm text-gray-500">
                                Color: {item.selectedOptions.color}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-4 text-center font-medium text-gray-800">
                        ${item.sale_price.toFixed(2)}
                      </td>

                      {/* Quantity */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="px-3 py-1 text-gray-700 hover:bg-orange-100 hover:text-orange-500 transition"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="px-3 py-1 text-gray-700 hover:bg-orange-100 hover:text-orange-500 transition"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td className="p-4 text-right font-semibold text-orange-500">
                        ${(item.quantity * item.sale_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Coupon input */}
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="border border-gray-300 rounded-full px-4 py-2 w-[250px] outline-none focus:ring-2 focus:ring-orange-300 transition"
                  />

                  {/* Apply button */}
                  <button
                    onClick={couponCodeApplyHandler}
                    className="bg-orange-400 hover:bg-orange-500 text-white rounded-full px-6 py-2 text-sm transition duration-200"
                  >
                    Apply coupon
                  </button>
                </div>

                {/* Error message */}
                {error && <p className="text-red-500 text-sm pt-2">{error}</p>}
              </div>

              {error && (
                <p className="text-red-500 px-4 text-sm pb-4">{error}</p>
              )}
            </div>

            {/* Info boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white p-4 rounded shadow flex items-start gap-3">
                <Phone className="text-orange-500 w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Have questions?</p>
                  <p className="text-sm">
                    Our experts are here to help!{" "}
                    <a href="#" className="text-blue-600 underline">
                      Call Us
                    </a>
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-start gap-3">
                <Lock className="text-orange-500 w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Secure shopping</p>
                  <p className="text-sm">All transactions are SSL protected.</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded shadow flex items-start gap-3">
                <ShieldCheck className="text-orange-500 w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold mb-1">Privacy protection</p>
                  <p className="text-sm">Your privacy is our priority.</p>
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
                <span>Free shipping</span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Shipping to:{" "}
                <span className="font-medium">
                  {addresses.find((a: any) => a.id === selectedAddressId)?.city
                    ? `${
                        addresses.find((a: any) => a.id === selectedAddressId)
                          ?.city
                      }, ${
                        addresses.find((a: any) => a.id === selectedAddressId)
                          ?.country
                      }`
                    : "No address selected"}
                </span>{" "}
                <button
                  className="text-blue-600 underline ml-2"
                  onClick={() => setShowAddressModal(true)}
                >
                  Change address
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
