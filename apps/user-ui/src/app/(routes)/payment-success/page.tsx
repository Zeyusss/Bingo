'use client'
import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from 'apps/user-ui/src/store';
import confetti from "canvas-confetti"
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';

const PaymentSuccessPage = () => {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");
    const router = useRouter();
    const [orderId, setOrderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        useStore.setState({ cart: [] });

        confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
        });

        const fetchRecentOrder = async () => {
            try {
                const response = await axiosInstance.get('/order/api/get-user-orders');
                const orders = response.data.orders;
                if (orders && orders.length > 0) {
                    setOrderId(orders[0].id);
                }
            } catch (error) {
                console.error('Error fetching recent order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentOrder();
    }, []);

  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4'>
        <div className='bg-white shadow-md border border-gray-200 rounded-2xl max-w-md w-full p-6 text-center'>
        <div className='text-green-500 mb-4'>
        <CheckCircle className='w-16 h-16 mx-auto'/>
        </div>
        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
        Payment Successful
        </h2>
        <p className='text-sm text-gray-600 mb-6'>
        Thank you for your purchase. Your order has been placed successfully!
        </p>
        <button
        onClick={() => orderId ? router.push(`/order/${orderId}`) : router.push('/profile?tab=Orders')}
        disabled={loading}
        className={`w-full px-6 py-2.5 rounded-xl transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
          loading 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
        >
        {loading && <Loader2 className='animate-spin w-4 h-4'/>}
        {loading ? 'Loading...' : orderId ? 'Track Order' : 'View My Orders'}
        </button>
        <div className='mt-8 text-xs text-gray-400'>
        Payment Session ID: <span className='font-mono'>{sessionId}</span>
        </div>
        </div>
    </div>
  )
}

export default PaymentSuccessPage
