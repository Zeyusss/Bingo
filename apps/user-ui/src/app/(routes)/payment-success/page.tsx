'use client'
import React,{useEffect} from 'react';
import {CheckCircle,Truck} from "lucide-react";
import { useSearchParams,useRouter } from 'next/navigation';
import { useStore } from 'apps/user-ui/src/store';
import confetti from "canvas-confetti"



const PaymentSuccessPage = () => {
        const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");
    const router = useRouter();
    
    useEffect(()=>{
        useStore.setState({cart:[]});

        confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6},
        });
    },[]);

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
        onClick={()=> router.push(`/profile?active=My+Orders`)}
        className='bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-500 transition duration-300 shadow-md hover:shadow-lg'
        >
        Track Order
        </button>
        <div className='mt-8 text-xs text-gray-400'>
        Payment Session ID : <span className='font-mono'>{sessionId}</span>
        </div>
        </div>
    </div>
  )
}

export default PaymentSuccessPage
