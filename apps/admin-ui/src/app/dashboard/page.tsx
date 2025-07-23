"use client";
import React from 'react';
import { MetricsOverview } from './components/MetricsOverview';
import RevenueChart from './components/RevenueChart';
import DeviceUsageDonut from './components/DeviceUsageDonut';
import RecentOrdersTable from './components/RecentOrdersTable';
import ResourceMonitor from './components/ResourceMonitor';
import { Activity, BarChart3, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';

const WorldMapActivity = dynamic(() => import('./components/WorldMapActivity'), { ssr: false });

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
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Monitor your platform's performance and activity</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Key Metrics
            </h2>
            <p className="text-sm text-gray-600">Real-time overview of your platform's performance</p>
          </div>
          <MetricsOverview />
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-1">
            <RevenueChart />
          </div>
          <div className="lg:col-span-1">
            <DeviceUsageDonut />
          </div>
        </div>
        {/* World Map Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Global Activity
                  </h3>
                  <p className="text-sm text-gray-600">User and seller distribution worldwide</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="h-96">
                <WorldMapActivity />
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Section */}
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
