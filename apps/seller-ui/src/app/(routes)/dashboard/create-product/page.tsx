'use client';

import React, { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder';
import Input from 'packages/components/inputs';
import { error } from 'console';
import ColorSelector from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custom-specifications';
import CustomProperties from 'packages/components/custom-properties';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import RichTextEditor from 'packages/components/rich-text-editor';
import SizeSelector from 'packages/components/size-selector';
import Link from 'next/link';

const Page = () => {


    const {register,control,watch,setValue,handleSubmit,formState:{errors}} = useForm();
    const [openImageModal,setOpenImageModal] = useState(false);
    const [isChanged,setIsChanged] = useState(true);
    const [images,setImages] = useState<(File | null)[]>([null]);
    const [loading,setLoading]= useState(false);
    const {data,isLoading,isError} =useQuery({
      queryKey:["categories"],
      queryFn : async ()=>{
        try {
          const res = await axiosInstance.get("/product/api/get-categories");
          return res.data;
        } catch (error) {
          console.log(error)
        }
      },
      staleTime : 1000 * 60 * 5,
      retry : 2,
    })
    

    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || {};

    const selectedCategory = watch("category");
    const regularPrice = watch("regular_price");

    const subcategories = useMemo(()=>{
    return selectedCategory ? subCategoriesData[selectedCategory] || [] :[];
    },[selectedCategory,subCategoriesData])


    console.log(categories,subCategoriesData)


const onSubmit = (data:any)=>{
  console.log(data);
}

const handleImageChange = (file : File | null , index:number)=>{
const updatedImages = [...images];
updatedImages[index] = file;
if(index === images.length -1  && images.length < 8){
    updatedImages.push(null);
}
setImages(updatedImages);
setValue("images",updatedImages);
}

const handleRemoveImage = (index:number)=>{
setImages((prevImages)=>{
    let updatedImages = [...prevImages];
    if(index === -1){
        updatedImages[0] = null;
    }else {
        updatedImages.splice(index,1)
    }
    if(!updatedImages.includes(null) && updatedImages.length < 8){
        updatedImages.push(null);
    }
    return updatedImages
})
setValue("images",images)
}

const handleSaveDraft = ()=>{

}

  return (
    <div>
      <h1
        className="text-3xl font-extrabold mb-2"
        style={{ color: 'var(--heading)', letterSpacing: '-0.02em' }}
      >
        Create Product
      </h1>
      <div
        className="mb-6"
        style={{
        height: 3,
        width: 48,
        background: 'var(--primary)',
        borderRadius: 2,
        }}
    />
        <div className='flex items-center mb-3'>
    <Link href={"/dashboard"} className='text-[#80Deea] cursor-pointer'>Dashboard</Link>
    <ChevronRight size={20} className='opacity-[.8]'/>
    <span>Create Product</span>
    </div>
    <form className='w-full mx-auto p-8 shadow-md rounded-lg text-black' onSubmit={handleSubmit(onSubmit)}>
      {/* {content layout} */}
    <div className='py-4 w-full flex gap-6'>
    {/* {left-Side} */}
    <div className='md:w-[35%]'>
    {images?.length > 0 && (<ImagePlaceHolder setOpenImageModal={setOpenImageModal} size="765 * 850" small={false} index={0} onImageChange={handleImageChange} onRemove={handleRemoveImage}/>)}
        <div className='grid grid-cols-2 gap-3 mt-4 '>
    {images.slice(1).map((_,index)=>(
      <ImagePlaceHolder setOpenImageModal={setOpenImageModal} size="765 * 850" small={true} key ={index} index={index + 1} onImageChange={handleImageChange} onRemove={handleRemoveImage}/>
    ))}
    </div>
    </div>

    {/* right-Side */}
    <div className='md:w-[65%]'>
      <div className='w-full flex gap-6'>
        {/* {Products inputs} */}
        <div className='w-2/4'>
        <div>
        <Input 
        label='Product Title *'
        placeholder='Enter product title'
        {...register("title",{required:"Title is required"})}
        />
        {errors.title && (
          <p className='text-red-500 text-xs mt-1'>{errors.title.message as string}</p>
        )}
        </div>
        <div className='mt-2'>
        <Input
        type='textarea'
        rows={7}
        cols={10}
        label='Short Description * (Max 150 words)'
        placeholder='Enter product description for quick view'
        {...register("description",{
          required:"Description is required",
          validate: (value)=>{
            const wordCount = value.trim().split(/\s+/).length;
            return(
              wordCount <= 150 || `Description cannot exceed 150 words (Current : ${wordCount})`
            );
          },
        })}
        />
        {errors.description&& ( 
          <p className='text-red-500 text-xs mt-1'>
          {errors.description.message as string}
          </p>
        )}
        </div>
        <div className='mt-2'>
          <Input
          label='Tags *'
          placeholder='e.g. Modern,Organic'
          {...register("tags",{
            required:"Seperate related products tags with a coma ,"
          })}
          />
          {errors.tags && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.tags.message as string}

            </p>
          )}

        </div>
        <div className='mt-2'>
          <Input
          label='Warranty *'
          placeholder='1 Year / No Warranty'
          {...register("warranty",{
            required:"Warranty is required!",
          })}
          />
          {errors.warranty &&(
            <p className='text-red-500 text-xs mt-1'>
              {errors.warranty.message as string}
            </p>
          )}

        </div>
        <div className='mt-2'>
          <Input
          label='Slug *'
          placeholder='Product Slug'
          {...register("slug",{
            required:"Slug is required!",
            pattern: {
              value : /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message:"Invalid slug format! Use only lowercase letters , numbers and hyphens (no spaces or special characters)."
            },
            minLength:{
              value:3,
              message:"Slug must be at least 3 characters long.",
            },
            maxLength:{
              value:50,
              message:"Slug cannot be longer than 50 characters."
            }
          })}
          />
          {errors.slug &&(
            <p className='text-red-500 text-xs mt-1'>
              {errors.slug.message as string}
            </p>
          )}

        </div>
        <div className='mt-2'>
          <Input
          label='Brand'
          placeholder='e.g. HumbleHands,Bright'
          {...register("brand")}
          />
          {errors.brand &&(
            <p className='text-red-500 text-xs mt-1'>
              {errors.brand.message as string}
            </p>
          )}

        </div>
        <div className='mt-2'>
          <ColorSelector control={control} errors={errors}/>

        </div>
        <div className='mt-2'>
        <CustomSpecifications control={control} errors={errors}/>

        </div>
        <div className='mt-2'>
        <CustomProperties control={control} errors={errors}/>

        </div>
      <div className='mt-2'>
      <label className='block font-semibold text-gray-600 mb-1'>
        Cash On Delivery *
      </label>
      <select
      {...register("cash_on_delivery",{
        required:"Cash on Delivery is required",
      })}
      defaultValue="yes"
      className='w-full border border-gray-600 rounded-md p-2 bg-transparent text-black outline-none'
      >
        <option value="yes" className='bg-blac'>
        Yes
        </option>
        <option value="no" className='bg-blac'>
        No
        </option>
      </select>
      {errors.cash_on_delivery && (
        <p className='text-red-500 text-xs mt-1'>
        {errors.cash_on_delivery.message as string}
        </p>
      )}
      </div>
        </div>
        <div className='w-2/4'>
        <div>
          <label className='block font-semibold text-gray-600 mb-1'>
            Category *
          </label>
          {
            isLoading? (
              <p className='text-gray-600'>
              Loading Categories...
              </p>
            ) : isError ? (
              <p className='text-red-500'>
              Failed to Load Categories...
              </p>
            ) : (
              <Controller
              name="category"
              control={control}
              rules={{required:"Category is required"}}
              render={({field})=>(
                <select 
                {...field}
                className='w-full border border-gray-600 rounded-md p-2 bg-transparent text-black outline-none'
                >
                <option value="" className='bg-transparent'>
                  Select Category
                </option>
                {categories?.map((category:string)=>(
                  <option className='bg-transparent' value={category} key={category}>
                    {category}
                  </option>
                ))}
                </select>
              )}
              />
            )
          }
          {errors.category &&(
            <p className='text-red-500 text-xs mt-1'>
            {errors.category.message as string}
            </p>
          )}
          <div className='mt-2'>
            <label className='block font-semibold text-gray-600 mb-1'>
              Subcategory *
            </label>
            <Controller
            name="subCategory"
            control={control}
            rules={{required : "Subcategory is required"}}
            render={({field})=>(
              <select
              {...field}
              className='w-full border border-gray-600 rounded-md p-2 bg-transparent text-black outline-none'
              >
              <option value="" className='bg-transparent'>
              Select Subcategory
              
              </option>
              {subcategories?.map((subcategory:string)=>(
                <option
                key={subcategory}
                value={subcategory}
                className='bg-transparent'
                >
                {subcategory}
                </option>
              ))}
              </select>
            )}
            />
            {errors.subcategory && (
              <p className='text-red-500 text-xs mt-1'>
                {errors.subcategory.message as string}
              </p>
            )}
          </div>
          <div className="mt-2">
  <label className='block font-semibold text-gray-600 mb-1'>
    Detailed Description * (Min 100 words)
  </label>
  <Controller
    name="detailed_description"
    control={control}
    rules={{
      required : "Detailed description is required!",
      validate:(value) =>{
        const wordCount = value?.split(/\s+/).filter((word:string)=>word).length;
        return(
          wordCount >= 100 || "Description must be at least 100 words!"
        );
      },
    }}
    render={({field})=>(
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <RichTextEditor
          value={field.value}
          onChange={field.onChange}
        />
      </div>
    )}
  />
  {errors.detailed_description && (
    <p className='text-red-500 text-xs mt-1'>
      {errors.detailed_description.message as string}
    </p>
  )}
          </div>
          <div className='mt-2'>
          <Input
          label='Video URL'
          placeholder='https://www.yotube.com/embed/xyz123'
          {...register("video_url",{
            pattern:{
              value : /^https:\/\/(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
              message:"Invalid Youtube embed URL! use format :https://www.yotube.com/embed/xyz123"
            },
          })}
          />
          {errors.video_url && (
            <p className='text-red-500 text-xs mt-1'>
              {errors.video_url.message as string}
            </p>
          )}
          </div>
          <div className='mt-2'>
  <Input
    label='Regular Price'
    placeholder='e.g., 20$'
    type='number'
    {...register("regular_price", {
      valueAsNumber: true,
      validate: (value) => {
        if (value === undefined || value === null || value === "") return true;
        if (isNaN(value)) {
          return "Only numbers are allowed";
        }
        if (value < 1) {
          return "Price must be at least 1$";
        }
        return true;
      },
    })}
  />
  {errors.regular_price && (
    <p className='text-red-500 text-xs mt-1'>
      {errors.regular_price.message as string}
    </p>
  )}
          </div>
          <div className='mt-2'>
          <Input
    label='Sale Price *'
    placeholder='e.g., 15$'
    type='number'
    {...register("sale_price", {
      required: "Sale Price is required",
      valueAsNumber: true,
      min: {
        value: 1,
        message: "Sale Price must be at least 1"
      },
      validate: (value) => {
        if (isNaN(value)) return "Only numbers are allowed";
        if (regularPrice && value >= regularPrice) {
          return "Sale Price must be less than Regular Price";
        }
        return true;
      }
    })}
  />
  {errors.sale_price && (
    <p className='text-red-500 text-xs mt-1'>
      {errors.sale_price.message as string}
    </p>
          )}
          </div>
          
          <div className='mt-2'>
          <Input
    label='Stock *'
    placeholder='e.g., 100'
    {...register("stock", {
      required: "Stock is required",
      valueAsNumber: true,
      min: {
        value: 1,
        message: "Stock must be at least 1"
      },
      max : {
        value: 5000,
        message : "Stock cannot exceed 5,000"
      },
      validate: (value) => {
        if (isNaN(value)) return "Only numbers are allowed";
        if (!Number.isInteger(value)) {
          return "Stock must be a whole number!";
        }
        return true;
      }
    })}
  />
  {errors.stock && (
    <p className='text-red-500 text-xs mt-1'>
      {errors.stock.message as string}
    </p>
          )}
          </div>
          

          <div className='mt-2'>

          <SizeSelector control={control} errors={errors}/>

          </div>

          <div className='mt-3'>
            <label className='block font-semibold text-gray-600 mb-1'>
              Select Discount Codes (optional)
            </label>
            
          </div>

          
          

          
          
          
        </div>
        </div>
      </div>
      
    </div>
    </div>
            <div className='mt-6 flex justify-end gap-3'>
          {isChanged && (
            <button 
            type='button'
            onClick={handleSaveDraft}
            className='px-4 py-2 bg-gray-600 text-white rounded-md'
            >
              Save Draft
            </button>
          )}
          <button 
          type='submit'
          className='px-4 py-2 bg-blue-600 text-white rounded-md'
          disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>

        </div>
    </form>

    </div>
  )
}

export default Page
