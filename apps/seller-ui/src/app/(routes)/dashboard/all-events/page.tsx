'use client';
import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "apps/seller-ui/src/shared/components/ui/table"
import { Skeleton } from "apps/seller-ui/src/shared/components/ui/skeleton"
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { Button } from "apps/seller-ui/src/shared/components/ui/button";
import Link from 'next/link';
import Pagination from 'apps/seller-ui/src/shared/components/pagination/Pagination'
import FilterControls from 'apps/seller-ui/src/shared/components/filters/FilterControls'
import { usePaginationAndFilters } from 'apps/seller-ui/src/hooks/usePaginationAndFilters'
import useSeller from 'apps/seller-ui/src/hooks/useSeller'

const fetchEvents = async (queryString: string, shopId: string) => {
  if (!shopId) throw new Error('Shop ID is required');
  
  const res = await axiosInstance.get(`/seller/api/get-seller-events/${shopId}?${queryString}`);
  return {
    events: res.data.products || [],
    pagination: res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
    summary: {
      totalEvents: res.data.pagination?.total || 0,
      activeEvents: res.data.products?.filter((p: any) => new Date(p.starting_date) <= new Date() && new Date(p.ending_date) >= new Date()).length || 0,
      upcomingEvents: res.data.products?.filter((p: any) => new Date(p.starting_date) > new Date()).length || 0
    }
  };
};

const SellerEvents = () => {
  const queryClient = useQueryClient();
  const { seller } = useSeller();
  
  const {
    page,
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
      eventStatus: 'all',
      dateFrom: '',
      dateTo: '',
    },
  })


  const removeEventMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!seller?.shop?.id) throw new Error('Shop not found for seller');
      const res = await axiosInstance.delete(`/seller/api/remove-event/${seller.shop.id}`, {
        data: { productId }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-events'] });
    },
    onError: (error: any) => {
      console.error('Error removing event:', error);
      alert(error.response?.data?.message || 'Failed to remove event');
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['seller-events', queryString, seller?.shop?.id],
    queryFn: () => fetchEvents(queryString, seller?.shop?.id!),
    enabled: !!seller?.shop?.id,
    staleTime: 1000 * 60 * 5,
  });

  const events = data?.events || []
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false }
  const summary = data?.summary || { totalEvents: 0, activeEvents: 0, upcomingEvents: 0 }


  const columns = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Product',
        cell: ({ row }: any) => (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={row.original.images?.[0]?.url || '/placeholder-image.jpg'}
                alt={row.original.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{row.original.title}</p>
              </div>
              <p className="text-sm text-gray-500">SKU: {row.original.sku || 'N/A'}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'sale_price',
        header: 'Price',
        cell: ({ row }: any) => (
          <span className="text-gray-900 font-semibold">
            ${row.original.sale_price || row.original.regular_price}
          </span>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }: any) => (
          <span className={row.original.stock < 10 ? "text-red-500" : "text-gray-900"}>
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: 'starting_date',
        header: 'Start Date',
        cell: ({ row }: any) => {
          const date = new Date(row.original.starting_date).toLocaleDateString();
          return <span className="text-gray-700 text-sm">{date}</span>;
        },
      },
      {
        accessorKey: 'ending_date',
        header: 'End Date',
        cell: ({ row }: any) => {
          const date = new Date(row.original.ending_date).toLocaleDateString();
          return <span className="text-gray-700 text-sm">{date}</span>;
        },
      },
      {
        accessorKey: 'Shop',
        header: 'Shop Name',
        cell: ({ row }: any) => (
          <span className="text-gray-700 text-sm">
            {row.original.Shop?.name || 'N/A'}
          </span>
        ),
      },
      {
        header: 'Actions',
        cell: ({ row }: any) => (
          <div className='flex gap-3 justify-center'>
            <button
              className='text-blue-400 hover:text-blue-300 transition'
              title="View Product"
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`, '_blank')}
            >
              <Eye size={18} />
            </button>
            <button
              className='text-yellow-400 hover:text-yellow-300 transition'
              title="Edit Event"
              onClick={() => console.log('Edit event:', row.original.id)}
            >
              <Edit size={18} />
            </button>
            <button
              className='text-red-400 hover:text-red-300 transition'
              title="Remove from Event"
              onClick={() => {
                if (window.confirm('Are you sure you want to remove this product from events? It will become a regular product again.')) {
                  removeEventMutation.mutate(row.original.id);
                }
              }}
              disabled={removeEventMutation.isPending}
            >
              <Trash2 size={18} />
            </button>
          </div>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Events</h1>
          <p className="text-gray-600 mt-1">Manage your event products and limited offers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">{pagination.total} event products</div>
          <div className="text-sm text-purple-600 font-semibold">
            Active: {summary.activeEvents} | Upcoming: {summary.upcomingEvents}
          </div>
          <Link href="/dashboard/create-event">
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
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
          eventStatus: {
            value: filters.eventStatus,
            onChange: (value) => setFilter('eventStatus', value),
            options: [
              { value: 'all', label: 'All Events' },
              { value: 'active', label: 'Active' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'ended', label: 'Ended' },
              { value: 'cancelled', label: 'Cancelled' },
            ],
          },
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
        placeholder="Search events by title or description..."
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHead key={header.id} className="text-center">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    <span>Loading events...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
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

export default SellerEvents;
