import React from "react";
import { MetricCard } from "./ui/MetricCard";
import { useSystemStats } from "../hooks/useDashboardData";
import {
  Users,
  Store,
  ShoppingCart,
  Activity,
  Clock,
  Zap,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/Button";

export const MetricsOverview: React.FC = () => {
  const { data: stats, isLoading, error, refetch } = useSystemStats();

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="col-span-full">
          <div className="bg-white border border-red-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Failed to load metrics
                </h3>
                <p className="text-sm text-gray-600">
                  Unable to fetch system statistics
                </p>
              </div>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      description: "Registered users",
      icon: <Users className="h-5 w-5" />,
      trend: {
        value: 12.5,
        label: "vs last month",
        direction: "up" as const,
      },
    },
    {
      title: "Active Sellers",
      value: stats?.activeSellers || 0,
      description: "Verified sellers",
      icon: <Store className="h-5 w-5" />,
      trend: {
        value: 8.2,
        label: "vs last month",
        direction: "up" as const,
      },
    },
    {
      title: "Orders Today",
      value: stats?.ordersToday || 0,
      description: "Orders processed",
      icon: <ShoppingCart className="h-5 w-5" />,
      trend: {
        value: -2.1,
        label: "vs yesterday",
        direction: "down" as const,
      },
    },
    {
      title: "System Uptime",
      value: `${stats?.uptime || 0}%`,
      description: "Last 30 days",
      icon: <Activity className="h-5 w-5" />,
      trend: {
        value: 0.1,
        label: "vs last month",
        direction: "up" as const,
      },
    },
    {
      title: "API Latency",
      value: `${stats?.apiLatency || 0}ms`,
      description: "Average response",
      icon: <Zap className="h-5 w-5" />,
      trend: {
        value: -5.3,
        label: "vs last hour",
        direction: "up" as const,
      },
    },
    {
      title: "Health Score",
      value: "98.5%",
      description: "Overall system",
      icon: <Clock className="h-5 w-5" />,
      trend: {
        value: 1.2,
        label: "vs last week",
        direction: "up" as const,
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          description={metric.description}
          icon={metric.icon}
          trend={metric.trend}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};
