'use client';

import React, { useMemo, useState } from 'react';
import { ChevronRight, Wand, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder';
import Input from 'packages/components/inputs';
import ColorSelector from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custom-specifications';
import CustomProperties from 'packages/components/custom-properties';
import SizeSelector from 'packages/components/size-selector';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('packages/components/rich-text-editor'), { ssr: false });
import Link from 'next/link';
import Image from 'next/image';
import { enhancements } from 'apps/seller-ui/src/utils/AI.Enhancements';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const Page = () => {
  const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [pictureUploadingLoader, setPictureUploadingLoader] = useState(false);
  const [images, setImages] = useState<(UploadedImage | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/product/api/get-categories");
        return res.data;
      } catch (error) {
        console.log(error);
        return { categories: [], subCategories: {} };
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const { data: discountCodes = [], isLoading: discountLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes");
      return res?.data?.discount_codes || [];
    }
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};
  const selectedCategory = watch("category");
  const regularPrice = watch("regular_price");

  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/product/api/create-product", data);
      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadingLoader(true);
    try {
      const fileName = await convertFileToBase64(file);
      const response = await axiosInstance.post("/product/api/upload-product-image", { fileName });
      const uploadedImage: UploadedImage = {
        fileId: response.data.fileId,
        file_url: response.data.file_url,
      };
      const updatedImages = [...images];
      updatedImages[index] = uploadedImage;
      if (index === images.length - 1 && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    } finally {
      setPictureUploadingLoader(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];
      if (imageToDelete && typeof imageToDelete === "object") {
        await axiosInstance.delete("/product/api/delete-product-image", {
          data: { fileId: imageToDelete.fileId! }
        });
      }
      updatedImages.splice(index, 1);
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  const applyTransformation = async (transformation: string) => {
    if (!selectedImage || processing) return;
    setProcessing(true);
    setActiveEffect(transformation);
    try {
      let [baseUrl, queryString] = selectedImage.split('?');
      let params = new URLSearchParams(queryString || '');
      params.delete('tr');
      const newQuery = params.toString();
      const transformedUrl = newQuery
        ? `${baseUrl}?${newQuery}&tr=${transformation}`
        : `${baseUrl}?tr=${transformation}`;
      setSelectedImage(transformedUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved (mocked)");
  };

  return (
    <div className="px-6 md:px-12 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">Create Product</h1>
      <div className="h-1 w-16 bg-blue-600 mb-4 rounded"></div>

      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="text-blue-500 hover:underline">Dashboard</Link>
        <ChevronRight className="mx-1" size={18} />
        <span>Create Product</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column - Images */}
        <div className="md:col-span-4">
          {images?.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 * 850"
              pictureUploadingLoader={pictureUploadingLoader}
              small={false}
              index={0}
              images={images}
              setSelectedImage={setSelectedImage}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                key={index}
                setOpenImageModal={setOpenImageModal}
                size="765 * 850"
                small
                index={index + 1}
                pictureUploadingLoader={pictureUploadingLoader}
                images={images}
                setSelectedImage={setSelectedImage}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>
        {/* Right Column - Product Form */}
        <div className="md:col-span-8 space-y-6">

          {/* Product Title */}
          <Input
            label="Product Title *"
            placeholder="Enter product title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title.message as string}</p>
          )}

          {/* Short Description */}
          <Input
            type="textarea"
            rows={4}
            label="Short Description * (Max 150 words)"
            placeholder="Enter a short product description"
            {...register("short_description", {
              required: "Short description is required",
              validate: (value) => {
                const wordCount = value.trim().split(/\s+/).length;
                return wordCount <= 150 || `Max 150 words allowed (Current: ${wordCount})`;
              },
            })}
          />
          {errors.short_description && (
            <p className="text-red-500 text-sm">{errors.short_description.message as string}</p>
          )}

          {/* Tags */}
          <Input
            label="Tags *"
            placeholder="e.g. Modern, Organic"
            {...register("tags", { required: "Tags are required" })}
          />
          {errors.tags && <p className="text-red-500 text-sm">{errors.tags.message as string}</p>}

          {/* Brand */}
          <Input label="Brand" placeholder="e.g. HumbleHands, Bright" {...register("brand")} />

          {/* Warranty */}
          <Input
            label="Warranty *"
            placeholder="1 Year / No Warranty"
            {...register("warranty", { required: "Warranty is required!" })}
          />
          {errors.warranty && <p className="text-red-500 text-sm">{errors.warranty.message as string}</p>}

          {/* Slug */}
          <Input
            label="Slug *"
            placeholder="product-title-slug"
            {...register("slug", {
              required: "Slug is required",
              pattern: {
                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: "Only lowercase letters, numbers, hyphens allowed"
              },
              minLength: { value: 3, message: "Min 3 characters" },
              maxLength: { value: 50, message: "Max 50 characters" },
            })}
          />
          {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message as string}</p>}

          {/* Category */}
          <div>
            <label className="block font-medium mb-1">Category *</label>
            {isLoading ? (
              <p className="text-gray-500">Loading categories...</p>
            ) : isError ? (
              <p className="text-red-500">Failed to load categories</p>
            ) : (
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}
              />
            )}
            {errors.category && <p className="text-red-500 text-sm">{errors.category.message as string}</p>}
          </div>

          {/* Subcategory */}
          <div>
            <label className="block font-medium mb-1">Subcategory *</label>
            <Controller
              name="subCategory"
              control={control}
              rules={{ required: "Subcategory is required" }}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((subcat: string) => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              )}
            />
            {errors.subCategory && (
              <p className="text-red-500 text-sm">{errors.subCategory.message as string}</p>
            )}
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block font-medium mb-1">Detailed Description *</label>
            <Controller
              name="detailed_description"
              control={control}
              rules={{
                required: "Detailed description is required",
                validate: (value) => {
                  const wordCount = value?.split(/\s+/).filter((w: string) => w).length;
                  return wordCount >= 100 || "Must be at least 100 words";
                },
              }}
              render={({ field }) => (
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <RichTextEditor value={field.value} onChange={field.onChange} />
                </div>
              )}
            />
            {errors.detailed_description && (
              <p className="text-red-500 text-sm">{errors.detailed_description.message as string}</p>
            )}
          </div>

          {/* Video URL */}
          <Input
            label="Video URL (optional)"
            placeholder="https://www.youtube.com/embed/xyz123"
            {...register("video_url", {
              pattern: {
                value: /^https:\/\/(www\.)?youtube\.com\/(embed\/|watch\?v=)[a-zA-Z0-9_-]+$/,
                message: "Invalid YouTube embed URL",
              },
            })}
          />
          {errors.video_url && <p className="text-red-500 text-sm">{errors.video_url.message as string}</p>}

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Regular Price"
              type="number"
              placeholder="e.g., 20"
              {...register("regular_price", {
                valueAsNumber: true,
                validate: (value) => {
                  if (value === undefined || value === null || value === "") return true;
                  if (isNaN(value)) return "Must be a number";
                  if (value < 1) return "Must be at least $1";
                  return true;
                },
              })}
            />
            <Input
              label="Sale Price *"
              type="number"
              placeholder="e.g., 15"
              {...register("sale_price", {
                required: "Sale price is required",
                valueAsNumber: true,
                validate: (value) => {
                  if (isNaN(value)) return "Must be a number";
                  if (regularPrice && value >= regularPrice) {
                    return "Must be less than regular price";
                  }
                  return true;
                },
              })}
            />
          </div>
          {errors.sale_price && <p className="text-red-500 text-sm">{errors.sale_price.message as string}</p>}

          {/* Stock */}
          <Input
            label="Stock *"
            type="number"
            placeholder="e.g., 100"
            {...register("stock", {
              required: "Stock is required",
              valueAsNumber: true,
              min: { value: 1, message: "Min 1" },
              max: { value: 5000, message: "Max 5000" },
              validate: (v) => Number.isInteger(v) || "Must be whole number",
            })}
          />
          {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message as string}</p>}

          {/* Selectors */}
          <ColorSelector control={control} errors={errors} />
          <SizeSelector control={control} errors={errors} />
          <CustomSpecifications control={control} errors={errors} />
          <CustomProperties control={control} errors={errors} />
        </div>
        {/* Discount Codes */}
        <div className="md:col-span-12">
          <label className="block font-medium mb-2">Select Discount Codes (optional)</label>
          {discountLoading ? (
            <p className="text-gray-500">Loading discount codes...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {discountCodes.map((code: any) => (
                <button
                  key={code.id}
                  type="button"
                  className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                    watch("discountCodes")?.includes(code.id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    const current = watch("discountCodes") || [];
                    const updated = current.includes(code.id)
                      ? current.filter((id: string) => id !== code.id)
                      : [...current, code.id];
                    setValue("discountCodes", updated);
                  }}
                >
                  {code.public_name} ({code.discountValue}
                  {code.discountType === "percentage" ? "%" : "$"})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cash on Delivery */}
        <div className="md:col-span-6">
          <label className="block font-medium mb-1">Cash On Delivery *</label>
          <select
            defaultValue="yes"
            {...register("cash_on_delivery", { required: "Required" })}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.cash_on_delivery && (
            <p className="text-red-500 text-sm">{errors.cash_on_delivery.message as string}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-12 flex justify-end gap-4 pt-6">
          {isChanged && (
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-5 py-2 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition"
            >
              Save Draft
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>

      {/* Image Enhancement Modal */}
      {openImageModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Enhance Product Image
              </h2>
              <X
                size={20}
                className="cursor-pointer text-gray-600 hover:text-black"
                onClick={() => setOpenImageModal(false)}
              />
            </div>
            <div className="relative w-full h-[250px] border border-gray-300 rounded overflow-hidden mb-4">
              <Image
                src={selectedImage}
                alt="product-preview"
                fill
                className="object-cover"
              />
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">AI Enhancements</h3>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {enhancements.map(({ label, effect }) => (
                <button
                  key={effect}
                  onClick={() => applyTransformation(effect)}
                  disabled={processing}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    activeEffect === effect
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  <Wand size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
