"use client";
import React from "react";
import { MetricsOverview } from "../../../shared/components/dashboard/MetricsOverview";
import RevenueChart from "../../../shared/components/dashboard/RevenueChart";
import DeviceUsageDonut from "../../../shared/components/dashboard/DeviceUsageDonut";
import RecentOrdersTable from "../../../shared/components/dashboard/RecentOrdersTable";
import VisitorAnalytics from "../../../shared/components/dashboard/VisitorAnalytics";
import OrderActivity from "../../../shared/components/dashboard/OrderActivity";
import TopSellingProducts from "../../../shared/components/dashboard/TopSellingProducts";
import {
  Activity,
  BarChart3,
  TrendingUp,
  Users,
  Globe2,
  Package,
} from "lucide-react";
import dynamic from "next/dynamic";

const WorldMapActivity = dynamic(
  () => import("../../../shared/components/dashboard/WorldMapActivity"),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Shop Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Monitor your shop's performance and activity
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Shop operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Shop Metrics
            </h2>
            <p className="text-sm text-gray-600">
              Real-time overview of your shop's performance
            </p>
          </div>
          <MetricsOverview />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-1">
            <RevenueChart />
          </div>
          <div className="lg:col-span-1">
            <DeviceUsageDonut />
          </div>
        </div>
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Visitor Analytics
            </h2>
            <p className="text-sm text-gray-600">
              Where your visitors come from - state and country breakdown
            </p>
          </div>
          <VisitorAnalytics />
        </div>
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-purple-600" />
              Customer Orders Distribution
            </h2>
            <p className="text-sm text-gray-600">
              Worldwide order activity with visitors and device usage
            </p>
          </div>
          <OrderActivity />
        </div>
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Top Selling Products
            </h2>
            <p className="text-sm text-gray-600">
              Your best performing products by sales and revenue
            </p>
          </div>
          <TopSellingProducts />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="lg:col-span-1">
            <RecentOrdersTable />
          </div>
        </div>
      </div>
    </div>
  );
}
