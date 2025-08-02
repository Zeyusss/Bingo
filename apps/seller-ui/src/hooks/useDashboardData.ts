import { useQuery } from "@tanstack/react-query";

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URI || "http://localhost:8080";

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch data");
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
  orders: number;
  country: string;
}

export interface VisitorData {
  country: string;
  state: string;
  visitors: number;
  percentage: number;
}

export interface TopProduct {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
  rating: number;
  image?: string;
  category: string;
}

export interface ShopStatsData {
  totalProducts: number;
  activeListings: number;
  ordersToday: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface SystemStatsData {
  totalProducts: number;
  activeListings: number;
  ordersToday: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface RecentOrdersData {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}
[];

export const QUERY_KEYS = {
  REVENUE: ["seller-dashboard", "revenue"] as const,
  DEVICE_USAGE: ["seller-dashboard", "device-usage"] as const,
  WORLD_ACTIVITY: ["seller-dashboard", "world-activity"] as const,
  RECENT_ORDERS: ["seller-dashboard", "recent-orders"] as const,
  SHOP_STATS: ["seller-dashboard", "shop-stats"] as const,
  SYSTEM_STATS: ["seller-dashboard", "system-stats"] as const,
  VISITOR_ANALYTICS: ["seller-dashboard", "visitor-analytics"] as const,
  TOP_SELLING_PRODUCTS: ["seller-dashboard", "top-selling-products"] as const,
};

export function useRevenueData(period: "7d" | "30d" | "90d" = "30d") {
  return useQuery<RevenueData[]>({
    queryKey: [...QUERY_KEYS.REVENUE, period],
    queryFn: () =>
      fetcher(`${BASE_URL}/seller/api/dashboard/revenue?period=${period}`),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useDeviceUsage() {
  return useQuery<DeviceUsageData[]>({
    queryKey: QUERY_KEYS.DEVICE_USAGE,
    queryFn: () => fetcher(`${BASE_URL}/seller/api/dashboard/device-usage`),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useWorldMapActivity() {
  return useQuery<WorldActivityData[]>({
    queryKey: QUERY_KEYS.WORLD_ACTIVITY,
    queryFn: () => fetcher(`${BASE_URL}/seller/api/dashboard/world-activity`),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useVisitorAnalytics() {
  return useQuery<VisitorData[]>({
    queryKey: QUERY_KEYS.VISITOR_ANALYTICS,
    queryFn: () =>
      fetcher(`${BASE_URL}/seller/api/dashboard/visitor-analytics`),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTopSellingProducts() {
  return useQuery<TopProduct[]>({
    queryKey: QUERY_KEYS.TOP_SELLING_PRODUCTS,
    queryFn: () =>
      fetcher(`${BASE_URL}/seller/api/dashboard/top-selling-products`),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRecentOrders(limit: number = 5) {
  return useQuery<RecentOrdersData[]>({
    queryKey: [...QUERY_KEYS.RECENT_ORDERS, limit],
    queryFn: () =>
      fetcher(`${BASE_URL}/seller/api/dashboard/recent-orders?limit=${limit}`),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useShopStats() {
  return useQuery<ShopStatsData>({
    queryKey: QUERY_KEYS.SHOP_STATS,
    queryFn: () => fetcher(`${BASE_URL}/seller/api/dashboard/shop-stats`),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSystemStats() {
  return useQuery<SystemStatsData>({
    queryKey: QUERY_KEYS.SYSTEM_STATS,
    queryFn: () => fetcher(`${BASE_URL}/seller/api/dashboard/shop-stats`),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
