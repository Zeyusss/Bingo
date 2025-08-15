"use client";
import React, { useState } from "react";
import { MetricsOverview } from "../../../shared/components/dashboard/MetricsOverview";
import RevenueChart from "../../../shared/components/dashboard/RevenueChart";
import RecentOrdersTable from "../../../shared/components/dashboard/RecentOrdersTable";
import TopSellingProducts from "../../../shared/components/dashboard/TopSellingProducts";
import ErrorBoundary from "../../../shared/components/dashboard/ErrorBoundary";
import VerificationStatusCard from "../../../shared/components/verification/VerificationStatusCard";
import {
  BarChart3,
  Bell,
  Plus,
  BarChart,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  ShoppingCart,
  Calendar,
  ExternalLink,
  Shield,
} from "lucide-react";
import useSeller from "../../../hooks/useSeller";
import { useQuery } from "@tanstack/react-query";
import enhancedAxiosInstance from "../../../utils/axiosInstance";
import { useRouter } from "next/navigation";

// Notifications Component
function NotificationsPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  
  // Fetch real notifications data
  const { data: notificationData, isLoading } = useQuery({
    queryKey: ["dashboard-notifications"],
    queryFn: async () => {
      const res = await enhancedAxiosInstance.get("/seller/api/get-seller-notifications?limit=5");
      return res.data;
    },
    enabled: isOpen, // Only fetch when panel is open
  });

  const notifications = notificationData?.data || [];

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes("order")) return Calendar;
    if (title.toLowerCase().includes("payment")) return CheckCircle2;
    if (title.toLowerCase().includes("warning") || title.toLowerCase().includes("alert")) 
      return AlertTriangle;
    return Info;
  };

  const getNotificationType = (title: string) => {
    if (title.toLowerCase().includes("order")) return "success";
    if (title.toLowerCase().includes("payment")) return "success";
    if (title.toLowerCase().includes("warning") || title.toLowerCase().includes("alert")) 
      return "warning";
    return "info";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleViewAllNotifications = () => {
    router.push("/dashboard/notifications");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end">
      <div className="bg-white w-96 h-full shadow-2xl transform transition-transform duration-300">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 font-[Poppins]">
              Notifications
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-[Work Sans]">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification: any) => {
              const IconComponent = getNotificationIcon(notification.title);
              const type = getNotificationType(notification.title);
              const bgColor = {
                success: "bg-green-50 border-green-200",
                warning: "bg-yellow-50 border-yellow-200",
                info: "bg-blue-50 border-blue-200",
              }[type];
              const iconColor = {
                success: "text-green-600",
                warning: "text-yellow-600",
                info: "text-blue-600",
              }[type];

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${bgColor} cursor-pointer hover:shadow-sm transition-shadow`}
                  onClick={() => {
                    if (notification.redirect_link) {
                      if (notification.redirect_link.startsWith('/')) {
                        router.push(notification.redirect_link);
                      } else {
                        window.open(notification.redirect_link, "_blank");
                      }
                    }
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className={`h-5 w-5 ${iconColor} mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 font-[Poppins]">
                          {notification.title}
                        </h3>
                        {notification.status === "Unread" && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 font-[Work Sans]">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 font-[Work Sans]">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* View All Button */}
          {notifications.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleViewAllNotifications}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-[Poppins]"
              >
                <ExternalLink className="w-4 h-4" />
                View All Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { seller } = useSeller({ enabled: true });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(false);
  
  // Fetch unread notifications count for badge
  const { data: notificationsData } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: async () => {
      const res = await enhancedAxiosInstance.get("/seller/api/get-seller-notifications?limit=1&status=Unread");
      return res.data;
    },
    refetchInterval: 30000, // Check for new notifications every 30 seconds
  });

  const unreadCount = notificationsData?.meta?.unreadCount || 0;

  // Check if verified banner should be shown
  React.useEffect(() => {
    if (seller?.isVerified && seller?.verificationStatus === "Approved") {
      const dismissed = localStorage.getItem("verifiedBannerDismissed");
      if (!dismissed) {
        setShowVerifiedBanner(true);
      }
    }
  }, [seller]);

  const handleDismissVerifiedBanner = () => {
    setShowVerifiedBanner(false);
    localStorage.setItem("verifiedBannerDismissed", "true");
  };

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning";
    if (currentHour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Quick action handlers
  const handleAddProduct = () => {
    window.location.href = "/dashboard/create-product";
  };

  const handleViewOrders = () => {
    window.location.href = "/dashboard/orders";
  };

  const handleViewAnalytics = () => {
    window.location.href = "/dashboard/analytics";
  };

  const handleViewPayments = () => {
    window.location.href = "/dashboard/payments";
  };

  return (
    <>
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <div
        className="min-h-screen bg-[#F4F2EF]"
        style={{
          backgroundImage:
            'url("https://ik.imagekit.io/w7lwh7wre/wood-texture.jpg?updatedAt=1754240423756")',
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-[Poppins]">
                  {getGreeting()}, {seller?.shop?.name || "Seller"}! 👋
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
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Verified Success Banner */}
            {showVerifiedBanner && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900 font-[Poppins] mb-2">
                        🎉 Congratulations! Your identity has been verified
                      </h3>
                      <p className="text-green-700 font-[Work Sans] mb-3">
                        You can now sell on our platform and access all seller features.
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-green-600 font-[Work Sans]">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Submitted:</span>
                          <span>{seller?.verificationSubmittedAt ? new Date(seller.verificationSubmittedAt).toLocaleDateString() : "8/11/2025"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Reviewed:</span>
                          <span>{seller?.verificationApprovedAt ? new Date(seller.verificationApprovedAt).toLocaleDateString() : "8/12/2025"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-green-600">Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleDismissVerifiedBanner}
                    className="p-2 text-green-400 hover:text-green-600 hover:bg-green-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Verification Status Card - Hide if verified and banner is showing */}
            {!(seller?.isVerified && seller?.verificationStatus === "Approved" && showVerifiedBanner) && (
              <div className="mb-6">
                <VerificationStatusCard />
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-[Poppins]">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={handleAddProduct}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Plus className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 font-[Poppins]">
                      Add Product
                    </p>
                    <p className="text-sm text-gray-500 font-[Work Sans]">
                      Create new listing
                    </p>
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
                    <p className="font-medium text-gray-900 font-[Poppins]">
                      View Orders
                    </p>
                    <p className="text-sm text-gray-500 font-[Work Sans]">
                      Manage orders
                    </p>
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
                    <p className="font-medium text-gray-900 font-[Poppins]">
                      Analytics
                    </p>
                    <p className="text-sm text-gray-500 font-[Work Sans]">
                      View insights
                    </p>
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
                    <p className="font-medium text-gray-900 font-[Poppins]">
                      Payments
                    </p>
                    <p className="text-sm text-gray-500 font-[Work Sans]">
                      Track earnings
                    </p>
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
            <RevenueChart />
          </div>
          {/* Recent Orders */}
          <div className="mb-8">
            <RecentOrdersTable />
          </div>

          {/* Top Performing Products */}
          <div className="mb-8">
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
