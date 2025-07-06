'use client';

import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder';
import Input from 'packages/components/inputs';
import { error } from 'console';
import ColorSelector from 'packages/components/color-selector';
import CustomSpecifications from 'packages/components/custom-specifications';
import CustomProperties from 'packages/components/custom-properties';

const Page = () => {


    const {register,control,watch,setValue,handleSubmit,formState:{errors}} = useForm();
    const [openImageModal,setOpenImageModal] = useState(false);
    const [isChanged,setIsChanged] = useState(false);
    const [images,setImages] = useState<(File | null)[]>([null]);
    const [loading,setLoading]= useState(false);

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
    <span className='text-[#80Deea] cursor-pointer'>Dashboard</span>
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









        </div>
      </div>

    </div>
    </div>
    </form>

    </div>
  )
}

export default Page
