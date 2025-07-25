"use client";
import React, { useMemo, useState } from "react";

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Search,
  Pencil,
  Trash,
  Eye,
  BarChart,
  Star,
  ChevronRight,
} from "lucide-react";

import Link from "next/link";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import Image from "next/image";
import DeleteConfirmationModal from "../../shared/components/modals/delete.confirmation.modal";
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

const deleteProduct = async (productId: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`);
};

const restoreProduct = async (productId: string) => {
  await axiosInstance.put(`/product/api/restore-product/${productId}`);
};

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const limit = 10;
  const queryClient = useQueryClient();
  const { data: products = {}, isLoading } = useQuery({
    queryKey: ["all-products", page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-products?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
  const categories = useMemo(() => {
    if (!products.data) return [];
    const unique = new Set(products.data.map((p: any) => p.category));
    return Array.from(unique);
  }, [products.data]);
  const filteredProducts = (products.data || []).filter(
    (product: any) =>
      (categoryFilter === "all" || product.category === categoryFilter) &&
      (product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });
  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
    },
  });
  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all products</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredProducts.length} products
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="category-filter" className="text-sm">
            Category:
          </label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {/* Dynamically render categories if available */}
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Image</TableHead>
              <TableHead className="text-center">Product Name</TableHead>
              <TableHead className="text-center">Price</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">Rating</TableHead>
              <TableHead className="text-center">Shop</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <img
                        src={product.images[0]?.url}
                        alt={product.images[0]?.url}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <a
                        href={`${process.env.NEXT_PUBLIC_USE_UI_LINK}/product/${product.slug}`}
                        className="text-blue-600 hover:underline"
                      >
                        {product.title.length > 25
                          ? `${product.title.substring(0, 25)}...`
                          : product.title}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="block text-center">
                      ${product.sale_price}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        product.stock < 10
                          ? "text-red-500 block text-center"
                          : "text-gray-900 block text-center"
                      }
                    >
                      {product.stock} left
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="block text-center">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400">
                      <svg
                        width="18"
                        height="18"
                        fill="#fde04"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 .587l3.668 7.568L24 9.423l-6 5.849L19.335 24 12 19.771 4.665 24 6 15.272 0 9.423l8.332-1.268z" />
                      </svg>
                      <span className="text-gray-900">
                        {product.ratings || 5}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-900 text-sm truncate">
                      {product.Shop?.name ?? "Unknown Shop"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-3 justify-center">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
                      >
                        <a href={`/product/${product.id}`}>View</a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-800 border-yellow-200 hover:bg-yellow-50"
                      >
                        <a href={`/product/edit/${product.id}`}>Edit</a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800 border-red-200 hover:bg-red-50"
                        onClick={() => openDeleteModal(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {showDeleteModal && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Product"
            size="sm"
          >
            <div className="space-y-4">
              <p>Are you sure you want to delete this product?</p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(selectedProduct?.id)}
                >
                  Delete
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => restoreMutation.mutate(selectedProduct?.id)}
                >
                  Restore
                </Button>
              </div>
            </div>
          </Modal>
        )}
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
          Page {products.currentPage || page} of {products.totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => (products.totalPages ? Math.min(products.totalPages, p + 1) : p + 1))}
          disabled={products.totalPages ? page >= products.totalPages : true}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ProductsPage;
