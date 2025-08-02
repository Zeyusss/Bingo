"use client";
import {
  TrendingUp,
  Package,
  DollarSign,
  Star,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { useTopSellingProducts } from "../../../hooks/useDashboardData";
import { Button } from "./ui/Button";

interface TopProduct {
  id: string;
  name: string;
  totalSold: number;
  revenue: number;
  rating: number;
  image?: string;
  category: string;
}

export default function TopSellingProducts() {
  const { data, isLoading, error, refetch } = useTopSellingProducts();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
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
            <div>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Package className="h-5 w-5" />
                Top Selling Products
              </CardTitle>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">
                Failed to load top selling products
              </p>
              <p className="text-sm text-gray-400">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue =
    data?.reduce(
      (sum: number, product: TopProduct) => sum + product.revenue,
      0
    ) || 0;
  const totalSold =
    data?.reduce(
      (sum: number, product: TopProduct) => sum + product.totalSold,
      0
    ) || 0;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Top Selling Products
            </CardTitle>
            <p className="text-sm text-gray-600">
              Best performing products • Total: ${totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-orange-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">
              {totalSold.toLocaleString()} sold
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Total Revenue
                </span>
              </div>
              <div className="text-xl font-bold text-orange-900">
                ${totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Units Sold
                </span>
              </div>
              <div className="text-xl font-bold text-green-900">
                {totalSold.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Top 5 Products</h4>
            {data?.map((product: TopProduct, index: number) => (
              <motion.div
                key={product.id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-orange-600"
                        : "bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-orange-600" />
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900 truncate">
                      {product.name}
                    </h5>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {product.category}
                  </p>
                </div>

                {/* Sales Data */}
                <div className="text-right hidden sm:block">
                  <div className="font-medium text-gray-900">
                    {product.totalSold.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">sold</div>
                  <div className="text-sm font-medium text-green-600">
                    ${product.revenue.toLocaleString()}
                  </div>
                </div>

                {/* Mobile Sales Data */}
                <div className="text-right sm:hidden">
                  <div className="font-medium text-gray-900 text-sm">
                    {product.totalSold.toLocaleString()} sold
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    ${product.revenue.toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Performance Indicator */}
          {data && data.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-blue-900">Performance</h5>
                  <p className="text-sm text-blue-600">
                    Top product: {data[0].name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-900">
                    ${data[0].revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">
                    Best seller revenue
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
