"use client";
import React, { useMemo, useState } from "react";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "../../shared/components/ui/input";
import { Button } from "../../shared/components/ui/button";
import EditProductModal from "../../shared/components/modals/EditProductModal";
import ViewProductModal from "../../shared/components/modals/ViewProductModal";
import DeleteConfirmationModal from "../../shared/components/modals/delete.confirmation.modal";
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

type ProductApiResponse = {
  data: any[];
  currentPage: number;
  totalPages: number;
};

const deleteProduct = async (productId: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${productId}`);
};

const restoreProduct = async (productId: string) => {
  await axiosInstance.put(`/product/api/restore-product/${productId}`);
};

const ProductsPage = () => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Help content for products management
  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content: "The Products Management page provides comprehensive oversight of all products listed on your platform. Monitor product catalog, manage inventory, and oversee seller product listings with powerful search and filtering tools.",
      subsections: [
        {
          title: "Product Catalog",
          content: "View all products across all sellers with detailed information and status"
        },
        {
          title: "Inventory Management",
          content: "Monitor stock levels, pricing, and product availability"
        },
        {
          title: "Quality Control",
          content: "Review product listings, manage approvals, and ensure platform standards"
        }
      ]
    },
    {
      title: "Search & Filtering",
      content: "Efficiently find and organize products:",
      subsections: [
        {
          title: "Search Function",
          content: "Search products by name, category, or seller information"
        },
        {
          title: "Category Filtering",
          content: "Filter by product categories to focus on specific product types"
        },
        {
          title: "Advanced Filters",
          content: "Sort by price, availability, seller, and other product attributes"
        }
      ]
    },
    {
      title: "Product Actions",
      content: "Available product management operations:",
      subsections: [
        {
          title: "View Details",
          content: "Access complete product information including images, descriptions, and specifications"
        },
        {
          title: "Edit Products",
          content: "Modify product details, pricing, and availability status"
        },
        {
          title: "Delete/Restore",
          content: "Remove products from listings or restore previously deleted items"
        },
        {
          title: "Status Management",
          content: "Approve, reject, or flag products for review"
        }
      ]
    },
    {
      title: "Product Information",
      content: "Key product details displayed:",
      subsections: [
        {
          title: "Basic Details",
          content: "Product name, category, price, and seller information"
        },
        {
          title: "Inventory Status",
          content: "Stock levels, availability, and inventory tracking"
        },
        {
          title: "Performance Metrics",
          content: "Sales data, views, and customer ratings"
        }
      ]
    },
    {
      title: "Best Practices",
      content: "Effective product management:",
      subsections: [
        {
          title: "Quality Standards",
          content: "Maintain consistent product quality and accurate descriptions"
        },
        {
          title: "Category Organization",
          content: "Ensure products are properly categorized for better discoverability"
        },
        {
          title: "Regular Reviews",
          content: "Periodically review product listings for accuracy and compliance"
        }
      ]
    }
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const [editFormData, setEditFormData] = useState({
    title: '',
    detailed_description: '',
    regular_price: '',
    sale_price: '',
    category: '',
    subCategory: '',
    stock: '',
    tags: ''
  });
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const limit = 10;
  const queryClient = useQueryClient();
  const {
    data: products = { data: [], currentPage: 1, totalPages: 1 },
    isLoading,
  } = useQuery<ProductApiResponse>({
    queryKey: ["all-products", page, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-products?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
  const categories = useMemo(() => {
    if (!products.data) return [] as string[];
    const unique = new Set((products.data as any[]).map((p) => p.category));
    return Array.from(unique) as string[];
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

  const openEditModal = (product: any) => {
    const mappedData = {
      title: product.title || '',
      detailed_description: product.detailed_description || product.short_description || '',
      regular_price: product.regular_price ? product.regular_price.toString() : '',
      sale_price: product.sale_price ? product.sale_price.toString() : '',
      category: product.category || '',
      subCategory: product.subCategory || product.subcategory || '', // Handle case variations
      stock: product.stock ? product.stock.toString() : '0',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : (typeof product.tags === 'string' ? product.tags : '')
    };
    
    setSelectedProduct(product);
    setEditFormData(mappedData);
    setShowEditModal(true);
  };

  const openViewModal = (product: any) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const updateProductMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Updating product with data:', data); // Debug log
      const response = await axiosInstance.put(`http://localhost:6002/api/update-product/${selectedProduct?.id}`, {
        ...data,
        tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Product updated successfully:', data); // Debug log
      queryClient.invalidateQueries({ queryKey: ['all-products'] });
      setShowEditModal(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error('Failed to update product:', error); // Debug log
    },
  });

  const handleSaveProduct = () => {
    updateProductMutation.mutate(editFormData);
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
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {filteredProducts.length} products
          </div>
          <HelpButton
            onClick={() => setShowHelpModal(true)}
            text="Products Help"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
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
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {categories.map((cat: string) => (
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
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 border-blue-200 hover:bg-blue-50"
                        onClick={() => openViewModal(product)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-800 border-yellow-200 hover:bg-yellow-50"
                        onClick={() => openEditModal(product)}
                      >
                        Edit
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
        {showDeleteModal && selectedProduct && (
          <DeleteConfirmationModal
            product={selectedProduct}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
            onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
          />
        )}

        <EditProductModal
          product={selectedProduct}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          onSave={handleSaveProduct}
          isSaving={updateProductMutation.isPending}
        />

        <ViewProductModal
          product={selectedProduct}
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
        />
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
          Page {products.currentPage || 1} of {products.totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPage((p) => Math.min(products.totalPages || 1, p + 1))
          }
          disabled={page >= (products.totalPages || 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </Button>
      </div>
      
      {/* Products Management Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Products Management Guide"
        description="Learn how to effectively manage your product catalog, monitor inventory, and oversee seller product listings with comprehensive tools and best practices."
        sections={helpSections}
      />
    </div>
  );
};

export default ProductsPage;
