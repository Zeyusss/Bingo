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

  {/* Customer Activity */}
  <div className="mb-8">
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
      <OrderActivity />
    </div>
  </div>
  
  {/* Revenue Trends */}
  <div className="mb-8">
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
      <RevenueChart />
    </div>
  </div>
  
  {/* Visitor Analytics */}
  <div className="mb-8">
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
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
