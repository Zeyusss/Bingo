import { useMutation } from '@tanstack/react-query';
import { shopCategories } from 'apps/seller-ui/src/utils/categories';
import axios, { AxiosError } from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { Controller } from 'react-hook-form';
import { Store, MapPin, Clock, FileText, Tag } from 'lucide-react';

type FormData = {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  country: string;
  bio: string;
  sellerId: string;
  address: string;
  opening_hours: string;
  category: string[];
};

const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/create-shop`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
    onError: (error: AxiosError) => {
      console.error('Shop creation error:', error);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Setup Your Shop
        </h3>
        <p className="text-gray-600">
          Tell us about your business to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Shop Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Store size={16} className="text-orange-600" />
            Shop Name
          </label>
          <input
            type="text"
            placeholder="Enter your shop name"
            {...register('name', { required: 'Shop name is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span className="w-4 h-4 text-red-500">⚠</span>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin size={16} className="text-orange-600" />
            Shop Address
          </label>
          <input
            type="text"
            placeholder="Enter your shop address"
            {...register('address', { required: 'Location is required' })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span className="w-4 h-4 text-red-500">⚠</span>
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Opening Hours */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Clock size={16} className="text-orange-600" />
            Opening Hours
          </label>
          <input
            type="text"
            placeholder="e.g., Mon-Fri 9am-5pm"
            {...register('opening_hours', {
              required: 'Opening hours are required',
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none"
          />
          {errors.opening_hours && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span className="w-4 h-4 text-red-500">⚠</span>
              {errors.opening_hours.message}
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText size={16} className="text-orange-600" />
            Shop Description
          </label>
          <textarea
            placeholder="Tell us about your shop and what you sell"
            rows={4}
            {...register('bio', {
              required: 'Shop description is required',
              validate: (value) =>
                countWords(value) <= 500 ||
                'Description must be less than or equal to 500 words',
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none resize-none"
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span className="w-4 h-4 text-red-500">⚠</span>
              {errors.bio.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Tag size={16} className="text-orange-600" />
            Shop Categories
          </label>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'At least one category is required' }}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                options={shopCategories}
                classNamePrefix="react-select"
                placeholder="Select one or more categories"
                onChange={(selected) => field.onChange(selected.map((opt:any) => opt.value))}
                value={shopCategories.filter(opt => field.value?.includes(opt.value))}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? '#f97316' : '#d1d5db',
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(249, 115, 22, 0.2)' : 'none',
                    '&:hover': {
                      borderColor: '#f97316',
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: '#6b7280',
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#fed7aa',
                    borderRadius: '6px',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: '#ea580c',
                    fontWeight: '500',
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: '#ea580c',
                    '&:hover': {
                      backgroundColor: '#fb923c',
                      color: 'white',
                    },
                  }),
                }}
              />
            )}
          />
          {errors.category && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span className="w-4 h-4 text-red-500">⚠</span>
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
          disabled={shopCreateMutation.isPending}
        >
          {shopCreateMutation.isPending ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating Shop...
            </>
          ) : (
            "Create Shop"
          )}
        </button>

        {shopCreateMutation.isError && shopCreateMutation.error instanceof AxiosError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm flex items-center gap-2">
              <span className="w-5 h-5 text-red-500">⚠</span>
              {String((shopCreateMutation.error.response?.data as { message?: string })?.message || shopCreateMutation.error.message)}
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateShop;
