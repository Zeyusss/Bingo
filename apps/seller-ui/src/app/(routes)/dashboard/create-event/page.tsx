'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import { Button } from "apps/seller-ui/src/shared/components/ui/button";
import { Input } from "apps/seller-ui/src/shared/components/ui/input";
import { Calendar, Package, Clock, Percent } from 'lucide-react';


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


  if (!isSellerLoading && !seller) {
    router.push('/login');
    return null;
  }

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
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


  const selectedProduct = products.find((p: Product) => p.id === formData.productId);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h1>
        <p className="text-gray-600">Turn your products into limited-time offers and events</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Selection Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Select Limited Product</h2>
          </div>
          
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-orange-800 text-sm">
              <strong>Limited Offers Only:</strong> Only products with less than 100 items in stock can be turned into events to create urgency and exclusivity.
            </p>
          </div>
          
          {isLoadingProducts ? (
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No Limited Products Available</p>
              <p className="text-sm">You need products with less than 100 items in stock to create events.</p>
            </div>
          ) : (
            <>
              <select
                value={formData.productId}
                onChange={(e) => handleInputChange('productId', e.target.value)}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.productId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a limited product to create an event</option>
                {products.map((product: Product) => (
                  <option key={product.id} value={product.id}>
                  {product.title} - ${product.sale_price || product.regular_price} ({product.stock} left)
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
              )}

              {/* Selected Product Preview */}
              {selectedProduct && (
                <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-md border border-orange-200">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">LIMITED</span>
                    Selected Product Preview:
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={selectedProduct.images?.[0]?.url || '/placeholder-image.jpg'}
                        alt={selectedProduct.title}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{selectedProduct.title}</p>
                      {formData.discount_percentage && formData.discount_percentage > 0 ? (
                        <div className="space-y-1">
                          <p className="text-gray-500 text-sm line-through">
                            Regular: ${selectedProduct.regular_price}
                          </p>
                          <p className="text-green-600 font-semibold">
                            Event Price: ${(
                              selectedProduct.regular_price - 
                              ((selectedProduct.regular_price * formData.discount_percentage) / 100)
                            ).toFixed(2)} ({formData.discount_percentage}% off)
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600">Price: ${selectedProduct.sale_price || selectedProduct.regular_price}</p>
                      )}
                      <p className="text-red-600 font-semibold">Only {selectedProduct.stock} left in stock!</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Event Dates Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Event Duration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.starting_date}
                onChange={(e) => handleInputChange('starting_date', e.target.value)}
                className={errors.starting_date ? 'border-red-500' : ''}
              />
              {errors.starting_date && (
                <p className="text-red-500 text-sm mt-1">{errors.starting_date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.ending_date}
                onChange={(e) => handleInputChange('ending_date', e.target.value)}
                className={errors.ending_date ? 'border-red-500' : ''}
              />
              {errors.ending_date && (
                <p className="text-red-500 text-sm mt-1">{errors.ending_date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Optional Discount Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Event Discount (Optional)</h2>
          </div>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 20 for 20% off"
              value={formData.discount_percentage || ''}
              onChange={(e) => handleInputChange('discount_percentage', e.target.value ? parseFloat(e.target.value) : '')}
              className={errors.discount_percentage ? 'border-red-500' : ''}
            />
            {errors.discount_percentage && (
              <p className="text-red-500 text-sm mt-1">{errors.discount_percentage}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Leave empty if no additional discount is needed
            </p>

            {/* Discount Preview */}
            {selectedProduct && formData.discount_percentage && formData.discount_percentage > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">💰 Discount Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular Price:</span>
                    <span className="line-through text-gray-500">
                      ${selectedProduct.regular_price}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount ({formData.discount_percentage}%):</span>
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
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingProducts}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/events')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage;
