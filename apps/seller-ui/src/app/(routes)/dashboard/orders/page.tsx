'use client'
import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender
} from "@tanstack/react-table"
import { Search, ChevronRight } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import Link from "next/link"
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { Input } from "apps/seller-ui/src/shared/components/ui/input"
import { Button } from "apps/seller-ui/src/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "apps/seller-ui/src/shared/components/ui/table"
import { Skeleton } from "apps/seller-ui/src/shared/components/ui/skeleton"

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-seller-orders")
  return res.data.orders
}

const OrdersTable = () => {
  const [globalFilter, setGlobalFilter] = useState("")

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5
  })

  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }: any) => (
        <span className="text-gray-900 text-sm truncate">
          #{row.original.id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      accessorKey: "user.name",
      header: "Buyer",
      cell: ({ row }: any) => (
        <span className="text-gray-900">
          {row.original.user?.name ?? "Guest"}
        </span>
      )
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }: any) => <span>${row.original.total}</span>
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === "Paid"
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}>
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "deliveryStatus",
      header: "Order Status",
      cell: ({ row }: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          row.original.deliveryStatus === "Delivered"
            ? "bg-green-100 text-green-800"
            : row.original.deliveryStatus === "Out for Delivery"
            ? "bg-blue-100 text-blue-800"
            : row.original.deliveryStatus === "Shipped"
            ? "bg-purple-100 text-purple-800"
            : row.original.deliveryStatus === "Packed"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-800"
        }`}>
          {row.original.deliveryStatus}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }: any) => {
        const date = new Date(row.original.createdAt).toLocaleDateString()
        return <span className="text-gray-700 text-sm">{date}</span>
      },
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
          onClick={() => (window.location.href = `/order/${row.original.id}`)}
        >
          Update Status
        </Button>
      ),
    },
  ], [])

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage all orders</p>
        </div>
        <div className="text-sm text-gray-500">{orders.length} orders</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search orders by ID, shop, or buyer..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="w-full h-10" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

export default OrdersTable
