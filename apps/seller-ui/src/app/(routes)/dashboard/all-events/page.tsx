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
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { Plus } from 'lucide-react';
import { Button } from "apps/seller-ui/src/shared/components/ui/button";
import Link from 'next/link';
import Pagination from 'apps/seller-ui/src/shared/components/pagination/Pagination'
import FilterControls from 'apps/seller-ui/src/shared/components/filters/FilterControls'
import { usePaginationAndFilters } from 'apps/seller-ui/src/hooks/usePaginationAndFilters'
import useSeller from 'apps/seller-ui/src/hooks/useSeller'
import EditProductModal from 'apps/seller-ui/src/shared/components/modals/EditProductModal'
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/modals/delete.confirmation.modal'

const fetchEvents = async (queryString: string, shopId: string) => {
  if (!shopId) throw new Error('Shop ID is required');
  
  const res = await axiosInstance.get(`/seller/api/get-seller-events/${shopId}?${queryString}`);
  return {
    events: res.data.products || [],
    pagination: res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
    summary: res.data.summary || {
      totalEvents: 0,
      activeEvents: 0,
      upcomingEvents: 0,
      endedEvents: 0
    }
  };
};

const SellerEvents = () => {
  const queryClient = useQueryClient();
  const { seller } = useSeller();
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  
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
      eventStatus: 'all',
      dateFrom: '',
      dateTo: '',
    },
  })



  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await axiosInstance.delete(`/product/api/delete-product/${productId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-events'] });
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      console.error('Error deleting product:', error);
    },
  });


  const restoreProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await axiosInstance.put(`/product/api/restore-product/${productId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-events'] });
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      console.error('Error restoring product:', error);
    },
  });


  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, formData }: { productId: string; formData: any }) => {
      const res = await axiosInstance.put(`/product/api/update-product/${productId}`, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-events'] });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      console.error('Error updating product:', error);
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


  const handleViewClick = (product: any) => {
    window.open(`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${product.slug}`, '_blank');
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };


  const columns = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }: any) => (
          <div className='flex justify-center'>
            <img
              src={row.original.images?.[0]?.url || '/placeholder-image.jpg'}
              alt={row.original.title}
              className='w-12 h-12 rounded-lg object-cover'
            />
          </div>
        )
      },
      {
        accessorKey: 'title',
        header: 'Product Name',
        cell: ({ row }: any) => {
          const truncatedTitle = row.original.title.length > 25 ? `${row.original.title.substring(0, 25)}...` : row.original.title;
          return (
            <div className='flex flex-col items-center justify-center text-center'>
              <a
                href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className='text-blue-600 hover:underline font-medium'
              >
                {truncatedTitle}
              </a>
              <p className="text-sm text-slate-500 mt-1">SKU: {row.original.sku || 'N/A'}</p>
            </div>
          )
        },
      },
      {
        accessorKey: 'sale_price',
        header: 'Price',
        cell: ({ row }: any) => (
          <span className="block text-center text-slate-700 font-semibold">
            ${row.original.sale_price || row.original.regular_price}
          </span>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }: any) => (
          <span className={row.original.stock < 10 ? "text-red-500 block text-center" : "text-slate-700 block text-center"}>
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: 'starting_date',
        header: 'Start Date',
        cell: ({ row }: any) => {
          const date = new Date(row.original.starting_date).toLocaleDateString();
          return <span className="block text-center text-slate-600 text-sm">{date}</span>;
        },
      },
      {
        accessorKey: 'ending_date',
        header: 'End Date',
        cell: ({ row }: any) => {
          const date = new Date(row.original.ending_date).toLocaleDateString();
          return <span className="block text-center text-slate-600 text-sm">{date}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Event Status',
        cell: ({ row }: any) => {
          const now = new Date();
          const startDate = new Date(row.original.starting_date);
          const endDate = new Date(row.original.ending_date);
          
          let status = 'ended';
          let statusClass = 'bg-gray-100 text-gray-700';
          
          if (startDate > now) {
            status = 'upcoming';
            statusClass = 'bg-blue-100 text-blue-700';
          } else if (startDate <= now && endDate >= now) {
            status = 'active';
            statusClass = 'bg-green-100 text-green-700';
          } else {
            status = 'ended';
            statusClass = 'bg-gray-100 text-gray-700';
          }
          
          return (
            <div className="flex justify-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusClass}`}>
                {status}
              </span>
            </div>
          );
        },
      },
      {
        header: 'Actions',
        cell: ({ row }: any) => (
          <div className='flex items-center space-x-2 justify-center'>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
              onClick={() => handleViewClick(row.original)}
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-600 hover:text-yellow-800 border-yellow-200 hover:bg-yellow-50"
              onClick={() => handleEditClick(row.original)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-800 border-red-200 hover:bg-red-50"
              onClick={() => handleDeleteClick(row.original)}
            >
              Delete
            </Button>
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
    <div className="w-full min-h-screen bg-[#F3F1EE] p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Events</h1>
          <p className="text-slate-600 mt-1">Manage your event products and limited offers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">{pagination.total} event products</div>
          <div className="text-sm text-blue-600 font-semibold">
            Active: {summary.activeEvents} | Upcoming: {summary.upcomingEvents}
          </div>
          <Link href="/dashboard/create-event">
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Create Event
            </button>
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

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHead key={header.id} className="text-center font-semibold text-slate-700">
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
                    <span className="text-slate-600">Loading events...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50 transition-colors">
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

      {/* Edit Product Modal */}
      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSave={(formData) => {
            updateProductMutation.mutate({
              productId: selectedProduct.id,
              formData
            });
          }}
          isSaving={updateProductMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedProduct && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          onConfirm={() => {
            deleteProductMutation.mutate(selectedProduct.id);
          }}
          onRestore={() => {
            restoreProductMutation.mutate(selectedProduct.id);
          }}
        />
      )}
    </div>
  );
};

export default SellerEvents;
