'use client';
import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Trash2, Check, Settings, CheckCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  status: 'Read' | 'Unread';
  redirect_link?: string;
  createdAt: string;
  creatorId?: string;
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();


  const { data: unreadData } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-user-notifications?status=Unread&limit=1");
      return res.data;
    },
    refetchInterval: 30000, 
  });

  const unreadCount = unreadData?.meta?.unreadCount || 0;

  
  const { data: notificationData, isLoading } = useQuery({
    queryKey: ["recent-notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/admin/api/get-user-notifications?limit=8&page=1`);
      return res.data;
    },
    enabled: isOpen, 
  });

  const notifications: Notification[] = notificationData?.data || [];

  
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await axiosInstance.patch(`/admin/api/user-notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

 
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.patch('/admin/api/user-notifications/mark-all-read');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });

 
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await axiosInstance.delete(`/admin/api/user-notifications/${notificationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['user-notifications'] });
    },
  });



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === "Unread") {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.redirect_link) {
      router.push(notification.redirect_link);
    }
    setIsOpen(false);
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-200 group"
      >
        <Bell className={`w-5 h-5 transition-colors ${isOpen ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}`} />
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-semibold animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {/* Modern Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Caret Arrow */}
          <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 transform rotate-45"></div>
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    {notifications.filter(n => n.status === "Unread").length} new notifications
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    router.push('/profile?tab=Notifications');
                    setIsOpen(false);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                  title="View all notifications"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No notifications</h4>
                <p className="text-sm text-gray-500">You're all caught up! Check back later for updates.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 group ${
                      notification.status === "Unread" ? "bg-blue-50/50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {notification.status === "Unread" && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                          <h4 className={`text-sm font-medium truncate ${
                            notification.status === "Unread" ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {notification.title}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {notification.status === "Unread" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsReadMutation.mutate(notification.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    markAllAsReadMutation.mutate();
                  }}
                  disabled={markAllAsReadMutation.isPending}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  {markAllAsReadMutation.isPending ? "Marking..." : "Mark all read"}
                </button>
                <button
                  onClick={() => {
                    router.push('/profile?tab=Notifications');
                    setIsOpen(false);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  View all →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
