"use client";
import useAdmin from "apps/admin-ui/src/hooks/useAdmin";
import useSidebar from "apps/admin-ui/src/hooks/useSidebar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import axiosInstance, { setLoggingOut } from "../../../../utils/axiosInstance";
import { setAdminLoggingOut } from "../../../../hooks/useAdmin";
import { toast } from "sonner"; // react-hot-toast";
import Link from "next/link";
import Logo from "../../../assets/svgs/logo";
import HomeIcon from "../../../assets/icons/home";
import {
  BellPlus,
  BellRing,
  FileClock,
  ListOrdered,
  LogOut,
  PackageSearch,
  PencilRuler,
  ShieldCheck,
  ShoppingCart,
  Users,
  FileText,
} from "lucide-react";
import PaymentIcon from "../../../assets/icons/payment";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { admin } = useAdmin();
  const queryClient = useQueryClient();

 
  const { data: notificationsData } = useQuery({
    queryKey: ["admin-unread-notifications-count"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-all-notifications?limit=1&status=Unread");
      return res.data;
    },
    refetchInterval: 30000, 
  });

  const unreadCount = notificationsData?.meta?.unreadCount || 0;

  const handleLogout = async () => {
    try {
      // Set both logging out flags to prevent auth refresh attempts
      setLoggingOut(true);
      setAdminLoggingOut(true);
      
      await axiosInstance.get("/api/logout-user");
      queryClient.removeQueries({ queryKey: ["admin"] });
      queryClient.clear();
      toast.success("Logged out successfully!");
      
      // Force immediate redirect using window.location for instant navigation
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
      setLoggingOut(false); // Reset flags on error
      setAdminLoggingOut(false);
    }
  };

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

    return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 z-50 shadow-sm">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
            <Logo />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 font-Poppins truncate">
              {admin?.name || 'Admin'}
            </h3>
            <p className="text-sm text-gray-500 font-Roboto truncate">
              {admin?.email || 'admin@bingo.com'}
            </p>
          </div>
        </Link>
      </div>
      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        {/* Dashboard */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeSidebar === "/dashboard"
                ? "bg-red-50 text-red-600 shadow-sm"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <HomeIcon fill={activeSidebar === "/dashboard" ? "#dc2626" : "#6b7280"} />
            <span className="font-medium font-Roboto">Dashboard</span>
          </Link>
        </div>

        {/* Orders & Sales */}
        <div className="mb-6">
          <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-Roboto">
            Orders & Sales
          </h3>
          <nav className="space-y-1">
            <Link
              href="/dashboard/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/orders"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <ListOrdered size={20} color={activeSidebar === "/dashboard/orders" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Orders</span>
            </Link>
            
            <Link
              href="/dashboard/abandoned-carts"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/abandoned-carts"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <ShoppingCart size={20} color={activeSidebar === "/dashboard/abandoned-carts" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Abandoned Carts</span>
            </Link>

            <Link
              href="/dashboard/payments"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/payments"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <PaymentIcon fill={activeSidebar === "/dashboard/payments" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Payments</span>
            </Link>

          </nav>
        </div>

        {/* Products & Catalog */}
        <div className="mb-6">
          <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-Roboto">
            Products & Catalog
          </h3>
          <nav className="space-y-1">
            <Link
              href="/dashboard/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/products"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <PackageSearch size={20} color={activeSidebar === "/dashboard/products" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Products</span>
            </Link>

            <Link
              href="/dashboard/events"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/events"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BellPlus size={20} color={activeSidebar === "/dashboard/events" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Limited Offers</span>
            </Link>
          </nav>
        </div>

        {/* Users Management */}
        <div className="mb-6">
          <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-Roboto">
            Users Management
          </h3>
          <nav className="space-y-1">
            <Link
              href="/dashboard/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/users"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Users size={20} color={activeSidebar === "/dashboard/users" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Users</span>
            </Link>

            <Link
              href="/dashboard/verifications"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/verifications"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <ShieldCheck size={20} color={activeSidebar === "/dashboard/verifications" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Verifications</span>
            </Link>
          </nav>
        </div>

        {/* System & Monitoring */}
        <div className="mb-6">
          <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-Roboto">
            System & Monitoring
          </h3>
          <nav className="space-y-1">
            <Link
              href="/dashboard/cron-jobs"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/cron-jobs"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <FileClock size={20} color={activeSidebar === "/dashboard/cron-jobs" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Cron Jobs</span>
            </Link>

            <Link
              href="/dashboard/loggers"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/loggers"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <FileClock size={20} color={activeSidebar === "/dashboard/loggers" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Loggers</span>
            </Link>
          </nav>
        </div>

        {/* Events & Notifications */}
        <div className="mb-6">
          <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-Roboto">
            Events & Notifications
          </h3>
          <nav className="space-y-1">
            <div className="relative">
              <Link
                href="/dashboard/notifications"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeSidebar === "/dashboard/notifications"
                    ? "bg-red-50 text-red-600 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <BellRing size={20} color={activeSidebar === "/dashboard/notifications" ? "#dc2626" : "#6b7280"} />
                <span className="font-medium font-Roboto">Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>

        {/* Content Management */}
        <div className="mb-6">
          <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-Roboto">
            Content Management
          </h3>
          <nav className="space-y-1">
            <Link
              href="/dashboard/blog"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar.includes("/dashboard/blog")
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <FileText size={20} color={activeSidebar.includes("/dashboard/blog") ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">Blog</span>
            </Link>
          </nav>
        </div>

        {/* Customization */}
        <div className="mb-6">
          <h3 className="px-4 mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider font-Roboto">
            Customization
          </h3>
          <nav className="space-y-1">
            <Link
              href="/dashboard/customization"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeSidebar === "/dashboard/customization"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <PencilRuler size={20} color={activeSidebar === "/dashboard/customization" ? "#dc2626" : "#6b7280"} />
              <span className="font-medium font-Roboto">All Customization</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Footer Section - Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:text-red-600" />
          <span className="font-medium font-Roboto">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarWrapper;
