"use client";
import React, { useState } from "react";
import { MetricsOverview } from "../../../shared/components/dashboard/MetricsOverview";
import RevenueChart from "../../../shared/components/dashboard/RevenueChart";
import RecentOrdersTable from "../../../shared/components/dashboard/RecentOrdersTable";
import TopSellingProducts from "../../../shared/components/dashboard/TopSellingProducts";
import ErrorBoundary from "../../../shared/components/dashboard/ErrorBoundary";
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  Clock,
  CheckCircle,
  DollarSign,
  ShoppingCart,
  Star,
  Bell,
  Plus,
  BarChart,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle2,
  X
} from "lucide-react";
import { useShopStats } from "../../../hooks/useDashboardData";
import useSeller from "../../../hooks/useSeller";

// Notifications Component
function NotificationsPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const notifications = [
    {
      id: 1,
      type: 'success' as const,
      title: 'New Order Received',
      message: 'Order #1234 from John Doe - $89.99',
      time: '2 minutes ago',
      icon: CheckCircle2
    },
    {
      id: 2,
      type: 'warning' as const,
      title: 'Low Stock Alert',
      message: 'iPhone Case - Only 3 items left',
      time: '1 hour ago',
      icon: AlertTriangle
    },
    {
      id: 3,
      type: 'info' as const,
      title: 'Payment Processed',
      message: 'Weekly payout of $1,245.67 processed',
      time: '3 hours ago',
      icon: Info
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end">
      <div className="bg-white w-96 h-full shadow-2xl transform transition-transform duration-300">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 font-inter">Notifications</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto h-full">
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            const bgColor = {
              success: 'bg-green-50 border-green-200',
              warning: 'bg-yellow-50 border-yellow-200',
              info: 'bg-blue-50 border-blue-200'
            }[notification.type];
            const iconColor = {
              success: 'text-green-600',
              warning: 'text-yellow-600',
              info: 'text-blue-600'
            }[notification.type];
            
            return (
              <div key={notification.id} className={`p-4 rounded-lg border ${bgColor}`}>
                <div className="flex items-start space-x-3">
                  <IconComponent className={`h-5 w-5 ${iconColor} mt-0.5`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 font-inter">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 font-inter">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2 font-inter">{notification.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { data: shopStats } = useShopStats();
  const { seller } = useSeller({ enabled: true });
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Get current time for welcome message
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Quick action handlers
  const handleAddProduct = () => {
    window.location.href = '/dashboard/create-product';
  };

  const handleViewOrders = () => {
    window.location.href = '/dashboard/orders';
  };

  const handleViewAnalytics = () => {
    window.location.href = '/dashboard/analytics';
  };

  const handleViewPayments = () => {
    window.location.href = '/dashboard/payments';
  };

  return (
    <>
      <NotificationsPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="w-full px-6">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 font-inter">
                      {getGreeting()}, {seller?.name || 'Welcome back'}! 👋
                    </h1>
                    <p className="text-base text-gray-600 mt-1 font-inter">
                      Here's what's happening with your shop today
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 font-inter">Shop Active</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 font-inter">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full px-6 py-8">
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 font-inter">
                  <Activity className="h-5 w-5 text-gray-600" />
                  Quick Actions
                </h3>
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-inter font-medium"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">3</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={handleAddProduct}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 font-inter">Add Product</p>
                    <p className="text-sm text-gray-500 font-inter">Create new listing</p>
                  </div>
                </button>
                <button 
                  onClick={handleViewOrders}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 font-inter">View Orders</p>
                    <p className="text-sm text-gray-500 font-inter">Manage orders</p>
                  </div>
                </button>
                <button 
                  onClick={handleViewAnalytics}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <BarChart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 font-inter">Analytics</p>
                    <p className="text-sm text-gray-500 font-inter">View insights</p>
                  </div>
                </button>
                <button 
                  onClick={handleViewPayments}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 font-inter">Payments</p>
                    <p className="text-sm text-gray-500 font-inter">Track earnings</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 font-inter">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                Performance Overview
              </h2>
              <p className="text-base text-gray-600 mt-1 font-inter">
                Your shop's key metrics at a glance
              </p>
            </div>
            <MetricsOverview />
          </div>
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 font-inter">
                <DollarSign className="h-6 w-6 text-green-600" />
                Revenue Trends
              </h2>
              <p className="text-base text-gray-600 mt-1 font-inter">
                Track your earnings and growth over time
              </p>
            </div>
            <RevenueChart />
          </div>
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 font-inter">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
                Recent Orders
              </h2>
              <p className="text-base text-gray-600 mt-1 font-inter">
                Orders that need your attention
              </p>
            </div>
            <RecentOrdersTable />
          </div>
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 font-inter">
                <Star className="h-6 w-6 text-yellow-500" />
                Top Performing Products
              </h2>
              <p className="text-base text-gray-600 mt-1 font-inter">
                Your best-selling items
              </p>
            </div>
            <TopSellingProducts />
          </div>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
