"use client";
import useAdmin from "apps/admin-ui/src/hooks/useAdmin";
import useSidebar from "apps/admin-ui/src/hooks/useSidebar";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { toast } from "react-hot-toast";
import Box from "../box";
import Link from "next/link";
import { Sidebar } from "./sidebar.styles";
import Logo from "../../../assets/svgs/logo";
import SidebarItem from "./sidebar.item";
import HomeIcon from "../../../assets/icons/home";
import SidebarMenu from "./sidebar.menu";
import {
  Banknote,
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
} from "lucide-react";
import PaymentIcon from "../../../assets/icons/payment";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const router = useRouter();
  const { admin } = useAdmin();

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/logout-user");
      toast.success("Logged out successfully!");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "var(--background)" : "var(--disabled)";
  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "var(--sidebar-padding)",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
        background: "var(--background)",
        borderRight: "1px solid var(--border)",
        borderRadius: "var(--sidebar-radius)",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header
        style={{ paddingBottom: 24, borderBottom: "1px solid var(--border)" }}
      >
        <Box>
          <Link href={"/"} className="flex items-center gap-3 mb-2">
            <Box style={{ width: 36, height: 36 }}>
              <Logo />
            </Box>
            <Box>
              <h3
                className="text-xl font-bold pl-3"
                style={{ color: "var(--heading)" }}
              >
                {admin?.name}
              </h3>
              <h5
                className="font-medium text-xs pl-3"
                style={{ color: "var(--text)" }}
              >
                {admin?.email}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block  h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<HomeIcon fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
          <div className="block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Orders"
                icon={<ListOrdered fill={getIconColor("/dashboard/orders")} />}
                isActive={activeSidebar === "/dashboard/orders"}
                href="/dashboard/orders"
              />
              <SidebarItem
                title="Abandoned Carts"
                icon={<ShoppingCart size={22} color={getIconColor("/dashboard/abandoned-carts")} />}
                isActive={activeSidebar === "/dashboard/abandoned-carts"}
                href="/dashboard/abandoned-carts"
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/cron-jobs"}
                title="Cron Jobs"
                href="/dashboard/cron-jobs"
                icon={
                  <FileClock
                    size={24}
                    color={getIconColor("/dashboard/cron-jobs")}
                  />
                }
              />
              <SidebarItem
                title="Payments"
                icon={
                  <PaymentIcon fill={getIconColor("/dashboard/payments")} />
                }
                isActive={activeSidebar === "/dashboard/payments"}
                href="/dashboard/payments"
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/products"}
                title="Products"
                href="/dashboard/products"
                icon={
                  <PackageSearch
                    size={22}
                    color={getIconColor("/dashboard/products")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/users"}
                title="Users"
                href="/dashboard/users"
                icon={
                  <Users size={24} color={getIconColor("/dashboard/users")} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/verifications"}
                title="Verifications"
                href="/dashboard/verifications"
                icon={
                  <ShieldCheck
                    size={24}
                    color={getIconColor("/dashboard/verifications")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/events"}
                title="Events"
                href="/dashboard/events"
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor("/dashboard/events")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/withdraw"}
                title="Withdraw"
                href="/dashboard/withdraw"
                icon={
                  <Banknote
                    size={24}
                    color={getIconColor("/dashboard/withdraw")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/loggers"}
                title="Loggers"
                href="/dashboard/loggers"
                icon={
                  <FileClock
                    size={22}
                    color={getIconColor("/dashboard/loggers")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/notifications"}
                title="Notifications"
                href="/dashboard/notifications"
                icon={
                  <BellRing
                    size={24}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Customization">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/customization"}
                title="All Customization"
                href="/dashboard/customization"
                icon={
                  <PencilRuler
                    size={22}
                    color={getIconColor("/dashboard/customization")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100"
                onClick={handleLogout}
                style={{
                  color: "var(--text)",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <LogOut size={20} color={getIconColor("/logout")} />
                <span>Logout</span>
              </div>
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;
