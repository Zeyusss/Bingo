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
        <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: 'var(--heading)' }}>
          Create Your Shop
        </h3>

        {/* Shop Name */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold" style={{ color: 'var(--heading)' }}>Shop Name</label>
          <input
            type="text"
            placeholder="Enter your shop name"
            {...register('name', { required: 'Shop name is required' })}
            className="w-full p-3 border border-[var(--input-border)] rounded-lg outline-none focus:border-[var(--primary)] text-[var(--heading)] placeholder-[var(--text)] transition"
          />
          {errors.name && (
            <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{errors.name.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold" style={{ color: 'var(--heading)' }}>Location</label>
          <input
            type="text"
            placeholder="Enter your shop address"
            {...register('address', { required: 'Location is required' })}
            className="w-full p-3 border border-[var(--input-border)] rounded-lg outline-none focus:border-[var(--primary)] text-[var(--heading)] placeholder-[var(--text)] transition"
          />
          {errors.address && (
            <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{errors.address.message}</p>
          )}
        </div>

        {/* Opening Hours */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold" style={{ color: 'var(--heading)' }}>Opening Hours</label>
          <input
            type="text"
            placeholder="e.g., Mon-Fri 9am-5pm"
            {...register('opening_hours', {
              required: 'Opening hours are required',
            })}
            className="w-full p-3 border border-[var(--input-border)] rounded-lg outline-none focus:border-[var(--primary)] text-[var(--heading)] placeholder-[var(--text)] transition"
          />
          {errors.opening_hours && (
            <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{errors.opening_hours.message}</p>
          )}
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold" style={{ color: 'var(--heading)' }}>Bio</label>
          <textarea
            placeholder="Tell us about your shop"
            rows={4}
            {...register('bio', {
              required: 'Bio is required',
              validate: (value) =>
                countWords(value) <= 500 ||
                'Bio must be less than or equal to 500 words',
            })}
            className="w-full p-3 border border-[var(--input-border)] rounded-lg outline-none focus:border-[var(--primary)] text-[var(--heading)] placeholder-[var(--text)] transition"
          />
          {errors.bio && (
            <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{errors.bio.message}</p>
          )}
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold" style={{ color: 'var(--heading)' }}>Category</label>
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
                    borderColor: 'var(--input-border)',
                    borderRadius: 'var(--input-radius)',
                    padding: 'var(--input-padding)',
                    color: 'var(--heading)',
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: 'var(--text)',
                  }),
                }}
              />
            )}
          />
          {errors.category && (
            <p className="text-sm mt-1" style={{ color: 'var(--error)' }}>{errors.category.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center mt-6">
          <button
            type="submit"
            className={`w-full bg-[var(--primary)] text-white py-3 px-6 rounded-lg font-semibold transition
              ${shopCreateMutation.isPending ? "bg-[var(--disabled)] cursor-not-allowed" : "hover:bg-[#8c0e2d]"}
            `}
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
