'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteDiscountCodeModal from 'apps/seller-ui/src/shared/components/modals/delete.discount-codes';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import { ChevronRight, Plus, Trash, X } from 'lucide-react'
import Link from 'next/link';
import Input from 'packages/components/inputs';
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import toast from "react-hot-toast";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal,setShowDeleteModal] = useState(false);
  const [selectedDiscount , setSelectedDiscount] = useState<any>()
  const queryClient = useQueryClient();
  
  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes")
      return res?.data?.discount_codes || [];
    }
  })

  const {register,handleSubmit,control,reset,formState:{errors},} = useForm({
    defaultValues : {
      public_name:"",
      discountType:"percentage",
      discountValue:"",
      discountCode:"",
    }
  })

  const createDiscountCodeMutation = useMutation({
    mutationFn : async(data)=>{
      await axiosInstance.post("/product/api/create-discount-code",data);
    },
    onSuccess :()=>{
    queryClient.invalidateQueries({ queryKey : ["shop-discounts"] });
    reset()
    setShowModal(false);
    }
  })
  
  const deleteDiscountCodeMutation = useMutation({
    mutationFn : async (discountId)=>{
      await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`)
    },
    onSuccess:()=>{
      queryClient.invalidateQueries({queryKey:["shop-discounts"]});
      setShowDeleteModal(false);
    }
  })

  const handleDeleteClick = async (discount: any) => {
    setSelectedDiscount(discount);
    setShowDeleteModal(true);
  }

  const onSubmit = (data:any)=>{
    if(discountCodes.length >= 8){
    toast.error("You can only create up to 8 discount codes.")
    return;
    }
    createDiscountCodeMutation.mutate(data);
  }



  return (
    <div>
      <h1
        className="text-3xl font-extrabold mb-2"
        style={{ color: 'var(--heading)', letterSpacing: '-0.02em' }}
      >
        Discount Codes
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
        <ChevronRight size={20} className='opacity-[.8]' />
        <span>Discount Codes</span>
      </div>
      <div className='w-full mx-auto p-8 shadow-md rounded-lg text-black'>
        <div className='flex justify-between items-center mb-1'>
          <h5 className='text-xl font-semibold mb-2'>Feeling Generous Today ?!</h5>
          <button onClick={() => setShowModal(true)} className='bg-blue-600 hover:bg-blue-700 flex text-white px-4 py-2 rounded-lg items-center gap-2'>
            <Plus size={18} /> Create Discount
          </button>
        </div>
        <div className='mt-8 bg-gray-900 p-6 rounded-lg shadow-lg'>
          <h3 className='text-lg font-semibold text-white mb-4'>
            Your Discount Codes
          </h3>
          <table className='w-full text-white'>
            <thead>
              <tr className='border-b border-gray-500'>
                <th className='p-3 text-left'>Title</th>
                <th className='p-3 text-left'>Type</th>
                <th className='p-3 text-left'>Value</th>
                <th className='p-3 text-left'>Code</th>
                <th className='p-3 text-left'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className='text-center text-gray-400 py-4'>
                    Loading discounts...
                  </td>
                </tr>
              ) : discountCodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className='text-center text-gray-400 py-5'>
                    No Discount Codes Available!
                  </td>
                </tr>
              ) : (
                discountCodes.map((discount: any) => (
                  <tr key={discount?.id} className='border-b border-gray-500 hover:bg-gray-500 transition'>
                    <td className='p-3'>{discount?.public_name}</td>
                    <td className='p-3 capitalize'>
                      {discount.discountType === "percentage" ? "Percentage (%)" : "Flat ($)"}
                    </td>
                    <td className='p-3'>
                      {discount.discountType === "percentage"
                        ? `${discount.discountValue}%`
                        : `$${discount.discountValue}`}
                    </td>
                    <td className='p-3'>{discount.discountCode}</td>
                    <td className='p-3'>
                      <button
                        onClick={() => handleDeleteClick(discount)}
                        className='text-red-500 hover:text-red-300 transition'
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* create discount modal */}
        {showModal && (
          <div className='fixed top-0 left-0 w-full h-full  bg-opacity-50 flex items-center justify-center'>
            <div className='bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg'>
              <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <h3 className='text-xl text-white'>Create Discount Code</h3>
                <button
                onClick={()=> setShowModal(false)}
                className='text-gray-400 hover:text-white'
                >
                  <X size={22}/>
                </button>

              </div>
<form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
  {/* Title */}
  <div>
    <label className="block text-sm font-medium text-gray-200 mb-2">
      Title (Public Name)
    </label>
    <Input
      {...register("public_name", { required: "Title is required" })}
      className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      placeholder="Enter title"
    />
    {errors.public_name && (
      <p className="text-red-500 text-xs mt-1">
        {errors.public_name.message}
      </p>
    )}
  </div>

  {/* Discount Type */}
  <div>
    <label className="block text-sm font-medium text-gray-200 mb-2">
      Discount Type
    </label>
    <Controller
      control={control}
      name="discountType"
      render={({ field }) => (
        <select
          {...field}
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="percentage">Percentage (%)</option>
          <option value="flat">Flat Amount ($)</option>
        </select>
      )}
    />
  </div>

  {/* Discount Value */}
  <div>
    <label className="block text-sm font-medium text-gray-200 mb-2">
      Discount Value
    </label>
    <Input
      min={1}
      type="number"
      {...register("discountValue", { required: "Value is required" })}
      className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  </div>
  
    {/* Discount Code */}
  <div>
    <label className="block text-sm font-medium text-gray-200 mb-2">
      Discount Code
    </label>
    <Input
      {...register("discountCode", { required: "Discount Code is required" })}
      className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  </div>

  <button type='submit'
  disabled={createDiscountCodeMutation.isPending}
  className='mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2'
  >
  <Plus size={18}/> {createDiscountCodeMutation?.isPending ? "Creating ..." : "Create"}
  </button>
  {createDiscountCodeMutation.isError && (
    <p className='text-red-500 text-sm mt-2'>
      {(
        createDiscountCodeMutation.error as AxiosError<{
          message:string
        }>
      )?.response?.data?.message || "Something went wrong"}
    </p>
  )}
</form>
            </div>
          </div>
        )}
        {showDeleteModal && selectedDiscount && (
          <DeleteDiscountCodeModal
          discount={selectedDiscount}
          onClose={()=> setShowDeleteModal(false)}
          onConfirm={()=> deleteDiscountCodeMutation.mutate(selectedDiscount?.id)}
          />
        )}
      </div>
    </div>
  )
}

export default Page;
