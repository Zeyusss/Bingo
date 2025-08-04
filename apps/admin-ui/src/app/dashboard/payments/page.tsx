"use client";
import React, {  useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import HelpModal, { HelpSection } from "../../shared/components/HelpModal";
import HelpButton from "../../shared/components/HelpButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/components/ui/table";

type OrdersApiResponse = {
  orders: any[];
  currentPage: number;
  totalPages: number;
};

const PaymentsPage = () => {
  const [showHelpModal, setShowHelpModal] = useState(false);


  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content: "The Payments page provides comprehensive oversight of all financial transactions on your platform. Monitor payment status, track revenue, and manage payment-related issues with detailed transaction information.",
      subsections: [
        {
          title: "Payment Tracking",
          content: "Monitor all payments in real-time with status updates and transaction details"
        },
        {
          title: "Revenue Management",
          content: "Track payment amounts, fees, and net revenue across all transactions"
        },
        {
          title: "Financial Oversight",
          content: "Review payment patterns, identify issues, and ensure payment security"
        }
      ]
    },
    {
      title: "Payment Status Types",
      content: "Understanding different payment states:",
      subsections: [
        {
          title: "Paid",
          content: "Successfully completed payments with confirmed transactions"
        },
        {
          title: "Pending",
          content: "Payments awaiting processing or confirmation"
        },
        {
          title: "Failed",
          content: "Payments that were unsuccessful due to various reasons"
        },
        {
          title: "Refunded",
          content: "Payments that have been returned to customers"
        }
      ]
    },
    {
      title: "Search & Filtering",
      content: "Efficiently find and organize payments:",
      subsections: [
        {
          title: "Search Function",
          content: "Search by Order ID, shop name, buyer information, or transaction details"
        },
        {
          title: "Status Filtering",
          content: "Filter payments by status to focus on specific transaction types"
        },
        {
          title: "Date Range",
          content: "Filter payments by date ranges for financial reporting"
        }
      ]
    },
    {
      title: "Payment Information",
      content: "Key payment details displayed:",
      subsections: [
        {
          title: "Transaction Details",
          content: "Order ID, payment amount, fees, and net amounts"
        },
        {
          title: "Party Information",
          content: "Buyer details, seller information, and shop associations"
        },
        {
          title: "Payment Methods",
          content: "Payment gateway, method used, and transaction references"
        },
        {
          title: "Timeline",
          content: "Payment date, processing time, and status change history"
        }
      ]
    },
    {
      title: "Best Practices",
      content: "Effective payment management:",
      subsections: [
        {
          title: "Regular Monitoring",
          content: "Review payment statuses regularly and address failed payments promptly"
        },
        {
          title: "Dispute Resolution",
          content: "Handle payment disputes quickly and maintain clear communication"
        },
        {
          title: "Financial Reconciliation",
          content: "Regularly reconcile payments with bank statements and gateway reports"
        }
      ]
    }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useQuery<
    OrdersApiResponse,
    Error,
    OrdersApiResponse
  >({
    queryKey: ["admin-orders", page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/order/api/get-admin-orders?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
  const safeData: OrdersApiResponse =
    data && "orders" in data && "currentPage" in data && "totalPages" in data
      ? data
      : { orders: [], currentPage: 1, totalPages: 1 };
  const orders = safeData.orders;
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
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage all payments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {filteredOrders.length} payments
          </div>
          <HelpButton
            onClick={() => setShowHelpModal(true)}
            text="Payments Help"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search payments by order ID, shop, or buyer..."
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
              <TableHead className="text-center">Seller Earning</TableHead>
              <TableHead className="text-center">Admin Fee (10%)</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Loading payments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order: any) => {
                const sellerShare = order.total * 0.9;
                const adminFee = order.total * 0.1;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="text-center">
                      <span className="text-gray-900 text-sm">
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
                        {order.user?.name || "Guest"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 font-semibold">
                        ${sellerShare.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-purple-600 font-semibold">
                        ${adminFee.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-gray-700 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
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
          Page {safeData.currentPage} of {safeData.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(safeData.totalPages, p + 1))}
          disabled={page >= safeData.totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </Button>
      </div>
      
      {/* Payments Management Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Payments Management Guide"
        description="Learn how to effectively monitor and manage all financial transactions, track revenue, and handle payment-related operations on your platform."
        sections={helpSections}
      />
    </div>
  );
};

export default PaymentsPage;
