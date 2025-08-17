"use client";
import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../../utils/axiosInstance';

interface EventProduct {
  id: string;
  title: string;
  slug: string;
  sale_price: number;
  stock: number;
  starting_date: string;
  ending_date: string;
  images: { url: string }[];
  Shop: { name: string };
  category: { name: string };
  ratings: number;
}

interface EventsResponse {
  success: boolean;
  data: EventProduct[];
  meta: {
    totalEvents: number;
    currentPage: number;
    totalPages: number;
  };
}

const fetchAllEvents = async (page: number = 1, limit: number = 20): Promise<EventsResponse> => {
  const res = await axiosInstance.get(`/admin/api/get-all-events?page=${page}&limit=${limit}`);
  return res.data;
};

const EventsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-events', currentPage, pageSize],
    queryFn: () => fetchAllEvents(currentPage, pageSize),
    staleTime: 1000 * 60 * 5,
  });

  const events = data?.data || [];
  const meta = data?.meta || { totalEvents: 0, currentPage: 1, totalPages: 1 };

  // Calculate event status and summary
  const eventSummary = useMemo(() => {
    const now = new Date();
    let active = 0, upcoming = 0, ended = 0;

    events.forEach(event => {
      const startDate = new Date(event.starting_date);
      const endDate = new Date(event.ending_date);
      
      if (startDate > now) {
        upcoming++;
      } else if (startDate <= now && endDate >= now) {
        active++;
      } else {
        ended++;
      }
    });

    return { active, upcoming, ended, total: events.length };
  }, [events]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }: any) => (
          <div className='flex justify-center'>
            <img
              src={row.original.images?.[0]?.url || '/placeholder-image.jpg'}
              alt={row.original.title}
              className='w-12 h-12 rounded-lg object-cover'
            />
          </div>
        )
      },
      {
        accessorKey: 'title',
        header: 'Product Name',
        cell: ({ row }: any) => {
          const truncatedTitle = row.original.title.length > 30 ? `${row.original.title.substring(0, 30)}...` : row.original.title;
          return (
            <div className='flex flex-col items-start justify-center'>
              <span className='text-gray-900 font-medium'>{truncatedTitle}</span>
              <p className="text-sm text-gray-500 mt-1">Shop: {row.original.Shop?.name || 'N/A'}</p>
              <p className="text-xs text-gray-400">Category: {row.original.category?.name || 'N/A'}</p>
            </div>
          )
        },
      },
      {
        accessorKey: 'sale_price',
        header: 'Price',
        cell: ({ row }: any) => (
          <span className="block text-center text-gray-700 font-semibold">
            ${row.original.sale_price}
          </span>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }: any) => (
          <span className={row.original.stock < 10 ? "text-red-500 block text-center font-medium" : "text-gray-700 block text-center"}>
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: 'starting_date',
        header: 'Start Date',
        cell: ({ row }: any) => {
          const date = new Date(row.original.starting_date);
          const formattedDate = date.toLocaleDateString();
          const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div className="text-center">
              <span className="block text-gray-700 text-sm font-medium">{formattedDate}</span>
              <span className="block text-gray-500 text-xs">{formattedTime}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'ending_date',
        header: 'End Date',
        cell: ({ row }: any) => {
          const date = new Date(row.original.ending_date);
          const formattedDate = date.toLocaleDateString();
          const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div className="text-center">
              <span className="block text-gray-700 text-sm font-medium">{formattedDate}</span>
              <span className="block text-gray-500 text-xs">{formattedTime}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Event Status',
        cell: ({ row }: any) => {
          const now = new Date();
          const startDate = new Date(row.original.starting_date);
          const endDate = new Date(row.original.ending_date);
          
          let status = 'ended';
          let statusClass = 'bg-gray-100 text-gray-700';
          
          if (startDate > now) {
            status = 'upcoming';
            statusClass = 'bg-blue-100 text-blue-700';
          } else if (startDate <= now && endDate >= now) {
            status = 'active';
            statusClass = 'bg-green-100 text-green-700';
          } else {
            status = 'ended';
            statusClass = 'bg-gray-100 text-gray-700';
          }
          
          return (
            <div className="flex justify-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusClass}`}>
                {status}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'ratings',
        header: 'Rating',
        cell: ({ row }: any) => (
          <div className="flex justify-center items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="text-gray-700 text-sm">{row.original.ratings?.toFixed(1) || '0.0'}</span>
          </div>
        ),
      },
      {
        header: 'Actions',
        cell: ({ row }: any) => (
          <div className='flex items-center space-x-2 justify-center'>
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
              onClick={() => window.open(`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`, '_blank')}
            >
              View
            </button>
          </div>
        )
      }
    ],
    []
  );

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading events. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Events</h1>
          <p className="text-gray-600 mt-1">Monitor all limited-time product events across the platform</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">{meta.totalEvents} total events</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-600 font-semibold">Active: {eventSummary.active}</span>
            <span className="text-blue-600 font-semibold">Upcoming: {eventSummary.upcoming}</span>
            <span className="text-gray-600 font-semibold">Ended: {eventSummary.ended}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{meta.totalEvents}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">📅</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-green-600">{eventSummary.active}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">🟢</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-blue-600">{eventSummary.upcoming}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">🔵</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ended Events</p>
              <p className="text-2xl font-bold text-gray-600">{eventSummary.ended}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">⚫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <th key={header.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      <span className="text-gray-600">Loading events...</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, meta.totalEvents)} of {meta.totalEvents} events
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, meta.totalPages))}
              disabled={currentPage === meta.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
