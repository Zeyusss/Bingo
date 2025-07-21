'use client'
import React, { useMemo, useState } from 'react'

import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";

import {
    Search,Pencil,Trash,Eye,BarChart,Star,ChevronRight
} from "lucide-react";

import Link from "next/link";
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { useMutation, useQuery,useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/modals/delete.confirmation.modal';

const fetchProducts = async ()=>{
    const res = await axiosInstance.get("/product/api/get-shop-products");
    return res?.data?.products;
}

const deleteProduct = async (productId: string) =>{
await axiosInstance.delete(`/product/api/delete-product/${productId}`)
}

const restoreProduct = async (productId:string)=>{
    await axiosInstance.put(`/product/api/restore-product/${productId}`)
}

const ProductList = () => {
    const [globalFilter , setGlobalFilter] = useState("");
    const [analyticsData,setAnalyticsData] = useState(null);
    const [showAnalytics , setShowAnalytics]= useState(false);
    const [showDeleteModal,setShowDeleteModal] = useState(false);
    const [selectedProduct,setSelectedProduct] = useState<any>();
    const queryClient = useQueryClient();

    const {data:products = [],isLoading} = useQuery({
        queryKey: [ "shop-products"],
        queryFn:fetchProducts,
        staleTime : 1000 * 60 * 5,
    })

    const deleteMutation = useMutation({
        mutationFn : deleteProduct,
        onSuccess: ()=>{
            queryClient.invalidateQueries({queryKey:["shop-products"]})
            setShowDeleteModal(false);
        }
    })

    const restoreMutation = useMutation({
        mutationFn:restoreProduct,
        onSuccess : ()=>{
            queryClient.invalidateQueries({queryKey:["shop-products"]})
            setShowDeleteModal(false);
        }
    })

    const  columns = useMemo(
        ()=> [
            {
                accessorkey : 'image',
                header : "Image",
                cell : ({row}:any) => {
                    return(
                      <div className='flex justify-center'>
                        <Image
                          src={row.original.images[0]?.url}
                          alt={row.original.images[0]?.url}
                          width={200}
                          height={200}
                          className='w-12 h-12 rounded-md object-cover'
                        />
                      </div>
                    )
                }
            },{
                accessorkey:"name",
                header:"Product Name",
                cell : ({row}:any)=>{
                    const truncatedTitle = row.original.title.length > 25 ? `${row.original.title.substring(0,25)}...`: row.original.title;
                    return(
                        <div className='flex justify-center'>
                          <Link
                            href={`${process.env.NEXT_PUBLIC_USE_UI_LINK}/product/${row.original.slug}`}
                            className='text-blue-400 hover:underline'
                          >
                            {truncatedTitle}
                          </Link>
                        </div>
                    )
                },
            },
            {
                accessorkey:"price",
                header : "Price",
                cell : ({row}:any) => <span className='block text-center'>${row.original.sale_price}</span>
            },
            {
                accessorkey:"stock",
                header:"Stock",
                cell : ({row}:any)=>(
                    <span className={row.original.stock <10 ? "text-red-500 block text-center" : "text-gray-900 block text-center"}>
                        {row.original.stock} left
                    </span>
                )
            },
            {
                accessorkey:"category",
                header:"Category",
                cell : ({row}:any) => <span className='block text-center'>{row.original.category}</span>
            },
            {
                accessorkey : "rating",
                header: "Rating",
                cell : ({row}:any)=>(
                    <div className='flex items-center justify-center gap-1 text-yellow-400'>
                        <Star fill='#fde04' size={18}/> {" "}
                        <span className='text-gray-900'>{row.original.ratings || 5}</span>
                    </div>
                )
            },
            {
                header: "Actions",
                cell:({row}:any) =>(
                    <div className='flex gap-3 justify-center'>
                        <Link
                        href={`/product/${row.original.id}`}
                        className='text-blue-400 hover:text-blue-300 transition'
                        >
                        <Eye size={18}/>
                        </Link>
                        <Link
                        href={`/product/edit/${row.original.id}`}
                        className='text-yellow-400 hover:text-yellow-300 transition'
                        >
                        <Pencil size={18}/>
                        </Link>
                        <button className='text-green-400 hover:text-green-300 transition'>
                        <BarChart size={18}/>
                        </button>
                        <button  className='text-red-400 hover:text-red-300 transition'
                        onClick={()=>openDeleteModal(row.original)}
                        >
                        <Trash size={18}/>
                        </button>
                    </div>
                )
            }
        ],
        []
    )

    const table = useReactTable({
        data:products,
        columns,
        getCoreRowModel:getCoreRowModel(),
        getFilteredRowModel : getFilteredRowModel(),
        globalFilterFn: "includesString",
        state:{globalFilter},
        onGlobalFilterChange:setGlobalFilter,
    });

    const openDeleteModal = (product:any) =>{
        setSelectedProduct(product);
        setShowDeleteModal(true);
    }

  return (
    <div className="min-h-screen" style={{ background: '#FDFAFB' }}>
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-3xl font-extrabold mt-8 mb-1 text-gray-900 drop-shadow-lg"
          style={{ letterSpacing: '-0.02em' }}
        >
          All Products
        </h1>
        <div
          className="mb-3"
          style={{
            height: 3,
            width: 48,
            background: 'var(--primary, #60a5fa)',
            borderRadius: 2,
          }}
        />
        <div className='flex items-center mb-4'>
          <Link href="/dashboard" className='text-[#80Deea] cursor-pointer hover:underline'>Dashboard</Link>
          <ChevronRight size={20} className='opacity-[.8]'/>
          <span className='text-gray-800'>All Products</span>
        </div>
        <div className='w-full max-w-6xl flex flex-col items-center'>
          <div className='w-full glassy-card border border-gray-200 bg-white/60 rounded-2xl shadow-2xl p-4 sm:p-8 flex flex-col items-center'>
            <div className='w-full my-4 flex items-center bg-white/40 p-2 rounded-md border border-gray-200'>
              <Search size={18} className='text-gray-500 mr-2' />
              <input type="text"
                placeholder='Search Products...'
                className='w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400'
                value={globalFilter}
                onChange={(e)=> setGlobalFilter(e.target.value)}
              />
            </div>
            {/* Table */}
            <div className='w-full overflow-x-auto rounded-lg p-0 mt-2 flex justify-center'>
              {isLoading ? (
                <p className='text-center text-gray-900'>Loading Products...</p>
              ):(
                <table className='w-full text-gray-900 rounded-xl overflow-hidden shadow-lg bg-white/80 border border-gray-200 text-center'>
                  <thead className='bg-white/60'>
                    {table.getHeaderGroups().map((headerGroup)=>(
                      <tr key={headerGroup.id} className='border-b border-gray-200'>
                        {headerGroup.headers.map((header)=>(
                          <th key={header.id} className='p-3 text-sm font-semibold tracking-wide text-gray-700 text-center'>
                            {header.isPlaceholder?null:flexRender(header.column.columnDef.header,header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row)=>(
                      <tr key={row.id}
                        className='border-b border-gray-200 hover:bg-gray-100 transition group'>
                        {row.getVisibleCells().map((cell)=>(
                          <td key={cell.id} className='p-3 text-center group-hover:text-gray-900 transition'>
                            {flexRender(cell.column.columnDef.cell,cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {showDeleteModal && (
                <DeleteConfirmationModal
                  product={selectedProduct}
                  onClose={()=> setShowDeleteModal(false)}
                  onConfirm={()=> deleteMutation.mutate(selectedProduct?.id)}
                  onRestore={()=> restoreMutation.mutate(selectedProduct?.id)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .glassy-card {
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
          background: rgba(255,255,255,0.7);
          border-radius: 20px;
          border: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  )
}

export default ProductList
