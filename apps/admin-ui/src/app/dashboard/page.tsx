"use client";
import React, { useState } from "react";
import { MetricsOverview } from "./components/MetricsOverview";
import RevenueChart from "./components/RevenueChart";
import RecentOrdersTable from "./components/RecentOrdersTable";
import ResourceMonitor from "./components/ResourceMonitor";
import { Activity, BarChart3, TrendingUp } from "lucide-react";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import HelpModal, { HelpSection } from "../shared/components/HelpModal";
import HelpButton from "../shared/components/HelpButton";

function DashboardContent() {
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Help content for the dashboard
  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content: "The Admin Dashboard provides a comprehensive view of your platform's performance, user activity, and business metrics. Monitor key indicators, track revenue trends, and oversee system health from this central hub.",
      subsections: [
        {
          title: "Real-Time Monitoring",
          content: "All metrics update automatically to show current platform status"
        },
        {
          title: "Performance Tracking",
          content: "Monitor user engagement, revenue trends, and system performance"
        },
        {
          title: "Quick Actions",
          content: "Access frequently used admin functions directly from the dashboard"
        }
      ]
    },
    {
      title: "Key Metrics",
      content: "Understanding the main performance indicators:",
      subsections: [
        {
          title: "Total Users",
          content: "Active registered users on the platform with growth percentage"
        },
        {
          title: "Total Revenue",
          content: "Cumulative revenue with monthly growth trends"
        },
        {
          title: "Active Orders",
          content: "Current pending and processing orders"
        },
        {
          title: "System Health",
          content: "Overall platform performance and uptime status"
        }
      ]
    },
    {
      title: "Charts & Analytics",
      content: "Visual data representation:",
      subsections: [
        {
          title: "Revenue Chart",
          content: "Track revenue trends over time with monthly, weekly, and daily views"
        },
        {
          title: "User Activity",
          content: "Monitor user engagement patterns and peak usage times"
        },
        {
          title: "Order Analytics",
          content: "View order completion rates, popular products, and sales trends"
        }
      ]
    },
    {
      title: "Recent Activity",
      content: "Stay updated with latest platform activity:",
      subsections: [
        {
          title: "Recent Orders",
          content: "View latest customer orders with status updates and quick actions"
        },
        {
          title: "System Events",
          content: "Monitor important system events, updates, and alerts"
        },
        {
          title: "User Actions",
          content: "Track recent user registrations, logins, and significant activities"
        }
      ]
    },
    {
      title: "Navigation",
      content: "Quick access to admin functions:",
      subsections: [
        {
          title: "Users Management",
          content: "Manage user accounts, permissions, and user-related settings"
        },
        {
          title: "Products & Orders",
          content: "Oversee product catalog, inventory, and order management"
        },
        {
          title: "Analytics & Reports",
          content: "Access detailed reports, analytics, and business intelligence"
        },
        {
          title: "System Settings",
          content: "Configure platform settings, integrations, and administrative options"
        }
      ]
    }
  ];

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
              <HelpButton
                onClick={() => setShowHelpModal(true)}
                text="Dashboard Help"
              />
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
      
      {/* Dashboard Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Dashboard Guide"
        description="Learn how to effectively use the Admin Dashboard to monitor your platform's performance and manage key operations."
        sections={helpSections}
      />
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
