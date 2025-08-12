'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import { Button } from "apps/seller-ui/src/shared/components/ui/button";
import { Input } from "apps/seller-ui/src/shared/components/ui/input";
import { Calendar, Package, Clock, Percent, Search, ChevronLeft, ChevronRight } from 'lucide-react';


interface CreateEventForm {
  productId: string;
  starting_date: string;
  ending_date: string;
  discount_percentage?: number;
}


interface Product {
  id: string;
  title: string;
  regular_price: number;
  sale_price?: number;
  stock: number;
  images: { url: string }[];
  starting_date?: string;
}

const CreateEventPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { seller, isLoading: isSellerLoading } = useSeller();
  

  const [formData, setFormData] = useState<CreateEventForm>({
    productId: '',
    starting_date: '',
    ending_date: '',
    discount_percentage: undefined,
  });
  

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;


  if (!isSellerLoading && !seller) {
    router.push('/login');
    return null;
  }

  const { data: allProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['seller-products-for-events', seller?.shop?.id],
    queryFn: async () => {
      if (!seller?.shop?.id) throw new Error('Shop not found for seller');
      const res = await axiosInstance.get(`/product/api/get-shop-products?sellerId=${seller.id}`);
      
      return res.data.products?.filter((product: Product) => 
        !product.starting_date && product.stock < 100
      ) || [];
    },
    enabled: !!seller?.shop?.id,
    staleTime: 1000 * 60 * 5,
  });


  const filteredProducts = allProducts.filter((product: Product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);


  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateEventForm) => {
      if (!seller?.shop?.id) throw new Error('Shop not found for seller');
      const res = await axiosInstance.post(`/seller/api/create-event/${seller.shop.id}`, eventData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-events'] });
      queryClient.invalidateQueries({ queryKey: ['seller-products-for-events'] });
      
      router.push('/dashboard/all-events');
    },
    onError: (error: any) => {
      console.error('Error creating event:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to create event' });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }

    if (!formData.starting_date) {
      newErrors.starting_date = 'Start date is required';
    }

    if (!formData.ending_date) {
      newErrors.ending_date = 'End date is required';
    }


    if (formData.starting_date && formData.ending_date) {
      const startDate = new Date(formData.starting_date);
      const endDate = new Date(formData.ending_date);
      const now = new Date();

      if (startDate < now) {
        newErrors.starting_date = 'Start date cannot be in the past';
      }

      if (endDate <= startDate) {
        newErrors.ending_date = 'End date must be after start date';
      }
    }


    if (formData.discount_percentage !== undefined && formData.discount_percentage !== null) {
      if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
        newErrors.discount_percentage = 'Discount must be between 0 and 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createEventMutation.mutateAsync(formData);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleInputChange = (field: keyof CreateEventForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };


  const selectedProduct = allProducts.find((p: Product) => p.id === formData.productId);

  return (
    <div className="w-full min-h-screen bg-[#F3F1EE] p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Create Event</h1>
          <p className="text-slate-600">Turn your products into limited-time offers and events</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Select Product</h2>
          <p className="text-slate-600 text-sm mb-4">Choose a product with limited stock to create an event</p>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {isLoadingProducts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Loading products...</p>
            </div>
          ) : allProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600 font-medium">No products with limited stock found</p>
              <p className="text-slate-500 text-sm mt-1">Products with less than 100 items in stock will appear here</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600 font-medium">No products found</p>
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProducts.map((product: Product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.productId === product.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setFormData({ ...formData, productId: product.id })}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-slate-500 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-800 truncate">{product.title}</h3>
                      <p className="text-sm text-slate-600">${product.regular_price}</p>
                      <p className="text-xs text-slate-500">Stock: {product.stock}</p>
                    </div>
                  </div>
                </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-slate-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-600 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Event Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.starting_date}
                onChange={(e) => setFormData({ ...formData, starting_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
              {errors.starting_date && (
                <p className="text-red-500 text-sm mt-1">{errors.starting_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Event End Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.ending_date}
                onChange={(e) => setFormData({ ...formData, ending_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
              {errors.ending_date && (
                <p className="text-red-500 text-sm mt-1">{errors.ending_date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Optional Discount */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Event Discount (Optional)</h2>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Discount Percentage
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 20 for 20% off"
              value={formData.discount_percentage || ''}
              onChange={(e) => handleInputChange('discount_percentage', e.target.value ? parseFloat(e.target.value) : '')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.discount_percentage ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.discount_percentage && (
              <p className="text-red-500 text-sm mt-1">{errors.discount_percentage}</p>
            )}
            <p className="text-slate-600 text-sm mt-1">
              Leave empty if no additional discount is needed
            </p>

            {/* Discount Preview */}
            {selectedProduct && formData.discount_percentage && formData.discount_percentage > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">💰 Discount Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Regular Price:</span>
                    <span className="line-through text-slate-500">
                      ${selectedProduct.regular_price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Discount ({formData.discount_percentage}%):</span>
                    <span className="text-red-600">
                      -${((selectedProduct.regular_price * formData.discount_percentage) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-700 border-t border-green-300 pt-1">
                    <span>Event Price:</span>
                    <span>
                      ${(
                        selectedProduct.regular_price - 
                        ((selectedProduct.regular_price * formData.discount_percentage) / 100)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingProducts}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/dashboard/events')}
              disabled={isSubmitting}
              className="border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-slate-700 px-6 py-2 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
