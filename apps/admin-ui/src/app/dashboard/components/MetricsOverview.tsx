import React from 'react';
import { MetricCard } from './ui/MetricCard';
import { useSystemStats } from '../hooks/useDashboardData';
import { Users, Store, ShoppingCart, Activity, Clock, Zap } from 'lucide-react';

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
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      description: 'Registered users',
      icon: <Users className="h-5 w-5" />,
      trend: {
        value: 12.5,
        label: 'vs last month',
        direction: 'up' as const,
      },
    },
    {
      title: 'Active Sellers',
      value: stats?.activeSellers || 0,
      description: 'Verified sellers',
      icon: <Store className="h-5 w-5" />,
      trend: {
        value: 8.2,
        label: 'vs last month',
        direction: 'up' as const,
      },
    },
    {
      title: 'Orders Today',
      value: stats?.ordersToday || 0,
      description: 'Orders processed',
      icon: <ShoppingCart className="h-5 w-5" />,
      trend: {
        value: -2.1,
        label: 'vs yesterday',
        direction: 'down' as const,
      },
    },
    {
      title: 'System Uptime',
      value: `${stats?.uptime || 0}%`,
      description: 'Last 30 days',
      icon: <Activity className="h-5 w-5" />,
      trend: {
        value: 0.1,
        label: 'vs last month',
        direction: 'up' as const,
      },
    },
    {
      title: 'API Latency',
      value: `${stats?.apiLatency || 0}ms`,
      description: 'Average response',
      icon: <Zap className="h-5 w-5" />,
      trend: {
        value: -5.3,
        label: 'vs last hour',
        direction: 'up' as const,
      },
    },
    {
      title: 'Health Score',
      value: '98.5%',
      description: 'Overall system',
      icon: <Clock className="h-5 w-5" />,
      trend: {
        value: 1.2,
        label: 'vs last week',
        direction: 'up' as const,
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
