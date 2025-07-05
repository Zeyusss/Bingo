import { useMutation } from '@tanstack/react-query';
import { shopCategories } from 'apps/seller-ui/src/utils/categories';
import axios from 'axios';
import React from 'react';
import { useForm } from 'react-hook-form';
import Select from 'react-select';
import { Controller } from 'react-hook-form';

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
  });

  const onSubmit = async (data: any) => {
    const shopData = { ...data, sellerId };
    shopCreateMutation.mutate(shopData);
  };

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold mb-4 text-center">
          Create Your Shop
        </h3>

        {/* Shop Name */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Shop Name</label>
          <input
            type="text"
            placeholder="Enter your shop name"
            {...register('name', { required: 'Shop name is required' })}
            className="w-full p-2 border border-gray-300 rounded outline-none"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Location</label>
          <input
            type="text"
            placeholder="Enter your shop address"
            {...register('address', { required: 'Location is required' })}
            className="w-full p-2 border border-gray-300 rounded outline-none"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Opening Hours */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Opening Hours</label>
          <input
            type="text"
            placeholder="e.g., Mon-Fri 9am-5pm"
            {...register('opening_hours', {
              required: 'Opening hours are required',
            })}
            className="w-full p-2 border border-gray-300 rounded outline-none"
          />
          {errors.opening_hours && (
            <p className="text-red-500 text-sm mt-1">{errors.opening_hours.message}</p>
          )}
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Bio</label>
          <textarea
            placeholder="Tell us about your shop"
            rows={4}
            {...register('bio', {
              required: 'Bio is required',
              validate: (value) =>
                countWords(value) <= 500 ||
                'Bio must be less than or equal to 500 words',
            })}
            className="w-full p-2 border border-gray-300 rounded outline-none"
          />
          {errors.bio && (
            <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Category</label>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
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
                  control: (base) => ({
                    ...base,
                    borderColor: '#d1d5db',
                    borderRadius: '4px',
                    padding: '8px',
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: '#6b7280',
                  }),
                }}
              />
            )}
          />
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-6 rounded font-semibold hover:bg-blue-600"
            disabled={shopCreateMutation.isPending}
          >
            {shopCreateMutation.isPending ? 'Creating...' : 'Create Shop'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateShop;
