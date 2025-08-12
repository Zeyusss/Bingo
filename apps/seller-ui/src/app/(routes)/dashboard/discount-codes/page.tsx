'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteDiscountCodeModal from 'apps/seller-ui/src/shared/components/modals/delete.discount-codes';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import { Plus, Trash, Copy, Tag, Percent, DollarSign } from 'lucide-react';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from "react-hot-toast";
import { Input } from "apps/seller-ui/src/shared/components/ui/input";
import { Button } from "apps/seller-ui/src/shared/components/ui/button";
import { Skeleton } from "apps/seller-ui/src/shared/components/ui/skeleton";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    }
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    }
  });

  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post("/product/api/create-discount-code", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      reset();
      setShowModal(false);
    }
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId) => {
      await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      setShowDeleteModal(false);
    }
  });

  const handleDeleteClick = (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  }

  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create up to 8 discount codes.");
      return;
    }
    createDiscountCodeMutation.mutate(data);
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard!');
  };

  const getDiscountStats = () => {
    const totalCodes = discountCodes.length;
    const percentageCodes = discountCodes.filter((code: any) => code.discountType === 'percentage').length;
    const flatCodes = discountCodes.filter((code: any) => code.discountType === 'flat').length;
    return { totalCodes, percentageCodes, flatCodes };
  };

  const { totalCodes, percentageCodes, flatCodes } = getDiscountStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Tag className="w-8 h-8 text-blue-600" />
                Discount Codes
              </h1>
              <p className="text-gray-600">Create and manage promotional discount codes for your shop</p>
            </div>
            <Button 
              onClick={() => setShowModal(true)} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              disabled={totalCodes >= 8}
            >
              <Plus className="w-5 h-5 mr-2" /> 
              Create New Discount
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Codes</p>
                <p className="text-2xl font-bold text-gray-900">{totalCodes}</p>
                <p className="text-xs text-gray-500 mt-1">of 8 maximum</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Percentage Codes</p>
                <p className="text-2xl font-bold text-gray-900">{percentageCodes}</p>
                <p className="text-xs text-gray-500 mt-1">% based discounts</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Percent className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flat Codes</p>
                <p className="text-2xl font-bold text-gray-900">{flatCodes}</p>
                <p className="text-xs text-gray-500 mt-1">$ fixed discounts</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Discount Codes Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Discount Codes</h2>
            <p className="text-sm text-gray-600 mt-1">{totalCodes} active codes</p>
          </div>
          
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="w-20 h-8" />
                </div>
              ))}
            </div>
          ) : discountCodes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No discount codes yet</h3>
              <p className="text-gray-600 mb-6">Create your first discount code to start offering promotions to your customers.</p>
              <Button 
                onClick={() => setShowModal(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Create Your First Discount
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {discountCodes.map((discount: any) => (
                <div key={discount.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        discount.discountType === 'percentage' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-purple-100 text-purple-600'
                      }`}>
                        {discount.discountType === 'percentage' ? (
                          <Percent className="w-6 h-6" />
                        ) : (
                          <DollarSign className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{discount.public_name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            discount.discountType === 'percentage'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {discount.discountType === 'percentage'
                              ? `${discount.discountValue}% OFF`
                              : `$${discount.discountValue} OFF`}
                          </span>
                          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                            <code className="text-sm font-mono text-gray-900">{discount.discountCode}</code>
                            <button
                              onClick={() => copyToClipboard(discount.discountCode)}
                              className="text-gray-500 hover:text-gray-700 transition-colors"
                              title="Copy code"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteClick(discount)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Create Discount Code</h3>
                    <p className="text-sm text-gray-600">Add a new promotional code for your shop</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Discount Title
                  </label>
                  <Input 
                    {...register("public_name", { required: "Title is required" })} 
                    placeholder="e.g. Summer Sale, Black Friday Deal" 
                    className="h-11"
                  />
                  {errors.public_name && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.public_name.message}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Discount Type</label>
                    <Controller
                      control={control}
                      name="discountType"
                      render={({ field }) => (
                        <select 
                          {...field} 
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Fixed Amount ($)</option>
                        </select>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Discount Value</label>
                    <Input
                      type="number"
                      min={1}
                      {...register("discountValue", { 
                        required: "Value is required",
                        min: { value: 1, message: "Value must be at least 1" }
                      })}
                      placeholder="10"
                      className="h-11"
                    />
                    {errors.discountValue && (
                      <p className="text-red-500 text-sm flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.discountValue.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">Discount Code</label>
                  <Input
                    {...register("discountCode", { 
                      required: "Code is required",
                      pattern: {
                        value: /^[A-Z0-9]+$/,
                        message: "Code must contain only uppercase letters and numbers"
                      },
                      minLength: {
                        value: 3,
                        message: "Code must be at least 3 characters"
                      }
                    })}
                    placeholder="e.g. SUMMER20, SAVE15"
                    className="h-11 font-mono"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.discountCode && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.discountCode.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Use uppercase letters and numbers only</p>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 h-11"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg" 
                    disabled={createDiscountCodeMutation.isPending}
                  >
                    {createDiscountCodeMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Discount
                      </>
                    )}
                  </Button>
                </div>
                
                {createDiscountCodeMutation.isError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm font-medium">
                      {(createDiscountCodeMutation.error as AxiosError<{ message: string }>)?.response?.data?.message || "Failed to create discount code"}
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedDiscount && (
          <DeleteDiscountCodeModal
            discount={selectedDiscount}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteDiscountCodeMutation.mutate(selectedDiscount.id)}
          />
        )}
      </div>
    </div>
  );
}

export default Page;
