"use client";
import React, { useState } from "react";
import ErrorBoundary from "../../../../shared/components/dashboard/ErrorBoundary";
import VisitorAnalytics from "../../../../shared/components/dashboard/VisitorAnalytics";
import OrderActivity from "../../../../shared/components/dashboard/OrderActivity";
import RevenueChart from "../../../../shared/components/dashboard/RevenueChart";
import WorldMapActivity from "../../../../shared/components/dashboard/WorldMapActivity";
import { useShopStats } from "../../../../hooks/useDashboardData";
import useSeller from "../../../../hooks/useSeller";
import { 
  BarChart3, 
  Users, 
  Eye, 
  Globe,
  TrendingUp,
  Download,
  Activity,
  DollarSign,
  ShoppingCart,
  Calendar
} from "lucide-react";

function AnalyticsContent() {
  const { data: shopStats } = useShopStats();
  const { seller } = useSeller({ enabled: true });
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-6">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 font-inter">
                    Real-Time Analytics
                  </h1>
                  <p className="text-base text-gray-600 mt-1 font-inter">
                    Live insights into {seller?.shop?.name || 'your shop'}'s performance and customer behavior
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                </div>
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-inter font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-inter font-medium">
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-inter">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 font-inter">
                  ${shopStats?.totalRevenue ? shopStats.totalRevenue.toLocaleString() : '0'}
                </p>
                <p className="text-sm text-green-600 font-inter">+12.5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-inter">Orders Today</p>
                <p className="text-2xl font-semibold text-gray-900 font-inter">
                  {shopStats?.ordersToday || 0}
                </p>
                <p className="text-sm text-green-600 font-inter">+8.3% from last month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-inter">Conversion Rate</p>
                <p className="text-2xl font-semibold text-gray-900 font-inter">
                  {shopStats?.conversionRate || 0}%
                </p>
                <p className="text-sm text-green-600 font-inter">+0.5% from last month</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 font-inter">
              <DollarSign className="h-6 w-6 text-green-600" />
              Revenue Trends
            </h2>
            <p className="text-base text-gray-600 mt-1 font-inter">
              Track your earnings and growth over time
            </p>
          </div>
          <RevenueChart />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 font-inter">
                <Eye className="h-5 w-5 text-blue-600" />
                Visitor Analytics
              </h3>
              <p className="text-base text-gray-600 font-inter">
                Track visitor behavior and engagement patterns
              </p>
            </div>
            <VisitorAnalytics />
          </div>
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 font-inter">
                <Globe className="h-5 w-5 text-green-600" />
                Customer Activity
              </h3>
              <p className="text-base text-gray-600 font-inter">
                Global order distribution and customer insights
              </p>
            </div>
            <OrderActivity />
          </div>
        </div>
        <div className="mb-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 font-inter">
              <Globe className="h-5 w-5 text-emerald-600" />
              Orders & Visitors by Country
            </h3>
            <p className="text-base text-gray-600 font-inter">
              See where your customers and traffic are coming from around the world
            </p>
          </div>
          <WorldMapActivity />
        </div>

          </div>
        </div>

  );
}

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <AnalyticsContent />
    </ErrorBoundary>
  );
}
