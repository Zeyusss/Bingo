'use client';
import React, { useMemo, useState } from 'react';
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
import { Button } from 'apps/seller-ui/src/shared/components/ui/button';
import Pagination from 'apps/seller-ui/src/shared/components/pagination/Pagination'
import FilterControls from 'apps/seller-ui/src/shared/components/filters/FilterControls'
import { usePaginationAndFilters } from 'apps/seller-ui/src/hooks/usePaginationAndFilters'
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/modals/delete.confirmation.modal'
import EditProductModal from 'apps/seller-ui/src/shared/components/modals/EditProductModal'

const fetchProducts = async (queryString: string) => {
  const res = await axiosInstance.get(`/product/api/get-shop-products?${queryString}`);
  return {
    products: res.data.products || [],
    pagination: res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
    summary: res.data.summary || { totalProducts: 0, inStockCount: 0, outOfStockCount: 0 }
  };
};

const fetchCategories = async () => {
  const res = await axiosInstance.get('/product/api/get-seller-categories');
  return res.data.categories || [];
};

const deleteProduct = async (productId: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`);
};

const restoreProduct = async (productId: string) => {
  await axiosInstance.put(`/product/api/restore-product/${productId}`);
};

const updateProduct = async (productId: string, formData: any) => {
  await axiosInstance.put(`/product/api/update-product/${productId}`, formData);
};



const AllProducts = () => {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

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
      status: 'all',
      category: 'all',
      stockStatus: 'all',
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['shop-products', queryString],
    queryFn: () => fetchProducts(queryString),
    staleTime: 1000 * 60 * 5,
  });

  const { data: categories } = useQuery({
    queryKey: ['seller-categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, 
  });


  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      setShowDeleteModal(false);
      setSelectedProduct(null);
    },
  });


  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      setShowDeleteModal(false);
      setSelectedProduct(null);
    },
  });


  const updateMutation = useMutation({
    mutationFn: ({ productId, formData }: { productId: string; formData: any }) => 
      updateProduct(productId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      setShowEditModal(false);
      setSelectedProduct(null);
    },
  });

  const products = data?.products || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false };
  const summary = data?.summary || { totalProducts: 0, inStockCount: 0, outOfStockCount: 0 };


  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };


  const handleModalClose = () => {
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };


  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      await deleteMutation.mutateAsync(selectedProduct.id);
    }
  };


  const handleRestoreConfirm = async () => {
    if (selectedProduct) {
      await restoreMutation.mutateAsync(selectedProduct.id);
    }
  };


  const handleViewClick = (product: any) => {

    window.open(`/product/${product.id}`, '_blank');
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };


  const handleEditSave = async (formData: any) => {
    if (selectedProduct) {
      await updateMutation.mutateAsync({ 
        productId: selectedProduct.id, 
        formData 
      });
    }
  };


  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: "Image",
        cell: ({ row }: any) => {
          return (
            <div className='flex justify-center'>
              <img
                src={row.original.images[0]?.url}
                alt={row.original.images[0]?.url}
                width={200}
                height={200}
                className='w-12 h-12 rounded-md object-cover'
              />
            </div>
          )
        }
      },
      {
        accessorKey: "name",
        header: "Product Name",
        cell: ({ row }: any) => {
          const truncatedTitle = row.original.title.length > 25 ? `${row.original.title.substring(0, 25)}...` : row.original.title;
          return (
            <div className='flex justify-center'>
              <a
                href={`${process.env.NEXT_PUBLIC_USE_UI_LINK}/product/${row.original.slug}`}
                className='text-blue-400 hover:underline'
              >
                {truncatedTitle}
              </a>
            </div>
          )
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }: any) => <span className='block text-center text-slate-700 font-semibold'>${row.original.sale_price}</span>
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span className={row.original.stock < 10 ? "text-red-500 block text-center" : "text-slate-700 block text-center"}>
            {row.original.stock} left
          </span>
        )
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }: any) => <span className='block text-center text-slate-700'>{row.original.category}</span>
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }: any) => (
          <div className='flex items-center justify-center gap-1 text-yellow-400'>
            ⭐ {" "}
            <span className='text-slate-700'>{row.original.ratings || "N/A"}</span>
          </div>
        )
      },
      {
        header: "Actions",
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
  )

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full min-h-screen bg-[#F3F1EE] p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">Manage your products</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">{pagination.total} products</div>
          <div className="text-sm text-blue-600 font-semibold">
            In Stock: {summary.inStockCount} | Out of Stock: {summary.outOfStockCount}
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
          status: {
            value: filters.status,
            onChange: (value) => setFilter('status', value),
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'draft', label: 'Draft' },
            ],
          },
          category: {
            value: filters.category,
            onChange: (value) => setFilter('category', value),
            options: [
              { value: 'all', label: 'All Categories' },
              ...(categories || []).map((category: string) => ({
                value: category,
                label: category,
              })),
            ],
          },
          stockStatus: {
            value: filters.stockStatus,
            onChange: (value) => setFilter('stockStatus', value),
            options: [
              { value: 'all', label: 'All Stock' },
              { value: 'inStock', label: 'In Stock' },
              { value: 'outOfStock', label: 'Out of Stock' },
            ],
          },
        }}
        onClearFilters={clearFilters}
        placeholder="Search products by name, description, or tags..."
      />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                    <span>Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No products found
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={handleModalClose}
          onConfirm={handleDeleteConfirm}
          onRestore={handleRestoreConfirm}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          onSave={handleEditSave}
          isSaving={updateMutation.isPending}
        />
      )}
    </div>
  );
};

export default AllProducts;