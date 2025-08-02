import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Skeleton, SkeletonTable } from "./ui/Skeleton";
import { useRecentOrders } from "../../../hooks/useDashboardData";
import { ShoppingCart, Eye, ExternalLink } from "lucide-react";

const RecentOrdersTable: React.FC = () => {
  const { data, isLoading, error } = useRecentOrders();

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
          <SkeletonTable />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-red-600">Recent Orders</CardTitle>
          <CardDescription>Failed to load orders data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            Unable to load orders data
          </div>
        </CardContent>
      </Card>
    );
  }

  const orders = data || [];

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
          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
            View all
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
                orders.map((order: any, index: number) => (
                  <tr
                    key={order.id || index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-900">
                        #{order.id || `ORD-${index + 1}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {order.customerName || "Unknown Customer"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">
                        ${(order.total || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={getStatusVariant(order.status || "pending")}
                      >
                        {order.status || "Pending"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrdersTable;
