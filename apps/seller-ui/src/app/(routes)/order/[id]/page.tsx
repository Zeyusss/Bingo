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
  name:string;
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
    className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`}
    role="alert"
  >
    {type === "success" ? (
      <CheckCircle2 className="w-5 h-5" />
    ) : (
      <XCircle className="w-5 h-5" />
    )}
    <span>{message}</span>
    <button
      className="ml-4 text-white/80 hover:text-white"
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
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-200
              ${
                isCompleted
                  ? "bg-green-500 border-green-500 text-white"
                  : isActive
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-gray-200 border-gray-300 text-gray-500"
              }`}
            >
              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
            </div>
            <span
              className={`mt-2 text-xs font-semibold ${
                isCompleted
                  ? "text-green-600"
                  : isActive
                  ? "text-blue-600"
                  : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
          {idx !== statuses.length - 1 && (
            <div
              className={`hidden sm:block flex-1 h-1 mx-1 rounded-full transition-all duration-200
              ${
                idx < current
                  ? "bg-green-500"
                  : idx === current
                  ? "bg-blue-400"
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <p className="text-center text-lg text-red-500 py-10">{error}</p>
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <p className="text-center text-lg text-red-500 py-10">
          Order not found.
        </p>
      </div>
    );
  }

  const currentStatusIdx = statuses.indexOf(order.deliveryStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 pb-10">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-gray-950/95 to-gray-900/95 backdrop-blur-md border-b border-gray-800 py-4 px-4 sm:px-8 flex items-center justify-between shadow-md">
        <button
          className="text-white flex items-center gap-2 font-semibold hover:underline focus:outline-none"
          onClick={() => router.push("/dashboard/orders")}
          aria-label="Go back to dashboard"
        >
          <ArrowLeft />
          <span className="hidden sm:inline">Back to Orders</span>
        </button>
        <span className="text-gray-200 font-bold text-lg">
          Order #{order.id.slice(-6)}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleString()}
        </span>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 mt-8">
        {/* Stepper */}
        <section className="mb-10">
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <Stepper current={currentStatusIdx} />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label
                htmlFor="status-select"
                className="text-sm font-semibold text-gray-300"
              >
                Update Delivery Status:
              </label>
              <select
                id="status-select"
                value={order.deliveryStatus}
                onChange={handleStatusChange}
                disabled={updating}
                className="border border-gray-700 bg-gray-900 text-gray-200 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 min-w-[180px]"
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
                <Loader2 className="animate-spin w-4 h-4 text-blue-500 ml-2" />
              )}
            </div>
          </div>
        </section>

        {/* Order Summary Card */}
        <section className="mb-10">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 flex flex-col sm:flex-row gap-8">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-300">
                  Payment Status:
                </span>
                <span
                  className={`font-bold ${
                    order.status === "Paid"
                      ? "text-green-500"
                      : "text-yellow-400"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-300">Total Paid:</span>
                <span className="font-bold text-blue-400">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-300">Discount:</span>
                  <span className="text-green-400 font-semibold">
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
                  <span className="font-semibold text-gray-300">
                    Coupon Used:
                  </span>
                  <span className="text-blue-400 font-semibold">
                    {order.couponCode.public_name}
                  </span>
                </div>
              )}
            </div>
            {order.shippingAddress && (
              <div className="flex-1">
                <h2 className="text-md font-semibold text-gray-200 mb-2">
                  Shipping Address
                </h2>
                <div className="text-gray-300 text-sm space-y-1">
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

        <div className="border-t border-gray-800 my-10" />
        <section>
          <h2 className="text-xl font-bold text-gray-200 mb-6">Order Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="bg-gray-900 rounded-xl shadow-md p-5 flex gap-5 items-center hover:shadow-lg transition-shadow duration-200"
              >
                <img
                  src={item.product?.images?.[0]?.url || fallbackImg}
                  alt={item.product?.title || "Product image"}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-800 bg-gray-700 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImg;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-100 truncate">
                    {item.product?.title || "Unnamed Product"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Quantity:{" "}
                    <span className="text-gray-200 font-medium">
                      {item.quantity}
                    </span>
                  </p>
                  {item.selectedOptions &&
                    Object.keys(item.selectedOptions).length > 0 && (
                      <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-2">
                        {Object.entries(item.selectedOptions).map(
                          ([key, value]) =>
                            value && (
                              <span
                                key={key}
                                className="bg-gray-800 px-2 py-1 rounded font-medium capitalize"
                              >
                                {key}: {value}
                              </span>
                            )
                        )}
                      </div>
                    )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-400">
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
