"use client";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import useSidebar from "apps/seller-ui/src/hooks/useSidebar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Link from "next/link";
import SidebarItem from "./sidebar.item";
import { useQuery } from "@tanstack/react-query";
import enhancedAxiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import HomeIcon from "apps/seller-ui/src/app/assets/icons/home";
import SidebarMenu from "./sidebar.menu";
import {
  BarChart3,
  BellPlus,
  BellRing,
  CalendarPlus,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
  Store,
} from "lucide-react";
import PaymentIcon from "apps/seller-ui/src/app/assets/icons/payment";

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller, logout } = useSeller({ enabled: true });
  
 
  const { data: notificationsData } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: async () => {
      const res = await enhancedAxiosInstance.get("/seller/api/get-seller-notifications?limit=1&status=Unread");
      return res.data;
    },
    refetchInterval: 30000, 
  });

  const unreadCount = notificationsData?.meta?.unreadCount || 0;

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#3B82F6" : "#6B7280";
    
  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 z-50 overflow-y-auto scrollbar-hide">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <Link href={"/"} className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {seller?.shop?.name || "Your Shop"}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {seller?.shop?.address || "Seller Dashboard"}
            </p>
          </div>
        </Link>
      </div>
      
      {/* Navigation Section */}
      <div className="flex-1 px-4 py-6 space-y-8">
        {/* Dashboard */}
        <div className="space-y-2">
          <SidebarItem
            title="Dashboard"
            icon={<HomeIcon fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
        </div>

        {/* Main Menu */}
        <div className="space-y-2">
          <SidebarMenu title="Main Menu">
            <SidebarItem
              title="Orders"
              icon={<ListOrdered size={20} color={getIconColor("/dashboard/orders")} />}
              isActive={activeSidebar === "/dashboard/orders"}
              href="/dashboard/orders"
            />
            <SidebarItem
              title="Analytics"
              icon={<BarChart3 size={20} color={getIconColor("/dashboard/analytics")} />}
              isActive={activeSidebar === "/dashboard/analytics"}
              href="/dashboard/analytics"
            />
            <SidebarItem
              title="Payments"
              icon={<PaymentIcon fill={getIconColor("/dashboard/payments")} />}
              isActive={activeSidebar === "/dashboard/payments"}
              href="/dashboard/payments"
            />
          </SidebarMenu>
        </div>

        {/* Products */}
        <div className="space-y-2">
          <SidebarMenu title="Products">
            <SidebarItem
              isActive={activeSidebar === "/dashboard/create-product"}
              title="Create Product"
              href="/dashboard/create-product"
              icon={<SquarePlus size={20} color={getIconColor("/dashboard/create-product")} />}
            />
            <SidebarItem
              isActive={activeSidebar === "/dashboard/all-products"}
              title="All Products"
              href="/dashboard/all-products"
              icon={<PackageSearch size={20} color={getIconColor("/dashboard/all-products")} />}
            />
          </SidebarMenu>
        </div>

        {/* Events */}
        <div className="space-y-2">
          <SidebarMenu title="Events">
            <SidebarItem
              isActive={activeSidebar === "/dashboard/create-event"}
              title="Create Event"
              href="/dashboard/create-event"
              icon={<CalendarPlus size={20} color={getIconColor("/dashboard/create-event")} />}
            />
            <SidebarItem
              isActive={activeSidebar === "/dashboard/all-events"}
              title="All Events"
              href="/dashboard/all-events"
              icon={<BellPlus size={20} color={getIconColor("/dashboard/all-events")} />}
            />
          </SidebarMenu>
        </div>

        {/* Management */}
        <div className="space-y-2">
          <SidebarMenu title="Management">
            <div className="relative">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/notifications"}
                title="Notifications"
                href="/dashboard/notifications"
                icon={<BellRing size={20} color={getIconColor("/dashboard/notifications")} />}
              />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <SidebarItem
              isActive={activeSidebar === "/dashboard/inbox"}
              title="Inbox"
              href="/dashboard/inbox"
              icon={<Mail size={20} color={getIconColor("/dashboard/inbox")} />}
            />
            <SidebarItem
              isActive={activeSidebar === "/dashboard/settings"}
              title="Settings"
              href="/dashboard/settings"
              icon={<Settings size={20} color={getIconColor("/dashboard/settings")} />}
            />
          </SidebarMenu>
        </div>

        {/* Extras */}
        <div className="space-y-2">
          <SidebarMenu title="Extras">
            <SidebarItem
              isActive={activeSidebar === "/dashboard/discount-codes"}
              title="Discount Codes"
              href="/dashboard/discount-codes"
              icon={<TicketPercent size={20} color={getIconColor("/dashboard/discount-codes")} />}
            />
            <SidebarItem
              isActive={false}
              title="Logout"
              onClick={logout}
              icon={<LogOut size={20} color={getIconColor("/logout")} />}
            />
          </SidebarMenu>
        </div>
      </div>
    </div>
  );
};

export default SidebarBarWrapper;
