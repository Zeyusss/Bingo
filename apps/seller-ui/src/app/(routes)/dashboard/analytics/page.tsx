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
<div className="w-full px-6 py-8">
  {/* 🟢 Customer Activity */}
  <div className="mb-8">
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
  {/* 💰 Revenue Trends */}
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
  {/* 👁️ Visitor Analytics */}
  <div className="mb-8">
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
