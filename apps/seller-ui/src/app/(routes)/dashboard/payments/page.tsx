'use client';
import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "apps/seller-ui/src/shared/components/ui/table"
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import Pagination from 'apps/seller-ui/src/shared/components/pagination/Pagination'
import FilterControls from 'apps/seller-ui/src/shared/components/filters/FilterControls'
import { usePaginationAndFilters } from 'apps/seller-ui/src/hooks/usePaginationAndFilters'

const fetchPayments = async (queryString: string) => {
  const paymentsQueryString = `${queryString}&status=Paid`;
  
  const res = await axiosInstance.get(`/order/api/get-seller-orders?${paymentsQueryString}`);
  const orders = res.data.orders || [];
  const pagination = res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false };
  
  return {
    payments: orders,
    pagination,
    summary: {
      totalRevenue: orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0),
      totalPayments: orders.length,
    }
  };
};

const SellerPayments = () => {
  const {
    limit,
    search,
    sortBy,
    sortOrder,
    filters,
    setPage,
    setLimit,
    setSearch,
    setSortBy,
    setSortOrder,
    setFilter,
    clearFilters,
    queryString,
  } = usePaginationAndFilters({
    defaultLimit: 10,
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    additionalFilters: {
      dateFrom: '',
      dateTo: '',
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['seller-payments', queryString],
    queryFn: () => fetchPayments(queryString),
    staleTime: 1000 * 60 * 5,
  });

  const payments = data?.payments || []
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false }
  const summary = data?.summary || { totalRevenue: 0, totalPayments: 0 }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }: any) => (
          <span className="text-gray-800 text-sm font-medium">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: 'user.name',
        header: 'Buyer',
        cell: ({ row }: any) => (
          <span className="text-gray-800 font-medium">
            {row.original.user?.name || 'Guest'}
          </span>
        ),
      },
      {
        header: 'Seller Earning',
        cell: ({ row }: any) => {
          const sellerShare = row.original.total * 0.9;
          return (
            <span className="text-orange-600 font-semibold">
              ${sellerShare.toFixed(2)}
            </span>
          );
        },
      },
      {
        header: 'Admin Fee (10%)',
        cell: ({ row }: any) => {
          const adminFee = row.original.total * 0.1;
          return (
            <span className="text-gray-600 font-semibold">
              ${adminFee.toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: any) => (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              row.original.status === 'Paid'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }: any) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return <span className="text-gray-700 text-sm">{date}</span>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-[#F4F2EF] bg-[url('/wood-texture.jpg')] bg-cover bg-center bg-fixed p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-[Poppins]">Payments Management</h1>
          <p className="text-lg text-gray-600 mt-2 font-[Work Sans]">Track your earnings and payment history</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-700 font-[Work Sans]">{pagination.total} payments</span>
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-full border border-orange-200 shadow-sm">
            <span className="text-sm text-orange-700 font-semibold font-[Work Sans]">
              Total Revenue: ${summary.totalRevenue.toFixed(2)}
            </span>
          </div>
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
          dateFrom: {
            value: filters.dateFrom,
            onChange: (value) => setFilter('dateFrom', value),
          },
          dateTo: {
            value: filters.dateTo,
            onChange: (value) => setFilter('dateTo', value),
          },
        }}
        onClearFilters={clearFilters}
        placeholder="Search payments by order ID or buyer name..."
      />

      <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50/50">
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHead key={header.id} className="text-center font-semibold text-gray-800 font-[Poppins]">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                    <span className="text-gray-600 font-[Work Sans]">Loading payments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 font-semibold font-[Work Sans]">No payments found</p>
                      <p className="text-sm text-gray-500 font-[Work Sans]">Your payment history will appear here once you receive orders</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-orange-50/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
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
  );
};

export default SellerPayments;
