'use client'
import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from "@tanstack/react-table"
import { useQuery } from '@tanstack/react-query'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { Button } from "apps/seller-ui/src/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "apps/seller-ui/src/shared/components/ui/table"
import Pagination from 'apps/seller-ui/src/shared/components/pagination/Pagination'
import FilterControls from 'apps/seller-ui/src/shared/components/filters/FilterControls'
import { usePaginationAndFilters } from 'apps/seller-ui/src/hooks/usePaginationAndFilters'

const fetchOrders = async (queryString: string) => {
  const res = await axiosInstance.get(`/order/api/get-seller-orders?${queryString}`)
  return res.data
}

const OrdersTable = () => {
  const [personalizationModal, setPersonalizationModal] = useState({
    isOpen: false,
    data: null as any
  })

  const {
    limit,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    queryString,
    clearFilters,
    setPage,
    setLimit,
    filters,
    setFilter,
  } = usePaginationAndFilters({
    defaultLimit: 10,
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    additionalFilters: {
      status: 'all',
      deliveryStatus: 'all',
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders", queryString],
    queryFn: () => fetchOrders(queryString),
    staleTime: 1000 * 60 * 5
  })

  const orders = data?.orders || []
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false }

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
        <div className="flex items-center space-x-2">
          {row.original.user?.avatar?.url && (
            <img
              src={row.original.user.avatar.url}
              alt={row.original.user.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          )}
          <span className="text-gray-900 font-[Work Sans]">
            {row.original.user?.name ?? "Guest"}
          </span>
        </div>
      )
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }: any) => <span className="font-medium text-gray-900 font-[Work Sans]">${row.original.total}</span>
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
      header: "Personalization",
      cell: ({ row }: any) => {
        const hasPersonalization = row.original.items?.some((item: any) => 
          item.personalizationData && Object.keys(item.personalizationData).length > 0
        );
        
        return hasPersonalization ? (
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50 rounded-full font-[Work Sans] font-medium"
            onClick={() => setPersonalizationModal({
              isOpen: true,
              data: row.original.items.filter((item: any) => 
                item.personalizationData && Object.keys(item.personalizationData).length > 0
              )
            })}
          >
            View
          </Button>
        ) : (
          <span className="text-gray-500 text-sm">None</span>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <Button
          variant="outline"
          size="sm"
          className="text-orange-600 hover:text-orange-800 border-orange-200 hover:bg-orange-50 rounded-full font-[Work Sans] font-medium"
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
  })

  return (
    <div className="min-h-screen bg-[#F4F2EF]" style={{ backgroundImage: 'url("https://ik.imagekit.io/w7lwh7wre/wood-texture.jpg?updatedAt=1754240423756")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-[Poppins]">Orders Management</h1>
            <p className="text-lg text-gray-600 mt-2 font-[Work Sans]">Manage and track all your orders</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-700 font-[Work Sans]">{pagination.total} orders</span>
          </div>
        </div>

        <FilterControls
          searchValue={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          filters={{
            status: {
              value: filters.status,
              onChange: (value) => setFilter('status', value),
              options: [
                { value: 'all', label: 'All Status' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Cancelled', label: 'Cancelled' },
              ],
            },
            deliveryStatus: {
              value: filters.deliveryStatus,
              onChange: (value) => setFilter('deliveryStatus', value),
              options: [
                { value: 'all', label: 'All Delivery Status' },
                { value: 'Processing', label: 'Processing' },
                { value: 'Packed', label: 'Packed' },
                { value: 'Shipped', label: 'Shipped' },
                { value: 'Out for Delivery', label: 'Out for Delivery' },
                { value: 'Delivered', label: 'Delivered' },
              ],
            },
          }}
          onClearFilters={clearFilters}
          placeholder="Search orders by ID, buyer name, or email..."
        />

        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50/50">
              {table.getHeaderGroups().map(headerGroup => (
                headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-center font-semibold text-gray-800 font-[Poppins]">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                    <span className="text-gray-600 font-[Work Sans]">Loading orders...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 font-semibold font-[Work Sans]">No orders found</p>
                      <p className="text-sm text-gray-500 font-[Work Sans]">Orders will appear here when customers place them</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-orange-50/30 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="text-center font-[Work Sans]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={setLimit}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
        />
      </div>

      {/* Product Personalization Modal */}
      {personalizationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-orange-100 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-orange-100 bg-orange-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 font-[Poppins]">
                  Product Personalization Details
                </h3>
                <button
                  onClick={() => setPersonalizationModal({ isOpen: false, data: null })}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {personalizationModal.data && personalizationModal.data.length > 0 ? (
                <div className="space-y-4">
                  {personalizationModal.data.map((item: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-2 font-[Work Sans]">
                        Product Item #{index + 1}
                      </h4>
                      
                      {/* Display personalization instructions if available */}
                      {item.personalizationData?.instructions && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Instructions provided to customer:</p>
                          <p className="text-sm text-gray-600 bg-white p-2 rounded border-l-4 border-orange-400">
                            {item.personalizationData.instructions}
                          </p>
                        </div>
                      )}
                      
                      {/* Display customer's personalization text */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Customer's personalization details:</p>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-gray-900 font-[Work Sans]">
                            {item.personalizationData?.text || 'No personalization text provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-[Work Sans]">No personalization data found</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-orange-100 bg-gray-50">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setPersonalizationModal({ isOpen: false, data: null })}
                  className="text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-100 font-[Work Sans]"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersTable
