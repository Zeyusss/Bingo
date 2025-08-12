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
            <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">Notifications</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                    <h3 className="font-medium text-gray-900 font-[Poppins]">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 font-[Work Sans]">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2 font-[Work Sans]">{notification.time}</p>
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
      <div className="min-h-screen bg-[#F4F2EF]" style={{ backgroundImage: 'url("https://ik.imagekit.io/w7lwh7wre/wood-texture.jpg?updatedAt=1754240423756")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-[Poppins]">
                  {getGreeting()}, {seller?.shop?.name || 'Seller'}! 👋
                </h1>
                <p className="text-lg text-gray-600 mt-2 font-[Work Sans]">
                  Here's what's happening with your shop today
                </p>
              </div>
              <button 
                onClick={() => setShowNotifications(true)}
                className="relative p-3 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-[Poppins]">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={handleAddProduct}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Plus className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 font-[Poppins]">Add Product</p>
                    <p className="text-sm text-gray-500 font-[Work Sans]">Create new listing</p>
                  </div>
                </button>
                <button 
                  onClick={handleViewOrders}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 font-[Poppins]">View Orders</p>
                    <p className="text-sm text-gray-500 font-[Work Sans]">Manage orders</p>
                  </div>
                </button>
                <button 
                  onClick={handleViewAnalytics}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <BarChart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 font-[Poppins]">Analytics</p>
                    <p className="text-sm text-gray-500 font-[Work Sans]">View insights</p>
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
                    <p className="font-medium text-gray-900 font-[Poppins]">Payments</p>
                    <p className="text-sm text-gray-500 font-[Work Sans]">Track earnings</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 font-[Poppins]">
                <BarChart3 className="h-6 w-6 text-orange-600" />
                Performance Overview
              </h2>
              <p className="text-base text-gray-600 mt-1 font-[Work Sans]">
                Your shop's key metrics at a glance
              </p>
            </div>
            <MetricsOverview />
          </div>

          {/* Revenue Trends */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 font-[Poppins]">
                <DollarSign className="h-6 w-6 text-orange-600" />
                Revenue Trends
              </h2>
              <p className="text-base text-gray-600 mt-1 font-[Work Sans]">
                Track your earnings and growth over time
              </p>
            </div>
            <RevenueChart />
          </div>

          {/* Recent Orders */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 font-[Poppins]">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
                Recent Orders
              </h2>
              <p className="text-base text-gray-600 mt-1 font-[Work Sans]">
                Orders that need your attention
              </p>
            </div>
            <RecentOrdersTable />
          </div>

          {/* Top Performing Products */}
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 font-[Poppins]">
                <Star className="h-6 w-6 text-yellow-500" />
                Top Performing Products
              </h2>
              <p className="text-base text-gray-600 mt-1 font-[Work Sans]">
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
