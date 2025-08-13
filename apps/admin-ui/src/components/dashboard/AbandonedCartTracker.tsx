"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Users, TrendingUp, Mail, X, Eye } from "lucide-react";

interface AbandonedCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface AbandonedCart {
  userId: string;
  userEmail: string;
  userName: string;
  cartItems: AbandonedCartItem[];
  totalAmount: number;
  lastUpdated: string;
}

export default function AbandonedCartTracker() {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [stats, setStats] = useState({
    totalCarts: 0,
    totalValue: 0,
    emailsSent: 0,
    recoveryRate: "0%", 
  });

  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const fetchAbandonedCarts = async () => {
    try {
     
      const [cartsResponse, statsResponse] = await Promise.all([
        fetch("/product/api/abandoned-cart/all?hours=0.1"),
        fetch("/product/api/abandoned-cart/stats?hours=0.1")
      ]);
      
      const cartsData = await cartsResponse.json();
      const statsData = await statsResponse.json();

      const cartsArray = cartsData.success ? cartsData.data || [] : [];
      setAbandonedCarts(cartsArray);

      if (statsData.success && statsData.data) {
        setStats({
          totalCarts: statsData.data.totalAbandonedCarts || 0,
          totalValue: statsData.data.totalAbandonedValue || 0,
          emailsSent: statsData.data.emailsSent || 0,
          recoveryRate: statsData.data.recoveryRate || "0%", 
        });
      } else {

        const totalValue = cartsArray.reduce(
          (sum: number, cart: AbandonedCart) => sum + cart.totalAmount,
          0
        );
        setStats({
          totalCarts: cartsArray.length,
          totalValue,
          emailsSent: 0, 
          recoveryRate: "0%", 
        });
      }
    } catch (error) {
      console.error("Error fetching abandoned carts:", error);
      setAbandonedCarts([]);
      setStats({
        totalCarts: 0,
        totalValue: 0,
        emailsSent: 0,
        recoveryRate: "0%", 
      });
    } finally {
      setLoading(false);
    }
  };

  const sendReminderEmail = async (userId: string) => {
    try {
      const response = await fetch(`/product/api/abandoned-cart/trigger/${userId}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('Reminder email sent successfully!');
        fetchAbandonedCarts();
      } else {
        alert('Failed to send reminder email');
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert('Error sending reminder email');
    }
  };

  const processAllAbandonedCarts = async () => {
    try {
      const response = await fetch('/product/api/abandoned-cart/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`Processed abandoned carts. Sent: ${result.data.sent}, Errors: ${result.data.errors}`);
        fetchAbandonedCarts();
      } else {
        alert('Failed to process abandoned carts');
      }
    } catch (error) {
      console.error("Error processing abandoned carts:", error);
      alert('Error processing abandoned carts');
    }
  };

  const sendTestEmail = async () => {
    const testUserId = prompt('Enter a test user ID (or leave empty to use a default test):');
    
    try {
      const response = await fetch('/product/api/abandoned-cart/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: testUserId || '507f1f77bcf86cd799439011' 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Test email sent successfully!');
      } else {
        alert(`Failed to send test email: ${result.message}`);
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      alert('Error sending test email');
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
                {stats.recoveryRate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Abandoned Carts Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Abandoned Carts</h3>
          <div className="flex gap-2">
            <button
              onClick={processAllAbandonedCarts}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Process All Carts
            </button>
            <button
              onClick={sendTestEmail}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Test Email
            </button>
          </div>
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
                      {cart.cartItems?.length || 0} item
                      {(cart.cartItems?.length || 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(cart.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cart.lastUpdated
                        ? new Date(cart.lastUpdated).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedCart(cart)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => sendReminderEmail(cart.userId)}
                        className="text-green-600 hover:text-green-900"
                        title="Send Reminder Email"
                      >
                        <Mail className="h-4 w-4" />
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
              {selectedCart.cartItems && Array.isArray(selectedCart.cartItems) ? (
                selectedCart.cartItems.map((item: AbandonedCartItem, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 border rounded-lg"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name || "Product"}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.name || "Unknown Product"}
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
