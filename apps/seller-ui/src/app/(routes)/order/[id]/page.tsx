"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import { useParams, useRouter } from "next/navigation";

interface OrderItem {
  productId: string;
  product?: {
    title?: string;
    images?: { url: string }[];
  };
  quantity: number;
  price: number;
  selectedOptions?: Record<string, any>;
}

interface CouponCode {
  public_name: string;
  discountType: string;
  discountValue: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  zip: string;
  country: string;
  name: string;
  phone?: string;
}

interface Order {
  id: string;
  deliveryStatus: string;
  status: string;
  total: number;
  discountAmount: number;
  couponCode?: CouponCode;
  createdAt: string;
  shippingAddress?: ShippingAddress;
  items: OrderItem[];
}

const statuses = [
  "Ordered",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const fallbackImg = "/placeholder.png";

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <div
    className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-white border ${
      type === "success" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500"
    }`}
    role="alert"
  >
    {type === "success" ? (
      <CheckCircle2 className="w-5 h-5" />
    ) : (
      <XCircle className="w-5 h-5" />
    )}
    <span className="font-[Work Sans]">{message}</span>
    <button
      className="ml-4 text-white/80 hover:text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-white/20 transition-colors"
      onClick={onClose}
      aria-label="Close notification"
    >
      ×
    </button>
  </div>
);

const Stepper = ({ current }: { current: number }) => (
  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 w-full">
    {statuses.map((step, idx) => {
      const isDelivered = current === statuses.length - 1 && idx === current;
      const isActive = idx === current && !isDelivered;
      const isCompleted = idx < current || isDelivered;
      return (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-200 font-[Work Sans] font-semibold
              ${
                isCompleted
                  ? "bg-green-600 border-green-600 text-white"
                  : isActive
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-500"
              }`}
            >
              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
            </div>
            <span
              className={`mt-2 text-xs font-semibold font-[Work Sans] text-center ${
                isCompleted
                  ? "text-green-600"
                  : isActive
                  ? "text-orange-600"
                  : "text-gray-500"
              }`}
            >
              {step}
            </span>
          </div>
          {idx !== statuses.length - 1 && (
            <div
              className={`hidden sm:block flex-1 h-2 mx-2 rounded-full transition-all duration-200
              ${
                idx < current
                  ? "bg-green-500"
                  : idx === current
                  ? "bg-orange-400"
                  : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const Page = () => {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(
        `/order/api/get-order-details/${orderId}`
      );
      setOrder(res.data.order);
    } catch (error) {
      setError("Failed to fetch order details.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    setUpdating(true);
    setError(null);
    try {
      await axiosInstance.put(`/order/api/update-status/${order?.id}`, {
        deliveryStatus: newStatus,
      });
      await fetchOrder();
      setToast({ message: "Status updated successfully!", type: "success" });
    } catch (error) {
      setError("Failed to update status.");
      setToast({ message: "Failed to update status.", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F4F2EF] bg-[url('/wood-texture.jpg')] bg-cover bg-center bg-fixed">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <Loader2 className="animate-spin w-8 h-8 text-orange-500 mx-auto" />
          <p className="text-gray-700 mt-4 font-[Work Sans]">Loading order details...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F4F2EF] bg-[url('/wood-texture.jpg')] bg-cover bg-center bg-fixed">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 font-[Work Sans]">{error}</p>
        </div>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F4F2EF] bg-[url('/wood-texture.jpg')] bg-cover bg-center bg-fixed">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-red-600 font-[Work Sans]">
            Order not found.
          </p>
        </div>
      </div>
    );
  }

  const currentStatusIdx = statuses.indexOf(order.deliveryStatus);

  return (
    <div className="min-h-screen bg-[#F4F2EF] bg-[url('/wood-texture.jpg')] bg-cover bg-center bg-fixed pb-10">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-orange-200 py-4 px-4 sm:px-8 flex items-center justify-between shadow-md">
        <button
          className="text-gray-800 flex items-center gap-2 font-semibold hover:text-orange-600 transition-colors focus:outline-none font-[Work Sans]"
          onClick={() => router.push("/dashboard/orders")}
          aria-label="Go back to dashboard"
        >
          <ArrowLeft className="text-orange-600" />
          <span className="hidden sm:inline">Back to Orders</span>
        </button>
        <span className="text-gray-800 font-bold text-lg font-[Poppins]">
          Order #{order.id.slice(-6)}
        </span>
        <span className="text-xs text-gray-600 font-[Work Sans]">
          {new Date(order.createdAt).toLocaleString()}
        </span>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 mt-8">
        {/* Stepper */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
            <div className="mb-6">
              <Stepper current={currentStatusIdx} />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label
                htmlFor="status-select"
                className="text-sm font-semibold text-gray-700 font-[Work Sans]"
              >
                Update Delivery Status:
              </label>
              <select
                id="status-select"
                value={order.deliveryStatus}
                onChange={handleStatusChange}
                disabled={updating}
                className="border border-gray-300 bg-white text-gray-800 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-150 min-w-[180px] font-[Work Sans]"
              >
                {statuses.map((status, idx) => (
                  <option
                    key={status}
                    value={status}
                    disabled={idx < currentStatusIdx}
                    title={
                      idx < currentStatusIdx
                        ? "Cannot revert to previous status"
                        : ""
                    }
                  >
                    {status}
                  </option>
                ))}
              </select>
              {updating && (
                <Loader2 className="animate-spin w-4 h-4 text-orange-500 ml-2" />
              )}
            </div>
          </div>
        </section>

        {/* Order Summary Card */}
        <section className="mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row gap-8 border border-orange-100">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 font-[Work Sans]">
                  Payment Status:
                </span>
                <span
                  className={`font-bold font-[Work Sans] ${
                    order.status === "Paid"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 font-[Work Sans]">Total Paid:</span>
                <span className="font-bold text-orange-600 font-[Work Sans]">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 font-[Work Sans]">Discount:</span>
                  <span className="text-green-600 font-semibold font-[Work Sans]">
                    -${order.discountAmount.toFixed(2)} (
                    {order.couponCode?.discountType === "percentage"
                      ? `${order.couponCode.discountValue}%`
                      : `$${order.couponCode?.discountValue}`}{" "}
                    off)
                  </span>
                </div>
              )}
              {order.couponCode && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 font-[Work Sans]">
                    Coupon Used:
                  </span>
                  <span className="text-orange-600 font-semibold font-[Work Sans]">
                    {order.couponCode.public_name}
                  </span>
                </div>
              )}
            </div>
            {order.shippingAddress && (
              <div className="flex-1">
                <h2 className="text-md font-semibold text-gray-800 mb-2 font-[Poppins]">
                  Shipping Address
                </h2>
                <div className="text-gray-700 text-sm space-y-1 font-[Work Sans]">
                  {order.shippingAddress.name && (
                    <div>
                      <span className="font-semibold">Name:</span>{" "}
                      {order.shippingAddress.name}
                    </div>
                  )}
                  {order.shippingAddress.phone && (
                    <div>
                      <span className="font-semibold">Phone:</span>{" "}
                      {order.shippingAddress.phone}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Street:</span>{" "}
                    {order.shippingAddress.street}
                  </div>
                  <div>
                    <span className="font-semibold">City:</span>{" "}
                    {order.shippingAddress.city}
                  </div>
                  {order.shippingAddress.zip && (
                    <div>
                      <span className="font-semibold">Zip Code:</span>{" "}
                      {order.shippingAddress.zip}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Country:</span>{" "}
                    {order.shippingAddress.country}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="border-t border-orange-200 my-10" />
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6 font-[Poppins]">Order Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-2xl shadow-md p-5 flex gap-5 items-center hover:shadow-lg transition-shadow duration-200 border border-orange-100"
              >
                <img
                  src={item.product?.images?.[0]?.url || fallbackImg}
                  alt={item.product?.title || "Product image"}
                  className="w-20 h-20 object-cover rounded-xl border border-orange-200 bg-gray-50 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImg;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate font-[Work Sans]">
                    {item.product?.title || "Unnamed Product"}
                  </p>
                  <p className="text-sm text-gray-600 font-[Work Sans]">
                    Quantity:{" "}
                    <span className="text-gray-800 font-medium">
                      {item.quantity}
                    </span>
                  </p>
                  {item.selectedOptions &&
                    Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2 font-[Work Sans]">
                        {Object.entries(item.selectedOptions).map(
                          ([key, value]) =>
                            value && (
                              <span
                                key={key}
                                className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium capitalize"
                              >
                                {key}: {value}
                              </span>
                            )
                        )}
                      </div>
                    )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600 font-[Work Sans]">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Page;
