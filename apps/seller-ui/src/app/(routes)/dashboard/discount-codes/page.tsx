'use client'
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { ChevronRight, Plus, Trash } from 'lucide-react'
import Link from 'next/link';
import React, { useState } from 'react'

const Page = () => {
  const [showModal, setShowModal] = useState(false);

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes")
      return res?.data?.discount_codes || [];
    }
  })

  const handleDeleteClick = async (discount: any) => {
    console.log("delete")
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
      </div>
    </div>
  )
}

export default Page;
