"use client";
import {
  Globe2,
  Users,
  ShoppingCart,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import {
  useWorldMapActivity,
  useDeviceUsage,
} from "../../../hooks/useDashboardData";
import "leaflet/dist/leaflet.css";

interface OrderActivityData {
  country: string;
  orders: number;
  visitors: number;
  conversionRate: number;
}

export default function OrderActivity() {
  const {
    data: worldData,
    isLoading: worldLoading,
    error: worldError,
  } = useWorldMapActivity();
  const {
    data: deviceData,
    isLoading: deviceLoading,
    error: deviceError,
  } = useDeviceUsage();

  if (worldLoading || deviceLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (worldError || deviceError) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-red-600">Order Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            Failed to load order activity data
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

  const totalOrders =
    worldData?.reduce((sum: any, item: any) => sum + item.orders, 0) || 0;
  const topDevice = deviceData?.reduce(
    (max: any, device: any) => (device.value > max.value ? device : max),
    deviceData[0]
  );

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
              Worldwide order activity • Total: {totalOrders.toLocaleString()}{" "}
              orders
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-purple-600">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-medium">Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Device Usage Summary */}
          {deviceData && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-purple-900">Device Usage</h4>
                <div className="flex items-center gap-2">
                  {topDevice?.id === "Phone" && (
                    <Smartphone className="h-4 w-4 text-purple-600" />
                  )}
                  {topDevice?.id === "Computer" && (
                    <Monitor className="h-4 w-4 text-purple-600" />
                  )}
                  {topDevice?.id === "Tablet" && (
                    <Tablet className="h-4 w-4 text-purple-600" />
                  )}
                  <span className="text-sm font-medium text-purple-700">
                    {topDevice?.id} ({topDevice?.value}%)
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {deviceData.map((device: any) => (
                  <div key={device.id} className="flex-1 text-center">
                    <div className="text-lg font-bold text-purple-900">
                      {device.value}%
                    </div>
                    <div className="text-xs text-purple-600">
                      {device.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* World Map */}
          <div className="h-64 w-full rounded-lg overflow-hidden border">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%", background: "#f8fafc" }}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {worldData?.map((loc: any, i: number) => (
                <CircleMarker
                  key={i}
                  center={[loc.lat, loc.lng]}
                  radius={Math.max(
                    8,
                    Math.min(20, 8 + Math.log(loc.orders) * 2)
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
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        Orders: {loc.orders.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Visitors:{" "}
                        {Math.round(
                          loc.orders * (1 + Math.random() * 2)
                        ).toLocaleString()}
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          {/* Top Countries List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Top Order Countries</h4>
            {worldData?.slice(0, 5).map((item: any, index: number) => (
              <motion.div
                key={item.country}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.country}
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round(
                        item.orders * (1 + Math.random() * 2)
                      ).toLocaleString()}{" "}
                      visitors
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {item.orders.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">orders</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
