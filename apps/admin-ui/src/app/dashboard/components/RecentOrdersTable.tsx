import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Skeleton } from "./ui/Skeleton";
import { useRecentOrders } from "../../../hooks/useDashboardData";
import {
  ShoppingCart,
  ExternalLink,
  Eye,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/Button";

const RecentOrdersTable: React.FC = () => {
  const { data, isLoading, error, refetch } = useRecentOrders();

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
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
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
                <ShoppingCart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Failed to load orders data</CardDescription>
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
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-gray-500">Unable to load orders data</p>
              <p className="text-sm text-gray-400">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const orders = data?.orders || [];

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest {orders.length} transactions
            </CardDescription>
          </div>
          <Link href="/orders" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium transition-colors">
            View all
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Amount
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No recent orders found
                  </td>
                </tr>
              ) : (
                orders.map((order:any) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span>{order.user?.name || 'Unknown Customer'}</span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {order.items?.[0]?.product?.slug ? (
                        <Link
                          href={`/products/${order.items[0].product.slug}`}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4" />
                          View Product
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">No product</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent orders found
            </div>
          ) : (
            orders.map((order: any) => (
              <div
                key={order.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      #{order.id.slice(-8)}
                    </span>
                    <Badge variant={getStatusVariant(order.status)} size="sm">
                      {order.status}
                    </Badge>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">{order.user?.name || "Unknown Customer"}</p>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  {order.items?.[0]?.product?.slug ? (
                    <Link
                      href={`/products/${order.items[0].product.slug}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm">No product</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrdersTable;
