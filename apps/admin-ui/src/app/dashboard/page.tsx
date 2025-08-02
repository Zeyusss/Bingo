"use client";
import React from "react";
import { MetricsOverview } from "./components/MetricsOverview";
import RevenueChart from "./components/RevenueChart";
import RecentOrdersTable from "./components/RecentOrdersTable";
import ResourceMonitor from "./components/ResourceMonitor";
import { Activity, BarChart3, TrendingUp } from "lucide-react";
import ErrorBoundary from "./components/ui/ErrorBoundary";

function DashboardContent() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Monitor your platform's performance and activity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        {/* Key Metrics */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-700" />
              Key Metrics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Real-time overview of your platform's performance
            </p>
          </div>
          <MetricsOverview />
        </div>

        {/* Revenue Chart */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-700" />
              Revenue Trends
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Track platform revenue performance over time
            </p>
          </div>
          <RevenueChart />
        </div>

        {/* Orders and Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOrdersTable />
          </div>
          <div className="lg:col-span-1">
            <ResourceMonitor />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
