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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "apps/seller-ui/src/shared/components/ui/table"
import { Input } from "apps/seller-ui/src/shared/components/ui/input"
import { Skeleton } from "apps/seller-ui/src/shared/components/ui/skeleton"
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
                        <span className='text-gray-900'>{row.original.ratings || "N/A"}</span>
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your products</p>
        </div>
        <div className="text-sm text-gray-500">{products.length} products</div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search products..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableHead key={header.id} className="text-center">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    <span>Loading products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
          onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
        />
      )}
    </div>
  );
};

export default ProductList;