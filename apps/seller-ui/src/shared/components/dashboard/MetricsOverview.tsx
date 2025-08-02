import React from "react";
import { MetricCard } from "./ui/MetricCard";
import { useSystemStats } from "../../../hooks/useDashboardData";
import {
  Package,
  Store,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";

export const MetricsOverview: React.FC = () => {
  const { data: stats, isLoading, error } = useSystemStats();

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="col-span-full text-center text-red-500 p-4">
          Failed to load metrics
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      description: "All products",
      icon: <Package className="h-5 w-5" />,
      trend: {
        value: 12.5,
        label: "vs last month",
        direction: "up" as const,
      },
    },
    {
      title: "Active Listings",
      value: stats?.activeListings || 0,
      description: "In stock products",
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
      description: "Orders received",
      icon: <ShoppingCart className="h-5 w-5" />,
      trend: {
        value: -2.1,
        label: "vs yesterday",
        direction: "down" as const,
      },
    },
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      description: "All time earnings",
      icon: <DollarSign className="h-5 w-5" />,
      trend: {
        value: 15.3,
        label: "vs last month",
        direction: "up" as const,
      },
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate || 0}%`,
      description: "Visitor to buyer",
      icon: <TrendingUp className="h-5 w-5" />,
      trend: {
        value: 2.1,
        label: "vs last week",
        direction: "up" as const,
      },
    },
    {
      title: "Shop Rating",
      value: "4.8★",
      description: "Average rating",
      icon: <Users className="h-5 w-5" />,
      trend: {
        value: 0.2,
        label: "vs last month",
        direction: "up" as const,
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
