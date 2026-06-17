"use client";

import React, { useMemo, useState } from "react";
import {  Wand, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import ImagePlaceHolder from "apps/seller-ui/src/shared/components/image-placeholder";
import Input from "packages/components/inputs";
import ColorSelector from "packages/components/color-selector";
import CustomSpecifications from "packages/components/custom-specifications";
import CustomProperties from "packages/components/custom-properties";
import SizeSelector from "packages/components/size-selector";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(
  () => import("packages/components/rich-text-editor"),
  { ssr: false }
);

import Image from "next/image";
import { enhancements } from "apps/seller-ui/src/utils/AI.Enhancements";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { convertToWebP } from "apps/seller-ui/src/utils/convertToWebP";

interface UploadedImage {
  fileId: string;
  file_url: string;
}

const Page = () => {
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [openImageModal, setOpenImageModal] = useState(false);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
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
    },
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

      const hasImages = images.some((img) => img !== null && img?.file_url);
      if (!hasImages) {
        toast.error("Please upload at least one product image");
        setLoading(false);
        return;
      }

      const productData = { ...data };

      if (
        data.createEvent &&
        data.event_starting_date &&
        data.event_ending_date
      ) {
        const startDate = new Date(data.event_starting_date);
        const endDate = new Date(data.event_ending_date);
        const now = new Date();

        if (startDate <= now) {
          toast.error("Event start date must be in the future");
          setLoading(false);
          return;
        }

        if (endDate <= startDate) {
          toast.error("Event end date must be after start date");
          setLoading(false);
          return;
        }

        productData.starting_date = startDate.toISOString();
        productData.ending_date = endDate.toISOString();

        if (
          data.event_discount_percentage &&
          data.event_discount_percentage > 0
        ) {
          const regularPrice = parseFloat(data.regular_price);
          const discountedPrice =
            regularPrice * (1 - data.event_discount_percentage / 100);
          productData.sale_price = Math.round(discountedPrice * 100) / 100;
        }

        console.log("Creating product with event dates:", {
          starting_date: productData.starting_date,
          ending_date: productData.ending_date,
          discount_percentage: data.event_discount_percentage,
          sale_price: productData.sale_price,
        });
      }

      await axiosInstance.post("/product/api/create-product", productData);

      if (
        data.createEvent &&
        data.event_starting_date &&
        data.event_ending_date
      ) {
        toast.success("Product and limited event created successfully!");
      } else {
        toast.success("Product created successfully!");
      }

      router.push("/dashboard/all-products");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;
    setPictureUploadingLoader(true);
    try {
      const fileName = await convertToWebP(file);
      const response = await axiosInstance.post(
        "/product/api/upload-product-image",
        { fileName }
      );
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
          data: { fileId: imageToDelete.fileId! },
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
      let [baseUrl, queryString] = selectedImage.split("?");
      let params = new URLSearchParams(queryString || "");
      params.delete("tr");
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

  return (
    <div
      className="min-h-screen bg-[#F4F2EF]"
      style={{
        backgroundImage:
          'url("https://ik.imagekit.io/w7lwh7wre/wood-texture.jpg?updatedAt=1754240423756")',
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-[Poppins] mb-2">
            Create Product
          </h1>
          <div className="h-1 w-16 bg-orange-500 mb-4 rounded"></div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-12 gap-8"
        >
          {/* Left Column - Images */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 font-[Poppins] mb-4">
                Product Images *
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Upload at least one product image (required)
              </p>
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
          </div>
          {/* Right Column - Product Form */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-lg space-y-6">
              {/* Product Title */}
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">
                  {errors.title.message as string}
                </p>
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
                    return (
                      wordCount <= 150 ||
                      `Max 150 words allowed (Current: ${wordCount})`
                    );
                  },
                })}
              />
              {errors.short_description && (
                <p className="text-red-500 text-sm">
                  {errors.short_description.message as string}
                </p>
              )}

              {/* Tags */}
              <Input
                label="Tags *"
                placeholder="e.g. Modern, Organic"
                {...register("tags", { required: "Tags are required" })}
              />
              {errors.tags && (
                <p className="text-red-500 text-sm">
                  {errors.tags.message as string}
                </p>
              )}

              {/* Brand */}
              <Input
                label="Brand"
                placeholder="e.g. HumbleHands, Bright"
                {...register("brand")}
              />

              {/* Warranty */}
              <Input
                label="Warranty *"
                placeholder="1 Year / No Warranty"
                {...register("warranty", { required: "Warranty is required!" })}
              />
              {errors.warranty && (
                <p className="text-red-500 text-sm">
                  {errors.warranty.message as string}
                </p>
              )}

              {/* Slug */}
              <Input
                label="Slug *"
                placeholder="product-title-slug"
                {...register("slug", {
                  required: "Slug is required",
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: "Only lowercase letters, numbers, hyphens allowed",
                  },
                  minLength: { value: 3, message: "Min 3 characters" },
                  maxLength: { value: 50, message: "Max 50 characters" },
                })}
              />
              {errors.slug && (
                <p className="text-red-500 text-sm">
                  {errors.slug.message as string}
                </p>
              )}

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
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors.category && (
                  <p className="text-red-500 text-sm">
                    {errors.category.message as string}
                  </p>
                )}
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
                        <option key={subcat} value={subcat}>
                          {subcat}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subCategory && (
                  <p className="text-red-500 text-sm">
                    {errors.subCategory.message as string}
                  </p>
                )}
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block font-medium mb-1">
                  Detailed Description *
                </label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "Detailed description is required",
                    validate: (value) => {
                      const wordCount = value
                        ?.split(/\s+/)
                        .filter((w: string) => w).length;
                      return wordCount >= 100 || "Must be at least 100 words";
                    },
                  }}
                  render={({ field }) => (
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-sm">
                    {errors.detailed_description.message as string}
                  </p>
                )}
              </div>

              {/* Video URL */}
              <Input
                label="Video URL (optional)"
                placeholder="https://www.youtube.com/embed/xyz123"
                {...register("video_url", {
                  pattern: {
                    value:
                      /^https:\/\/(www\.)?youtube\.com\/(embed\/|watch\?v=)[a-zA-Z0-9_-]+$/,
                    message: "Invalid YouTube embed URL",
                  },
                })}
              />
              {errors.video_url && (
                <p className="text-red-500 text-sm">
                  {errors.video_url.message as string}
                </p>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Regular Price"
                  type="number"
                  placeholder="e.g., 20"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    validate: (value) => {
                      if (
                        value === undefined ||
                        value === null ||
                        value === "" ||
                        Number.isNaN(value)
                      )
                        return true;
                      if (
                        typeof value === "number" &&
                        !isNaN(value) &&
                        value >= 1
                      )
                        return true;
                      if (
                        typeof value === "number" &&
                        !isNaN(value) &&
                        value < 1
                      )
                        return "Must be at least $1";
                      return "Must be a valid number";
                    },
                  })}
                />
                <Input
                  label="Sale Price (Optional)"
                  type="number"
                  placeholder="e.g., 15"
                  {...register("sale_price", {
                    valueAsNumber: true,
                    validate: (value) => {
                      if (
                        value === undefined ||
                        value === null ||
                        value === "" ||
                        Number.isNaN(value)
                      )
                        return true;
                      if (
                        typeof value === "number" &&
                        !isNaN(value) &&
                        value > 0
                      ) {
                        if (regularPrice && value >= regularPrice) {
                          return "Must be less than regular price";
                        }
                        return true;
                      }
                      return "Must be a valid number";
                    },
                  })}
                />
              </div>
              {errors.sale_price && (
                <p className="text-red-500 text-sm">
                  {errors.sale_price.message as string}
                </p>
              )}

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
                  validate: (v) =>
                    Number.isInteger(v) || "Must be whole number",
                })}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm">
                  {errors.stock.message as string}
                </p>
              )}

              {/* Limited Event Option */}
              {watch("stock") > 0 &&
                watch("stock") < 100 &&
                Number.isInteger(watch("stock")) && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        LIMITED
                      </span>
                      <h3 className="font-medium text-gray-900">
                        Create Limited Event
                      </h3>
                    </div>
                    <p className="text-sm text-orange-800 mb-3">
                      This product qualifies for limited events (stock &lt;
                      100). You can create an event directly during product
                      creation.
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="createEvent"
                        {...register("createEvent")}
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor="createEvent"
                        className="text-sm font-medium text-gray-700"
                      >
                        Create limited event for this product
                      </label>
                    </div>

                    {watch("createEvent") && (
                      <div className="space-y-3 mt-3 p-3 bg-white rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Event Start Date & Time *
                            </label>
                            <input
                              type="datetime-local"
                              {...register("event_starting_date", {
                                required: watch("createEvent")
                                  ? "Start date is required for events"
                                  : false,
                              })}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                            {errors.event_starting_date && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.event_starting_date.message as string}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Event End Date & Time *
                            </label>
                            <input
                              type="datetime-local"
                              {...register("event_ending_date", {
                                required: watch("createEvent")
                                  ? "End date is required for events"
                                  : false,
                              })}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                            {errors.event_ending_date && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.event_ending_date.message as string}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Event Discount % (Optional)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="e.g., 20 for 20% off"
                            {...register("event_discount_percentage", {
                              valueAsNumber: true,
                              validate: (value) => {
                                if (
                                  value === undefined ||
                                  value === null ||
                                  value === ""
                                )
                                  return true;
                                if (value < 0 || value > 100)
                                  return "Discount must be between 0-100%";
                                return true;
                              },
                            })}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                          {errors.event_discount_percentage && (
                            <p className="text-red-500 text-xs mt-1">
                              {
                                errors.event_discount_percentage
                                  .message as string
                              }
                            </p>
                          )}

                          {/* Discount Preview */}
                          {watch("event_discount_percentage") &&
                          watch("event_discount_percentage") > 0 &&
                          regularPrice &&
                          typeof regularPrice === "number" &&
                          !isNaN(regularPrice) &&
                          regularPrice > 0 ? (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                              <div className="flex justify-between">
                                <span>Regular Price:</span>
                                <span className="line-through">
                                  ${regularPrice.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>
                                  Discount ({watch("event_discount_percentage")}
                                  %):
                                </span>
                                <span className="text-red-600">
                                  -$
                                  {(
                                    (regularPrice *
                                      watch("event_discount_percentage")) /
                                    100
                                  ).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between font-semibold text-green-700 border-t border-green-300 pt-1">
                                <span>Event Price:</span>
                                <span>
                                  $
                                  {(
                                    regularPrice -
                                    (regularPrice *
                                      watch("event_discount_percentage")) /
                                      100
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ) : watch("event_discount_percentage") &&
                            watch("event_discount_percentage") > 0 ? (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <p className="text-yellow-800">
                                💡 Enter a regular price above to see the
                                discount preview
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Selectors */}
              <ColorSelector control={control} errors={errors} />
              <SizeSelector control={control} errors={errors} />
              <CustomSpecifications control={control} errors={errors} />
              <CustomProperties control={control} errors={errors} />

              {/* Product Personalization Section */}
              <div className="space-y-4 p-4 border border-orange-200 rounded-lg bg-orange-50">
                <h3 className="text-lg font-semibold text-gray-900 font-[Poppins]">
                  Product Personalization
                </h3>
                <p className="text-sm text-gray-600 font-[Work Sans]">
                  Allow customers to personalize this product with custom text,
                  names, or special requests.
                </p>

                {/* Enable Personalization Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="personalizationEnabled"
                    {...register("personalizationEnabled")}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label
                    htmlFor="personalizationEnabled"
                    className="text-sm font-medium text-gray-700 font-[Work Sans]"
                  >
                    Enable product personalization
                  </label>
                </div>

                {/* Personalization Instructions - Only show if personalization is enabled */}
                {watch("personalizationEnabled") && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2 font-[Work Sans]">
                        Personalization Instructions
                        <span className="text-sm text-gray-500 font-normal ml-1">
                          (Help customers understand what they can personalize)
                        </span>
                      </label>
                      <textarea
                        {...register("personalizationInstructions")}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 font-[Work Sans]"
                        placeholder="Example: Please provide the name you'd like engraved (up to 15 characters). You can also specify font preference: Script, Block, or Cursive."
                      />
                      {errors.personalizationInstructions && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.personalizationInstructions.message as string}
                        </p>
                      )}
                    </div>

                    {/* Personalization Required Checkbox */}
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="personalizationRequired"
                        {...register("personalizationRequired")}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label
                        htmlFor="personalizationRequired"
                        className="text-sm font-medium text-gray-700 font-[Work Sans]"
                      >
                        Personalization is required (customers must provide
                        personalization details before adding to cart)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Discount Codes and Cash on Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 font-[Work Sans]">
                    Discount Codes (Optional)
                  </label>
                  {discountLoading ? (
                    <p className="text-gray-500">Loading discount codes...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {discountCodes.map((code: any) => (
                        <button
                          key={code.id}
                          type="button"
                          className={`px-3 py-1 rounded-md text-sm font-[Work Sans] ${
                            watch("discountCodes")?.includes(code.id)
                              ? "bg-orange-600 text-white border-orange-600"
                              : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-orange-50"
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
                <div>
                  <label className="block font-medium mb-1 font-[Work Sans]">
                    Cash On Delivery *
                  </label>
                  <select
                    defaultValue="yes"
                    {...register("cash_on_delivery", { required: "Required" })}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  {errors.cash_on_delivery && (
                    <p className="text-red-500 text-sm">
                      {errors.cash_on_delivery.message as string}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-[Work Sans] transition"
                >
                  {loading ? "Creating..." : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Image Enhancement Modal */}
        {openImageModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-lg w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 font-[Poppins]">
                  Enhance Product Image
                </h2>
                <X
                  size={20}
                  className="cursor-pointer text-gray-600 hover:text-orange-600"
                  onClick={() => setOpenImageModal(false)}
                />
              </div>
              <div className="relative w-full h-[250px] border border-orange-200 rounded-lg overflow-hidden mb-4">
                <Image
                  src={selectedImage}
                  alt="product-preview"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-700 font-[Work Sans] mb-2">
                AI Enhancements
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {enhancements.map(({ label, effect }) => (
                  <button
                    key={effect}
                    onClick={() => applyTransformation(effect)}
                    disabled={processing}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-[Work Sans] ${
                      activeEffect === effect
                        ? "bg-orange-600 text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-orange-50"
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
    </div>
  );
};

export default Page;
