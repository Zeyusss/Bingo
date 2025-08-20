"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Bell,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  Info,
  Calendar,
  ChevronRight,
  HelpCircle,
  CheckCircle,
  CheckCheck,
  Check,
  ChevronLeft,
  X,
} from "lucide-react";
import enhancedAxiosInstance from "apps/seller-ui/src/utils/axiosInstance";

interface Notification {
  id: string;
  title: string;
  message: string;
  status: "Read" | "Unread";
  redirect_link?: string;
  createdAt: string;
}

interface NotificationResponse {
  success: boolean;
  data: Notification[];
  meta: {
    totalNotifications: number;
    unreadCount: number;
    readCount: number;
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function SellerNotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const queryClient = useQueryClient();

  
  const { data: notificationData, isLoading, error } = useQuery<NotificationResponse>({
    queryKey: ["seller-notifications", currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      
      const res = await enhancedAxiosInstance.get(
        `/seller/api/get-seller-notifications?${params}`
      );
      return res.data;
    },
  });

  
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await enhancedAxiosInstance.patch(`/seller/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
    },
  });

  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await enhancedAxiosInstance.patch("/seller/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
    },
  });

  
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await enhancedAxiosInstance.delete(`/seller/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
    },
  });

  const deleteAllReadMutation = useMutation({
    mutationFn: async () => {
      await enhancedAxiosInstance.delete("/seller/api/notifications/bulk-delete-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      deleteNotificationMutation.mutate(notificationId);
    }
  };

  const handleDeleteAllRead = () => {
    const readCount = filteredNotifications.filter(n => n.status === "Read").length;
    if (readCount === 0) {
      alert("No read notifications to delete.");
      return;
    }
    if (confirm(`Are you sure you want to delete all ${readCount} read notifications? This action cannot be undone.`)) {
      deleteAllReadMutation.mutate();
    }
  };

  const handleRedirect = (notification: Notification) => {
    if (notification.status === "Unread") {
      handleMarkAsRead(notification.id);
    }
    if (notification.redirect_link) {
      
      if (notification.redirect_link.startsWith('/')) {
        
        window.location.href = notification.redirect_link;
      } else {
        
        window.open(notification.redirect_link, "_blank");
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes("order")) return <Calendar className="w-5 h-5 text-blue-500" />;
    if (title.toLowerCase().includes("payment")) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (title.toLowerCase().includes("warning") || title.toLowerCase().includes("alert")) 
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F1EE] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F1EE] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Notifications</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const notifications = notificationData?.data || [];
  const meta = notificationData?.meta || {
    totalNotifications: 0,
    unreadCount: 0,
    readCount: 0,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };

 
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === "" || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F3F1EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">
                Stay updated with your shop activities and important messages
              </p>
            </div>
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-3xl font-bold text-gray-900">{meta.totalNotifications}</p>
              </div>
              <Bell className="w-12 h-12 text-blue-500 bg-blue-50 rounded-lg p-2" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-3xl font-bold text-orange-600">{meta.unreadCount}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500 bg-orange-50 rounded-lg p-2" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Read</p>
                <p className="text-3xl font-bold text-green-600">{meta.readCount}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 bg-green-50 rounded-lg p-2" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="Unread">Unread</option>
                  <option value="Read">Read</option>
                </select>
              </div>
            </div>

            {/* Mark All as Read Button */}
            <div className="flex gap-2">
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                {markAllAsReadMutation.isPending ? "Marking..." : "Mark All Read"}
              </button>
              
              <button
                onClick={handleDeleteAllRead}
                disabled={deleteAllReadMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {deleteAllReadMutation.isPending ? "Deleting..." : "Delete All Read"}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "You're all caught up! New notifications will appear here."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    notification.status === "Unread" ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getNotificationIcon(notification.title)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {notification.title}
                          </h3>
                          {notification.status === "Unread" && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(notification.createdAt)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.status === "Read" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-orange-100 text-orange-800"
                          }`}>
                            {notification.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {notification.redirect_link && (
                        <button
                          onClick={() => handleRedirect(notification)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Open link"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      )}
                      
                      {notification.status === "Unread" && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {meta.currentPage} of {meta.totalPages} 
              ({meta.totalNotifications} total notifications)
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!meta.hasPrev}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg">
                {meta.currentPage}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(meta.totalPages, prev + 1))}
                disabled={!meta.hasNext}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Notifications Help</h2>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Managing Notifications</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Use the search bar to find specific notifications by title or content</li>
                  <li>• Filter notifications by status (All, Read, Unread)</li>
                  <li>• Click the mark as read button to mark individual notifications</li>
                  <li>• Use "Mark All as Read" to clear all unread notifications at once</li>
                  <li>• Delete notifications you no longer need</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notification Types</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Order notifications:</strong> New orders, order updates, cancellations</li>
                  <li>• <strong>Payment notifications:</strong> Payment confirmations, refunds</li>
                  <li>• <strong>System alerts:</strong> Important platform updates and warnings</li>
                  <li>• <strong>Shop updates:</strong> Profile changes, verification status</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Check notifications regularly to stay updated on your shop</li>
                  <li>• Mark notifications as read to keep track of what you've seen</li>
                  <li>• Use the redirect links to quickly navigate to relevant pages</li>
                  <li>• Keep important notifications and delete others to stay organized</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
