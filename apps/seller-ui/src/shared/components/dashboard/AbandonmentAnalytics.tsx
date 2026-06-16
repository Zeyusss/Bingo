"use client";
import { TrendingDown, TrendingUp, DollarSign, ShoppingCart, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { Button } from "./ui/Button";
import { useSellerAbandonmentAnalytics } from "../../../hooks/useDashboardData";

export default function AbandonmentAnalytics() {
  const { data, isLoading, error, refetch } = useSellerAbandonmentAnalytics();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-gray-600" />
            Cart Abandonment Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Cart Abandonment Insights
            </CardTitle>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Failed to load abandonment data</p>
              <p className="text-sm text-gray-400">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.products.length === 0) {
    return (
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            Cart Abandonment Insights
          </CardTitle>
          <p className="text-sm text-gray-600">No abandonment data yet — great news!</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No abandoned carts</p>
              <p className="text-sm">All your customers are completing their purchases</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              Cart Abandonment Insights
            </CardTitle>
            <p className="text-sm text-gray-600">
              {data.overallConversionRate}% of checkouts complete • {data.products.length} products tracked
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-8 w-8 p-0">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              className="bg-green-50 p-4 rounded-lg border border-green-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-900 text-sm">Revenue Earned</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {data.totalRevenueEarned.toLocaleString()} EGP
              </div>
              <div className="text-xs text-green-600 mt-1">From completed orders</div>
            </motion.div>

            <motion.div
              className="bg-red-50 p-4 rounded-lg border border-red-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-red-900 text-sm">Revenue Lost</span>
              </div>
              <div className="text-2xl font-bold text-red-700">
                {data.totalRevenueLost.toLocaleString()} EGP
              </div>
              <div className="text-xs text-red-600 mt-1">From abandoned carts</div>
            </motion.div>

            <motion.div
              className="bg-orange-50 p-4 rounded-lg border border-orange-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-orange-600" />
                <span className="font-semibold text-orange-900 text-sm">Conversion Rate</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">
                {data.overallConversionRate}%
              </div>
              <div className="text-xs text-orange-600 mt-1">Checkouts completed</div>
            </motion.div>
          </div>

          {/* Per-product breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-gray-600" />
              <h4 className="font-semibold text-gray-900">Products — Abandonment vs Conversion</h4>
            </div>
            {data.products.map((product, index) => (
              <motion.div
                key={product.productId}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm truncate flex-1 mr-4">
                    {product.productTitle}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    product.conversionRate >= 70
                      ? "bg-green-100 text-green-700"
                      : product.conversionRate >= 40
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {product.conversionRate}% converted
                  </span>
                </div>
                {/* Conversion bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${product.conversionRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{product.paidCount} sold • {product.abandonedCount} abandoned</span>
                  <span className="text-red-500">{product.revenueLost.toLocaleString()} EGP lost</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
