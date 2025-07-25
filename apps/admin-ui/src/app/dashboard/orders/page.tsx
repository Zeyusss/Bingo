"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
    getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import { Modal } from "../../shared/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/components/ui/table";

const fetchOrders = async () => {
    const res = await axiosInstance.get("order/api/get-admin-orders");
    return res.data.orders;
};

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/order/api/get-admin-orders?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
  const orders = data?.orders || [];
  const filteredOrders = orders.filter(
    (order: any) =>
      (statusFilter === "all" || order.status === statusFilter) &&
      (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all orders</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredOrders.length} orders
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search orders by ID, shop, or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm">
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Order ID</TableHead>
              <TableHead className="text-center">Shop</TableHead>
              <TableHead className="text-center">Buyer</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Order Status</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Loading orders...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="text-center">
                    <span className="text-gray-900 text-sm truncate">
                      #{order.id.slice(-6).toUpperCase()}
                </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-900 text-sm truncate">
                      {order.shop?.name ?? "Unknown Shop"}
                </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-900">
                      {order.user?.name ?? "Guest"}
                </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span>${order.total}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "Paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        order.deliveryStatus === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.deliveryStatus === "Out for Delivery"
                          ? "bg-blue-100 text-blue-800"
                          : order.deliveryStatus === "Shipped"
                          ? "bg-purple-100 text-purple-800"
                          : order.deliveryStatus === "Packed"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.deliveryStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-700 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
                    >
                      <a
                        href={`/order/${order.id}`}
                aria-label="View and update order status"
                title="View and update order status"
                >
                    Update Status
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </Button>
        <span>
          Page {data?.currentPage || page} of {data?.totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => (data?.totalPages ? Math.min(data.totalPages, p + 1) : p + 1))}
          disabled={data?.totalPages ? page >= data.totalPages : true}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </Button>
      </div>
      {/* Modals for delete/restore can be added here if needed */}
    </div>
  );
};

export default OrdersPage;
