"use client";
import {
  Globe2,
  Users,
  ShoppingCart,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import {
  useWorldMapActivity,
  useDeviceUsage,
  useShopStats,
} from "../../../hooks/useDashboardData";
import { Button } from "./ui/Button";
import "leaflet/dist/leaflet.css";

interface WorldActivityData {
  country: string;
  orders: number;
  visitors: number;
  cities: string[];
  conversionRate: number;
  lat: number;
  lng: number;
}

export default function OrderActivity() {
  const {
    data: worldData,
    isLoading: worldLoading,
    error: worldError,
    refetch: refetchWorld,
  } = useWorldMapActivity();
  const {
    data: deviceData,
    isLoading: deviceLoading,
    error: deviceError,
    refetch: refetchDevice,
  } = useDeviceUsage();
  const {
    data: shopStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useShopStats();

  if (worldLoading || deviceLoading || statsLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-gray-600" />
            Customer Orders Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (worldError || deviceError) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Globe2 className="h-5 w-5" />
                Customer Orders Distribution
              </CardTitle>
            </div>
            <Button
              onClick={() => {
                if (worldError) refetchWorld();
                if (deviceError) refetchDevice();
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">
                Failed to load order distribution data
              </p>
              <p className="text-sm text-gray-400">
                {worldError instanceof Error
                  ? worldError.message
                  : deviceError instanceof Error
                  ? deviceError.message
                  : "An error occurred"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (typeof window === "undefined") return null;
  const {
    MapContainer,
    TileLayer,
    CircleMarker,
    Tooltip,
  } = require("react-leaflet");

  const worldActivityData = worldData as WorldActivityData[];
  const totalOrders =
    worldActivityData?.reduce(
      (sum: number, item: WorldActivityData) => sum + item.orders,
      0
    ) || 0;
  const totalVisitors =
    worldActivityData?.reduce(
      (sum: number, item: WorldActivityData) => sum + item.visitors,
      0
    ) || 0;
  const topCountry = worldActivityData?.[0];
  const topDevice = deviceData?.reduce(
    (max: any, device: any) => (device.value > max.value ? device : max),
    deviceData[0]
  );

  if (totalOrders === 0 && totalVisitors === 0) {
    return (
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-purple-600" />
                Customer Orders Distribution
              </CardTitle>
              <p className="text-sm text-gray-600">
                No orders or visitors yet • Start selling to see distribution
                data
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">No data</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Globe2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No orders yet</p>
              <p className="text-sm">
                Start selling to see customer distribution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-purple-600" />
              Customer Orders Distribution
            </CardTitle>
            <p className="text-sm text-gray-600">
              Global order activity & conversion rates •{" "}
              {totalOrders.toLocaleString()} orders from{" "}
              {totalVisitors.toLocaleString()} visitors
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-purple-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCountry && (
              <motion.div
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe2 className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">
                    Top Country
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {topCountry.country}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {topCountry.orders.toLocaleString()} orders
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{topCountry.visitors.toLocaleString()} visitors</span>
                  <span>{topCountry.cities.length} cities</span>
                  <span>{topCountry.conversionRate}% conversion</span>
                </div>
              </motion.div>
            )}
            {deviceData && deviceData.some((d: any) => d.value > 0) && (
              <motion.div
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {topDevice?.id === "Phone" && (
                    <Smartphone className="h-4 w-4 text-gray-600" />
                  )}
                  {topDevice?.id === "Computer" && (
                    <Monitor className="h-4 w-4 text-gray-600" />
                  )}
                  {topDevice?.id === "Tablet" && (
                    <Tablet className="h-4 w-4 text-gray-600" />
                  )}
                  <span className="font-semibold text-gray-900">
                    Top Device
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {topDevice?.id}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {topDevice?.value}% of users
                </div>
                <div className="text-xs text-gray-500">
                  {deviceData
                    .map((d: any) => `${d.label}: ${d.value}%`)
                    .join(" • ")}
                </div>
              </motion.div>
            )}
            <motion.div
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">
                    Global Conversion
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchStats()}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">
                {shopStats?.conversionRate || 0}%
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {totalOrders.toLocaleString()} orders
              </div>
              <div className="text-xs text-gray-500">
                from {totalVisitors.toLocaleString()} visitors
              </div>
            </motion.div>
          </div>

          {worldActivityData && worldActivityData.length > 0 && (
            <div className="h-64 w-full rounded-lg overflow-hidden border">
              <MapContainer
                center={[20, 0]}
                zoom={2}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", background: "#f8fafc" }}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {worldActivityData?.map((loc: WorldActivityData, i: number) => (
                  <CircleMarker
                    key={i}
                    center={[loc.lat, loc.lng]}
                    radius={Math.max(
                      8,
                      Math.min(25, 8 + Math.log(loc.orders) * 3)
                    )}
                    pathOptions={{
                      color: "#8b5cf6",
                      fillColor: "#8b5cf6",
                      fillOpacity: 0.6,
                      weight: 2,
                    }}
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -8]}
                      opacity={1}
                      permanent={false}
                      className="bg-white text-gray-900 rounded-lg px-3 py-2 shadow-lg border"
                    >
                      <div className="font-bold text-purple-600">
                        {loc.country}
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          Orders: {loc.orders.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Visitors: {loc.visitors.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Conversion: {loc.conversionRate}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {loc.cities.length} cities
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          )}
          {worldActivityData && worldActivityData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-600" />
                <h4 className="font-semibold text-gray-900">
                  Top Countries by Orders
                </h4>
              </div>
              {worldActivityData
                ?.slice(0, 5)
                .map((item: WorldActivityData, index: number) => (
                  <motion.div
                    key={item.country}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.country}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.visitors.toLocaleString()} visitors •{" "}
                          {item.cities.length} cities
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {item.orders.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.conversionRate}% conversion
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
          {deviceData && deviceData.some((d: any) => d.value > 0) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-gray-600" />
                <h4 className="font-semibold text-gray-900">
                  Device Usage Breakdown
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {deviceData.map((device: any, index: number) => (
                  <motion.div
                    key={device.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-blue-300 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-center mb-2">
                      {device.id === "Phone" && (
                        <Smartphone className="h-5 w-5 text-blue-600" />
                      )}
                      {device.id === "Computer" && (
                        <Monitor className="h-5 w-5 text-blue-600" />
                      )}
                      {device.id === "Tablet" && (
                        <Tablet className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {device.value}%
                    </div>
                    <div className="text-xs text-gray-500">{device.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
