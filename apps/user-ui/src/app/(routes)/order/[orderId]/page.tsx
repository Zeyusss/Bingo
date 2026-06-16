"use client";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Loader2, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const page = () => {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const canCancel =
    order?.status === "Paid" &&
    (!order?.deliveryStatus || order?.deliveryStatus === "Ordered");

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
    try {
      setCancelling(true);
      await axiosInstance.put(`/order/api/cancel-order/${orderId}`);
      toast.success("Order cancelled successfully.");
      setOrder((prev: any) => ({
        ...prev,
        status: "Cancelled",
        deliveryStatus: "Cancelled",
      }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axiosInstance.get(
          `/order/api/get-order-details/${orderId}`
        );
        setOrder(res.data.order);


      } catch (error) {
        console.error("Failed to fetch order details", error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-sm text-red-500">Order not found.</p>;
  }

  const fallbackImg = "/placeholder.png";
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Order #{order.id.slice(-6)}
      </h1>
      <div className="my-4">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
          {[
            "Ordered",
            "Packed",
            "Shipped",
            "Out for Delivery",
            "Delivered",
          ].map((step, idx) => {
            const current =
              step.toLowerCase() ===
              (order.deliveryStatus || "processing").toLowerCase();
            const passed =
              idx <=
              [
                "Ordered",
                "Packed",
                "Shipped",
                "Out for Delivery",
                "Delivered",
              ].findIndex(
                (s) =>
                  s.toLowerCase() ===
                  (order.deliveryStatus || "processing").toLowerCase()
              );
            return (
              <div
                key={step}
                className={`flex-1 text-left ${
                  current
                    ? "text-blue-600"
                    : passed
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {step}
              </div>
            );
          })}
        </div>
        <div className="flex items-center">
          {[
            "Ordered",
            "Packed",
            "Shipped",
            "Out for Delivery",
            "Delivered",
          ].map((step, idx) => {
            const isReached =
              idx <=
              [
                "Ordered",
                "Packed",
                "Shipped",
                "Out for Delivery",
                "Delivered",
              ].findIndex(
                (s) =>
                  s.toLowerCase() ===
                  (order.deliveryStatus || "processing").toLowerCase()
              );
            return (
              <div key={step} className="flex-1 flex items-center">
                <div
                  className={`w-4 h-4 rounded-full ${
                    isReached ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
                {idx !== 4 && (
                  <div
                    className={`flex-1 h-1 ${
                      isReached ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {canCancel && (
        <div className="mb-4">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {cancelling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      )}
      <div className="mb-6 space-y-1 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Payment Status</span>{" "}
          <span className="text-green-600 font-medium">{order.status}</span>
        </p>
        <p>
          <span className="font-semibold">Total Paid</span>{" "}
          <span className="font-medium">${order.total.toFixed(2)}</span>
        </p>
        {order.discountAmount > 0 && (
          <p>
            <span className="font-semibold">Discount Applied :</span>{" "}
            <span className="text-green-700">
              -${order.discountAmount.toFixed(2)}(
              {order.couponCode?.discountType === "percentage"
                ? `${order.couponCode.discountValue}`
                : `$${order.couponCode.discountValue}`}{" "}
              off )
            </span>
          </p>
        )}
        {order.couponCode && (
          <p>
            <span className="font-semibold">Coupon :</span>{" "}
            <span className="text-blue-700">
              {order.couponCode.public_name}
            </span>
          </p>
        )}
        <p>
          <span className="font-semibold">Date :</span>{" "}
          {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
      {order.shippingAddress ? (
        <div className="mb-6 text-sm text-gray-700">
          <h2 className="text-md font-semibold mb-2">Shipping Address</h2>
          {order.shippingAddress.name && <p>{order.shippingAddress.name}</p>}
          {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
          <p>
            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
            {order.shippingAddress.country}
          </p>
          {order.shippingAddress.zip && <p>ZIP: {order.shippingAddress.zip}</p>}
        </div>
      ) : order.shippingAddressId ? (
        <div className="mb-6 text-sm text-gray-700">
          <h2 className="text-md font-semibold mb-2">Shipping Address</h2>
          <p className="text-gray-500">Address details not available</p>
        </div>
      ) : null}
<section>
  <h2 className="text-xl font-bold text-gray-800 mb-6">Order Items</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {order.items.map((item: any) => (
      <div
        key={item.productId}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex gap-5 items-start hover:shadow-md transition-shadow duration-200"
      >
        <img
          src={item.product?.images?.[0]?.url || fallbackImg}
          alt={item.product?.title || "Product image"}
          className="w-20 h-20 object-cover rounded-lg border border-gray-300 bg-gray-100 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImg;
          }}
        />
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-gray-900">
            {item.product?.title || "Unnamed Product"}
          </p>
          <p className="text-sm text-gray-600">
            Quantity:{" "}
            <span className="font-medium text-gray-800">{item.quantity}</span>
          </p>

          {item.selectedOptions &&
            Object.keys(item.selectedOptions).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(item.selectedOptions).map(
                  ([key, value]: [string, any]) =>
                    value && (
                      <span
                        key={key}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium border border-gray-300"
                      >
                        {key}: {value}
                      </span>
                    )
                )}
              </div>
            )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">
            ${item.price.toFixed(2)}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>
    </div>
  );
};

export default page;
