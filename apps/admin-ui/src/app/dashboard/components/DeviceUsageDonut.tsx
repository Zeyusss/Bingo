"use client";
import React from "react";
import { ResponsivePie } from "@nivo/pie";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { useDeviceUsage } from "../hooks/useDashboardData";
import {
  Smartphone,
  Tablet,
  Monitor,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/Button";

const DeviceUsageDonut: React.FC = () => {
  const { data, isLoading, error, refetch } = useDeviceUsage();

  if (isLoading) {
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
          <Skeleton className="h-64 w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Smartphone className="h-5 w-5" />
                Device Usage
              </CardTitle>
              <CardDescription>
                Failed to load device usage data
              </CardDescription>
            </div>
            <Button
              onClick={() => refetch()}
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
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-gray-500">Unable to load chart data</p>
              <p className="text-sm text-gray-400">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDeviceIcon = (deviceId: string) => {
    switch (deviceId.toLowerCase()) {
      case "phone":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      case "computer":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const deviceColors = {
    Phone: "#3b82f6",
    Tablet: "#10b981",
    Computer: "#f59e0b",
  };

  const chartData =
    data?.map((item: any) => ({
      ...item,
      color: deviceColors[item.id as keyof typeof deviceColors] || "#6b7280",
    })) || [];

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              Device Usage
            </CardTitle>
            <CardDescription>User device distribution</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsivePie
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            innerRadius={0.6}
            padAngle={2}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            colors={{ datum: "data.color" }}
            borderWidth={2}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#374151"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: "#999",
                itemDirection: "left-to-right",
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#000",
                    },
                  },
                ],
              },
            ]}
            theme={{
              legends: {
                text: {
                  fill: "#6b7280",
                  fontSize: 11,
                },
              },
              tooltip: {
                container: {
                  background: "#ffffff",
                  color: "#374151",
                  fontSize: 12,
                  borderRadius: 6,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #e5e7eb",
                },
              },
            }}
          />
        </div>

        {/* Device Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {chartData.map((device) => (
            <div
              key={device.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{ backgroundColor: device.color + "20" }}
              >
                {getDeviceIcon(device.id)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {device.label}
                </div>
                <div className="text-xs text-gray-500">{device.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceUsageDonut;
