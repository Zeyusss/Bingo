"use client";
import React from "react";
import ErrorBoundary from "../../../../shared/components/dashboard/ErrorBoundary";
import VisitorAnalytics from "../../../../shared/components/dashboard/VisitorAnalytics";
import OrderActivity from "../../../../shared/components/dashboard/OrderActivity";
import RevenueChart from "../../../../shared/components/dashboard/RevenueChart";
import { 
  Eye, 
  Globe,
  DollarSign
} from "lucide-react";

function AnalyticsContent() {
  return (
<div className="w-full min-h-screen bg-[#F4F2EF] bg-[url('/wood-texture.jpg')] bg-cover bg-center bg-fixed px-6 py-8">
  {/* Page Header */}
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900 font-[Poppins] mb-2">Analytics Dashboard</h1>
    <p className="text-lg text-gray-600 font-[Work Sans]">Track your shop's performance and customer insights</p>
  </div>

  {/* 🟢 Customer Activity */}
  <div className="mb-8">
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 font-[Poppins]">
          <Globe className="h-6 w-6 text-orange-600" />
          Customer Activity
        </h3>
        <p className="text-base text-gray-600 font-[Work Sans] mt-2">
          Global order distribution and customer insights
        </p>
      </div>
      <OrderActivity />
    </div>
  </div>
  
  {/* 💰 Revenue Trends */}
  <div className="mb-8">
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 font-[Poppins]">
          <DollarSign className="h-6 w-6 text-orange-600" />
          Revenue Trends
        </h2>
        <p className="text-base text-gray-600 mt-2 font-[Work Sans]">
          Track your earnings and growth over time
        </p>
      </div>
      <RevenueChart />
    </div>
  </div>
  
  {/* 👁️ Visitor Analytics */}
  <div className="mb-8">
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 font-[Poppins]">
          <Eye className="h-6 w-6 text-orange-600" />
          Visitor Analytics
        </h3>
        <p className="text-base text-gray-600 font-[Work Sans] mt-2">
          Track visitor behavior and engagement patterns
        </p>
      </div>
      <VisitorAnalytics />
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
