"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Users, TrendingUp, Mail, X, Eye, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import HelpModal, { HelpSection } from "../../shared/components/HelpModal";
import HelpButton from "../../shared/components/HelpButton";

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

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function AbandonedCartsPage() {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [stats, setStats] = useState({
    totalCarts: 0,
    totalValue: 0,
    emailsSent: 0,
    recoveryRate: "0%",
  });

  useEffect(() => {
    fetchAbandonedCarts();
  }, [pagination.currentPage, searchTerm, filterValue]);

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        hours: "0.1"
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (filterValue !== 'all') {
        params.append('filter', filterValue);
      }

      const [cartsResponse, statsResponse] = await Promise.all([
        fetch(`/product/api/abandoned-cart/all?${params.toString()}`),
        fetch("/product/api/abandoned-cart/stats?hours=0.1")
      ]);
      
      const cartsData = await cartsResponse.json();
      const statsData = await statsResponse.json();

      if (cartsData.success) {
        setAbandonedCarts(cartsData.data || []);
        setPagination(prev => ({
          ...prev,
          totalPages: cartsData.totalPages || 1,
          totalItems: cartsData.totalItems || 0,
          currentPage: cartsData.currentPage || 1
        }));
      }

      if (statsData.success) {
        setStats({
          totalCarts: statsData.data?.totalCarts || 0,
          totalValue: statsData.data?.totalValue || 0,
          emailsSent: statsData.data?.emailsSent || 0,
          recoveryRate: statsData.data?.recoveryRate || "0%",
        });
      }
    } catch (error) {
      console.error("Error fetching abandoned carts:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendRecoveryEmail = async (userId: string, userEmail: string) => {
    try {
      const response = await fetch(`/product/api/abandoned-cart/admin/force-trigger/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Recovery email sent successfully!", {
          duration: 4000,
          position: "top-right",
        });
        fetchAbandonedCarts(); // Refresh data
      } else {
        toast.error("Failed to send recovery email", {
          duration: 4000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error sending recovery email:", error);
      toast.error("Error sending recovery email. Please try again.", {
        duration: 4000,
        position: "top-right",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterValue(newFilter);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Help content
  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content: "The Abandoned Cart Recovery page helps you track and recover lost sales by monitoring shopping carts that users have left without completing their purchase.",
      subsections: [
        {
          title: "Real-Time Tracking",
          content: "Monitor abandoned carts in real-time with automatic updates"
        },
        {
          title: "Recovery Actions",
          content: "Send targeted recovery emails to encourage purchase completion"
        },
        {
          title: "Performance Analytics",
          content: "Track recovery rates and total potential revenue"
        }
      ]
    },
    {
      title: "Key Metrics",
      content: "Understanding your abandoned cart statistics:",
      subsections: [
        {
          title: "Total Abandoned Carts",
          content: "Number of carts left without purchase completion"
        },
        {
          title: "Total Value",
          content: "Combined value of all abandoned cart items"
        },
        {
          title: "Recovery Rate",
          content: "Percentage of abandoned carts successfully recovered"
        },
        {
          title: "Emails Sent",
          content: "Number of recovery emails sent to customers"
        }
      ]
    },
    {
      title: "Recovery Actions",
      content: "Tools for recovering abandoned carts:",
      subsections: [
        {
          title: "View Cart Details",
          content: "Click the eye icon to see detailed cart contents and customer information"
        },
        {
          title: "Send Recovery Email",
          content: "Click the mail icon to send a personalized recovery email to the customer"
        },
        {
          title: "Search & Filter",
          content: "Use search and filters to find specific abandoned carts"
        }
      ]
    },
    {
      title: "Best Practices",
      content: "Tips for effective cart recovery:",
      subsections: [
        {
          title: "Timing",
          content: "Send recovery emails within 1-3 hours for best results"
        },
        {
          title: "Personalization",
          content: "Include specific product details and customer name in emails"
        },
        {
          title: "Incentives",
          content: "Consider offering small discounts for cart completion"
        },
        {
          title: "Follow-up",
          content: "Send 2-3 follow-up emails over several days if needed"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
   
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 font-Poppins">
              <ShoppingCart className="h-6 w-6 text-red-600" />
              Abandoned Cart Recovery
            </h1>
            <p className="text-sm text-gray-600 mt-1 font-Roboto">
              Track and recover abandoned shopping carts to boost conversions
            </p>
          </div>
          <HelpButton onClick={() => setShowHelpModal(true)} />
        </div>
      </div>

 
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Carts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCarts}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recovery Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recoveryRate}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.emailsSent}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

   
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterValue}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Carts</option>
                <option value="high-value">High Value ($100+)</option>
                <option value="recent">Recent (Last 24h)</option>
                <option value="multiple-items">Multiple Items</option>
              </select>
            </div>
          </div>
        </div>

      
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Abandoned Carts ({pagination.totalItems})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : abandonedCarts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No abandoned carts</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterValue !== 'all' 
                  ? 'No carts match your search criteria.' 
                  : 'All customers completed their purchases!'}
              </p>
            </div>
          ) : (
            <>
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
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {abandonedCarts.map((cart, index) => (
                      <tr key={`${cart.userId}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {cart.userName || "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-500">{cart.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cart.cartItems.length} item{cart.cartItems.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(cart.totalAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(cart.lastUpdated)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedCart(cart)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                              title="View cart details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => sendRecoveryEmail(cart.userId, cart.userEmail)}
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                              title="Send recovery email"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
               
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                    if (pageNum > pagination.totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg ${
                          pageNum === pagination.currentPage
                            ? 'bg-red-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

     
      {selectedCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Cart Details</h3>
              <button
                onClick={() => setSelectedCart(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm"><strong>Name:</strong> {selectedCart.userName || "Unknown"}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedCart.userEmail}</p>
                  <p className="text-sm"><strong>Last Updated:</strong> {formatDate(selectedCart.lastUpdated)}</p>
                  <p className="text-sm"><strong>Total Value:</strong> {formatCurrency(selectedCart.totalAmount)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Cart Items ({selectedCart.cartItems.length})</h4>
                <div className="space-y-4">
                  {selectedCart.cartItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedCart(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  sendRecoveryEmail(selectedCart.userId, selectedCart.userEmail);
                  setSelectedCart(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Send Recovery Email
              </button>
            </div>
          </div>
        </div>
      )}

   
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Abandoned Cart Recovery Help"
        description="Learn how to effectively track and recover abandoned shopping carts to boost your conversion rates and recover lost sales."
        sections={helpSections}
      />
    </div>
  );
}
