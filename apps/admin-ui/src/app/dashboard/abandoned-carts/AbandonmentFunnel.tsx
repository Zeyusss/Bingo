"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import { TrendingDown, TrendingUp, DollarSign, ShoppingCart, Mail, AlertCircle, RefreshCw } from "lucide-react";

interface AdminAbandonmentData {
  success: boolean;
  period: string;
  funnel: {
    totalCheckoutsStarted: number;
    totalCompleted: number;
    totalAbandoned: number;
    conversionRate: number;
    abandonmentRate: number;
  };
  last7Days: {
    completed: number;
    abandoned: number;
    conversionRate: number;
  };
  revenue: {
    earned: number;
    lost: number;
    recoveryOpportunity: number;
  };
  recovery: {
    emailsSent: number;
    pendingRecovery: number;
  };
  topAbandonedProducts: {
    productId: string;
    productTitle: string;
    abandonedCount: number;
    revenueLost: number;
  }[];
}

export default function AbandonmentFunnel() {
  const { data, isLoading, error, refetch } = useQuery<AdminAbandonmentData>({
    queryKey: ["admin-abandonment-analytics"],
    queryFn: async () => {
      const res = await axiosInstance.get("/order/api/analytics/admin-abandonment");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Order Funnel Analytics (Last 30 Days)
          </h2>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </div>
        <div className="flex items-center justify-center h-24">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Failed to load funnel data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            Order Funnel Analytics (Last 30 Days)
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Platform-wide checkout conversion and revenue recovery insights
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {/* Funnel metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Checkouts Started</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{data.funnel.totalCheckoutsStarted.toLocaleString()}</div>
          <div className="text-xs text-blue-600 mt-1">Last 30 days</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{data.funnel.totalCompleted.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">{data.funnel.conversionRate}% conversion</div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium text-red-700">Abandoned</span>
          </div>
          <div className="text-2xl font-bold text-red-900">{data.funnel.totalAbandoned.toLocaleString()}</div>
          <div className="text-xs text-red-600 mt-1">{data.funnel.abandonmentRate}% abandonment</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Recovery Emails</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">{data.recovery.emailsSent.toLocaleString()}</div>
          <div className="text-xs text-orange-600 mt-1">{data.recovery.pendingRecovery} pending</div>
        </div>
      </div>

      {/* Revenue section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Revenue Earned</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{data.revenue.earned.toLocaleString()} EGP</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-red-600" />
            <span className="text-xs font-medium text-red-700">Revenue Lost</span>
          </div>
          <div className="text-xl font-bold text-red-900">{data.revenue.lost.toLocaleString()} EGP</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Last 7 Days Conversion</span>
          </div>
          <div className="text-xl font-bold text-purple-900">{data.last7Days.conversionRate}%</div>
          <div className="text-xs text-purple-600 mt-1">{data.last7Days.completed} completed • {data.last7Days.abandoned} abandoned</div>
        </div>
      </div>

      {/* Top abandoned products */}
      {data.topAbandonedProducts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Top Abandoned Products
          </h3>
          <div className="space-y-2">
            {data.topAbandonedProducts.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {product.productTitle}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{product.abandonedCount} abandoned</div>
                    <div className="text-xs text-red-500">{product.revenueLost.toLocaleString()} EGP lost</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
