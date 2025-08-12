"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Users, TrendingUp, Mail, X, Eye } from "lucide-react";

interface AbandonedCartItem {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
}

interface AbandonedCart {
  userId: string;
  userEmail: string;
  userName: string;
  items: AbandonedCartItem[];
  totalAmount: number;
  createdAt: string;
  emailSent: boolean;
  optedOut: boolean;
}

export default function AbandonedCartTracker() {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [stats, setStats] = useState({
    totalCarts: 0,
    totalValue: 0,
    emailsSent: 0,
    recoveryRate: 0,
  });

  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const fetchAbandonedCarts = async () => {
    try {
      const response = await fetch("/order/api/abandoned-cart/list");
      const data = await response.json();

      // Ensure data is an array, if not use empty array
      const cartsArray = Array.isArray(data)
        ? data
        : data?.carts || data?.data || [];
      setAbandonedCarts(cartsArray);

      const totalValue = cartsArray.reduce(
        (sum: number, cart: AbandonedCart) => sum + cart.totalAmount,
        0
      );
      const emailsSent = cartsArray.filter(
        (cart: AbandonedCart) => cart.emailSent
      ).length;

      setStats({
        totalCarts: cartsArray.length,
        totalValue,
        emailsSent,
        recoveryRate:
          cartsArray.length > 0
            ? Math.round((emailsSent / cartsArray.length) * 100)
            : 0,
      });
    } catch (error) {
      console.error("Error fetching abandoned carts:", error);
      // Set empty array on error to prevent map/reduce errors
      setAbandonedCarts([]);
      setStats({
        totalCarts: 0,
        totalValue: 0,
        emailsSent: 0,
        recoveryRate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendReminderEmail = async (userId: string) => {
    try {
      await fetch(`/order/api/abandoned-cart/email-sent/${userId}`, {
        method: "PUT",
      });
      fetchAbandonedCarts();
    } catch (error) {
      console.error("Error sending reminder:", error);
    }
  };

  const removeCart = async (userId: string) => {
    try {
      await fetch(`/order/api/abandoned-cart/remove/${userId}`, {
        method: "DELETE",
      });
      fetchAbandonedCarts();
    } catch (error) {
      console.error("Error removing cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Abandoned Carts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCarts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.emailsSent}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recovery Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.recoveryRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Abandoned Carts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(abandonedCarts) && abandonedCarts.length > 0 ? (
                abandonedCarts.map((cart) => (
                  <tr key={cart.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {cart.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cart.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cart.items?.length || 0} item
                      {(cart.items?.length || 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(cart.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cart.createdAt
                        ? new Date(cart.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          cart.optedOut
                            ? "bg-red-100 text-red-800"
                            : cart.emailSent
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {cart.optedOut
                          ? "Opted Out"
                          : cart.emailSent
                          ? "Email Sent"
                          : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedCart(cart)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {!cart.emailSent && !cart.optedOut && (
                        <button
                          onClick={() => sendReminderEmail(cart.userId)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeCart(cart.userId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No abandoned carts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cart Details Modal */}
      {selectedCart && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Cart Details
              </h3>
              <button
                onClick={() => setSelectedCart(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900">
                {selectedCart.userName}
              </h4>
              <p className="text-sm text-gray-500">{selectedCart.userEmail}</p>
            </div>

            <div className="space-y-3">
              {selectedCart.items && Array.isArray(selectedCart.items) ? (
                selectedCart.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName || "Product"}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.productName || "Unknown Product"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity || 0} × $
                        {(item.price || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No items in cart
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">
                  Total:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  ${(selectedCart.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
