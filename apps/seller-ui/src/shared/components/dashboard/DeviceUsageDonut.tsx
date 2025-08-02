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
import { useDeviceUsage } from "../../../hooks/useDashboardData";
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
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Unable to load chart data</p>
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
            arcLabelsTextColor="#ffffff"
            theme={{
              labels: {
                text: {
                  fontSize: 12,
                  fill: "#374151",
                },
              },
              tooltip: {
                container: {
                  background: "#ffffff",
                  color: "#374151",
                  fontSize: 12,
                  borderRadius: 8,
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #e5e7eb",
                },
              },
            }}
            tooltip={({ datum }) => (
              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  {getDeviceIcon(String(datum.id))}
                  <span className="font-medium">{datum.label}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {datum.value}% of users
                </div>
              </div>
            )}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((item: any) => (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex items-center gap-1 text-sm">
                {getDeviceIcon(item.id)}
                <span className="text-gray-700">{item.label}</span>
                <span className="text-gray-500">({item.value}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceUsageDonut;
