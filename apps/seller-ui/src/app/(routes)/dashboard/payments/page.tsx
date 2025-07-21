'use client'
import React,{useMemo,useState} from 'react'
import { useReactTable,getCoreRowModel,getFilteredRowModel,flexRender } from '@tanstack/react-table'
import {Search,Eye, ChevronRight} from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import Link from "next/link";

const fetchOrders = async()=>{
    const res =await axiosInstance.get("/order/api/get-seller-orders");
    return res.data.orders;
};

const sellerPayments = ()=>{
    const [globalFilter,setGlobalFilter] = useState("")
    const {data:orders = [], isLoading} = useQuery({
        queryKey:["seller-orders"],
        queryFn:fetchOrders,
        staleTime : 1000 * 60 *5
    });

    const columns = useMemo(
        ()=>[
            {
                accessorKey : "id",
                header:"Order ID",
                cell : ({row}: any)=>(
                    <span className='text-gray-900 text-sm'>
                    #{row.original.id.slice(-6).toUpperCase()}
                    </span>
                ),
            },
            {
                accessorKey:"user.name",
                header:"Buyer",
                cell : ({row}:any)=>(
                    <span className='text-gray-900'>
                    {row.original.user?.name || "Guest"}
                    </span>
                ),
            },
            {
                header:"Seller Earning",
            cell:({row}:any) =>{
                const sellerShare = row.original.total *0.9;
                return(
                    <span className='text-green-600 font-semibold'>
                    ${sellerShare.toFixed(2)}
                    </span>
                )
            }
            },
            {
                header : "Admin Fee",
                cell : ({row}:any) =>{
                    const adminFee = row.original.total * 0.1;
                    return(
                        <span className='text-purple-600 font-semibold'>
                        ${adminFee.toFixed(2)}
                        </span>
                    )
                }
            },
            {
                accessorKey:"status",
                header : "Status",
                cell : ({row}:any)=>(
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        row.original.status === "Paid" ? "bg-green-600 text-white" : "bg-gray-400 text-gray-900" 
                    }`}>
                    {row.original.status}
                    </span>
                )
            },
            {
                accessorKey: "createdAt",
                header:"Date",
                cell:({row}:any)=>{
                    const date = new Date(row.original.createdAt).toLocaleDateString();
                    return <span className='text-gray-700 text-sm'>
                    {date}
                    </span>
                }
            }
        ],
        []
    )
    const table = useReactTable({
        data:orders,
        columns,
        getCoreRowModel:getCoreRowModel(),
        getFilteredRowModel:getFilteredRowModel(),
        globalFilterFn : "includesString",
        state : {globalFilter},
        onGlobalFilterChange:setGlobalFilter,
    });
    return(
      <div className="min-h-screen" style={{ background: '#FDFAFB' }}>
        <div className="max-w-6xl mx-auto">
          <h1
            className="text-3xl font-extrabold mt-8 mb-1 text-gray-900 drop-shadow-lg"
            style={{ letterSpacing: '-0.02em' }}
          >
            Payments
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
          <span className='text-gray-800'>Payments</span>
        </div>
          <div className='w-full max-w-6xl flex flex-col items-center'>
            <div className='w-full glassy-card border border-gray-200 bg-white/60 rounded-2xl shadow-2xl p-4 sm:p-8 flex flex-col items-center'>
              <div className='w-full my-4 flex items-center bg-white/40 p-2 rounded-md border border-gray-200'>
                <Search size={18} className='text-gray-500 mr-2'/>
                <input type="text"
                  placeholder='Search payments...'
                  className='w-full bg-transparent text-gray-900 outline-none placeholder:text-gray-400'
                  value={globalFilter}
                  onChange={(e)=> setGlobalFilter(e.target.value)}
                />
              </div>
              {/* table */}
              <div className='w-full overflow-auto rounded-lg p-0 mt-2 flex justify-center'>
                {isLoading? (
                  <p className='text-center text-gray-900 py-10 text-lg'>
                    Loading payments....
                  </p>
                ):(
                  <table className='w-full text-gray-900 rounded-xl overflow-hidden shadow-lg bg-white/80 border border-gray-200 text-center'>
                    <thead className='bg-white/60'>
                      {table.getHeaderGroups().map((headerGroup)=>(
                         <tr className='border-b border-gray-200' key={headerGroup.id} >
                          {headerGroup.headers.map((header)=>(
                             <th key={header.id} className='p-4 text-sm font-semibold tracking-wide text-gray-700 text-center'>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
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
                            <td key={cell.id} className='p-4 text-sm align-middle group-hover:text-gray-900 transition text-center'>
                              {flexRender(cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {!isLoading && orders?.length === 0 && (
                  <p className='text-center py-10 text-gray-500 text-lg'>
                    No payments found!
                  </p>
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


export default sellerPayments
