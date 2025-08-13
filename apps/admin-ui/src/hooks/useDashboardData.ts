import { useQuery } from "@tanstack/react-query";

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URI || "http://localhost:8080";

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export interface RevenueData {
  id: string;
  color: string;
  data: { x: string; y: number }[];
}

export interface DeviceUsageData {
  id: string;
  label: string;
  value: number;
}

export interface WorldActivityData {
  lat: number;
  lng: number;
  users: number;
  sellers: number;
  country: string;
}

export interface SystemStatsData {
  totalUsers: number;
  activeSellers: number;
  ordersToday: number;
  uptime: number;
  apiLatency: number;
}

export interface ResourceMonitorData {
  cpu: number;
  memory: number;
  disk: number;
  kafkaHealth: string;
  kafkaLag: number;
}

export interface RecentOrdersData {
  orders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    orderItems: {
      product: {
        id: string;
        title: string;
        slug: string;
      };
    }[];
  }[];
}

export const QUERY_KEYS = {
  REVENUE: ["dashboard", "revenue"] as const,
  DEVICE_USAGE: ["dashboard", "device-usage"] as const,
  WORLD_ACTIVITY: ["dashboard", "world-activity"] as const,
  RECENT_ORDERS: ["dashboard", "recent-orders"] as const,
  SYSTEM_STATS: ["dashboard", "system-stats"] as const,
  RESOURCE_MONITOR: ["dashboard", "resource-monitor"] as const,
};

export function useRevenueData() {
  return useQuery({
    queryKey: QUERY_KEYS.REVENUE,
    queryFn: () => fetcher(`${BASE_URL}/admin/api/dashboard/revenue`),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useDeviceUsage() {
  return useQuery({
    queryKey: QUERY_KEYS.DEVICE_USAGE,
    queryFn: () => fetcher(`${BASE_URL}/admin/api/dashboard/device-usage`),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useWorldMapActivity() {
  return useQuery({
    queryKey: QUERY_KEYS.WORLD_ACTIVITY,
    queryFn: () => fetcher(`${BASE_URL}/admin/api/dashboard/world-activity`),
    staleTime: 15 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.RECENT_ORDERS,
    queryFn: () => fetcher(`${BASE_URL}/order/api/get-recent-orders`),
    staleTime: 5 * 60 * 1000, 
    refetchInterval: 10 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_STATS,
    queryFn: () => fetcher(`${BASE_URL}/admin/api/dashboard/system-stats`),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useResourceMonitor() {
  return useQuery({
    queryKey: QUERY_KEYS.RESOURCE_MONITOR,
    queryFn: () => fetcher(`${BASE_URL}/admin/api/dashboard/resource-monitor`),
    staleTime: 2 * 60 * 1000, 
    refetchInterval: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  });
}
