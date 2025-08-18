"use client";
import React, { useState } from "react";
import HelpModal, { HelpSection } from "../../shared/components/HelpModal";
import HelpButton from "../../shared/components/HelpButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import enhancedAxiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import {
  Bell,
  Search,
  Filter,
  Trash2,
  CheckCheck,
  Check,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  status: "Read" | "Unread";
  redirect_link?: string;
  createdAt: string;
  creatorId: string;
}

interface NotificationResponse {
  success: boolean;
  data: Notification[];
  meta: {
    totalNotifications: number;
    currentPage: number;
    totalPages: number;
    unreadCount: number;
  };
}

const NotificationsPage = () => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: notificationData, isLoading, error } = useQuery<NotificationResponse>({
    queryKey: ["notifications", currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      
      const res = await enhancedAxiosInstance.get(
        `/admin/api/get-all-notifications?${params}`
      );
      return res.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await enhancedAxiosInstance.patch(`/admin/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await enhancedAxiosInstance.patch("/admin/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await enhancedAxiosInstance.delete(`/admin/api/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteAllReadMutation = useMutation({
    mutationFn: async () => {
      await enhancedAxiosInstance.delete("/admin/api/notifications/delete-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = notificationData?.data || [];
  const meta = notificationData?.meta || { totalNotifications: 0, currentPage: 1, totalPages: 0, unreadCount: 0 };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === "" || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content:
        "The Notifications page provides centralized management of all platform notifications. Monitor system alerts, user communications, and automated messages to ensure effective platform communication.",
      subsections: [
        {
          title: "System Notifications",
          content:
            "Monitor platform alerts, system status updates, and administrative messages",
        },
        {
          title: "User Communications",
          content:
            "Manage notifications sent to users, sellers, and administrators",
        },
        {
          title: "Automated Messages",
          content:
            "Configure and monitor automated email, SMS, and in-app notifications",
        },
      ],
    },
    {
      title: "Notification Types",
      content: "Understanding different notification categories:",
      subsections: [
        {
          title: "System Alerts",
          content:
            "Critical system events, errors, and maintenance notifications",
        },
        {
          title: "User Notifications",
          content:
            "Account updates, order confirmations, and user-specific messages",
        },
        {
          title: "Marketing Messages",
          content:
            "Promotional campaigns, newsletters, and marketing communications",
        },
        {
          title: "Security Alerts",
          content:
            "Login attempts, security warnings, and account protection messages",
        },
      ],
    },
    {
      title: "Management Features",
      content: "Available notification management tools:",
      subsections: [
        {
          title: "Send Notifications",
          content:
            "Create and send custom notifications to specific users or groups",
        },
        {
          title: "Templates",
          content: "Manage notification templates for consistent messaging",
        },
        {
          title: "Scheduling",
          content: "Schedule notifications for optimal delivery times",
        },
        {
          title: "Analytics",
          content: "Track delivery rates, open rates, and engagement metrics",
        },
      ],
    },
    {
      title: "Best Practices",
      content: "Effective notification management:",
      subsections: [
        {
          title: "Frequency Control",
          content:
            "Avoid notification fatigue by managing frequency and relevance",
        },
        {
          title: "Personalization",
          content:
            "Customize notifications based on user preferences and behavior",
        },
        {
          title: "Compliance",
          content:
            "Ensure notifications comply with privacy laws and user consent",
        },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6">

      <div className="bg-white border-b border-gray-200 mb-6 shadow-sm rounded-md">
      <div className="px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Manage platform notifications and communications
          </p>
        </div>
        <HelpButton
          onClick={() => setShowHelpModal(true)}
          text="Notifications Help"
        />
      </div>
      </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{meta.totalNotifications}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-red-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{meta.unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Check className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-gray-900">{meta.totalNotifications - meta.unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || meta.unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
            <button
              onClick={() => deleteAllReadMutation.mutate()}
              disabled={deleteAllReadMutation.isPending || (meta.totalNotifications - meta.unreadCount) === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Delete All Read
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">Error loading notifications. Please try again.</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No notifications found</p>
            <p className="text-gray-500 mt-1">
              {searchQuery ? "Try adjusting your search terms" : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  notification.status === "Unread" ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {notification.status === "Unread" && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      )}
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    {notification.redirect_link && (
                      <a
                        href={notification.redirect_link}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Details →
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {notification.status === "Unread" && (
                      <button
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Only show pagination if there are more notifications than page size */}
        {(meta.totalNotifications > 10) && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {meta.currentPage} of {meta.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(meta.totalPages, currentPage + 1))}
                disabled={currentPage === meta.totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Management Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Notifications Management Guide"
        description="Learn how to effectively manage platform notifications, user communications, and automated messaging systems."
        sections={helpSections}
      />
    </div>
  );
};

export default NotificationsPage;
