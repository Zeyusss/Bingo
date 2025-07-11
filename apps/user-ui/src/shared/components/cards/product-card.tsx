import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Eye, Heart, ShoppingBag } from 'lucide-react';
import Ratings from '../ratings';
import ProductDetailsCard from './product-details';


const ProductCard = ({ product, isEvent }: { product: any; isEvent?: boolean }) => {
    
    const [timeleft,setTimeLeft] = useState("");
    const [open,setOpen] = useState(false);



    useEffect(() => {
        if (isEvent && product?.ending_date) {
            const interval = setInterval(() => {
                const endTime = new Date(product.ending_date).getTime();
                const now = Date.now();
                const diff = endTime - now;

                if (diff <= 0) {
                    setTimeLeft("Expired");
                    clearInterval(interval);
                    return;
                }
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                setTimeLeft(`${days}d ${hours}h ${minutes}m left with this price.`);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setTimeLeft("");
        }
    }, [isEvent, product?.ending_date]);

  return (
    <div className="w-full min-h-[370px] bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {/* Badges */}
      {isEvent && (
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded shadow">
          OFFER
        </div>
      )}
      {product?.stock <= 5 && (
        <div className="absolute top-3 right-3 bg-yellow-300 text-gray-800 text-xs font-bold py-1 px-2 rounded shadow">
          Limited Stock
        </div>
      )}

      {/* Image */}
      <Link href={`/product/${product?.slug}`}>
        <img
          src={
            product?.images?.[0]?.url ||
            'https://images.unsplash.com/photo-1610513320995-1ad4bbf25e55?q=80&w=1470&auto=format&fit=crop'
          }
          alt={product?.title}
          width={300}
          height={300}
          className="w-full h-[200px] object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-3 space-y-1">
        {/* Shop name */}
        <Link
          href={`/shop/${product?.Shop?.id}`}
          className="block text-blue-600 text-sm font-semibold hover:underline"
        >
          {product?.Shop?.name}
        </Link>

        {/* Title */}
        <Link href={`/product/${product?.slug}`}>
          <h3 className="text-gray-900 font-semibold text-base line-clamp-2 hover:text-blue-600 transition">
            {product?.title}
          </h3>
        </Link>

        <div className='mt-2 px-2'>
        <Ratings rating={typeof product?.ratings === 'number' ? product.ratings : 5}/>
        </div>

        

<div className='mt-3 flex justify-between items-center px-2'>
        {product?.sale_price && (
          <div className="mt-1">
            <span className="text-green-600 font-bold text-lg">
              ${product.sale_price}
            </span>
            {product?.regular_price && product.regular_price > product.sale_price && (
              <span className="text-gray-400 line-through text-xs ml-2">
                ${product.regular_price}
              </span>
            )}
            
          </div>
        )}
</div>
      </div>
      {isEvent && timeleft &&(
        <div className='mt-2'>
            <span className='inline-block text-xs bg-orange-100'>
                {timeleft}
            </span>
        </div>
      )}
      <div className='absolute z-10 flex flex-col gap-3 right-3 top-10'>
        <div className='bg-white rounded-full p-[6px] shadow-md'>
        <Heart className='cursor-pointer hover:scale-110 transition'
        size={23}
        fill={"red"}
        stroke='red'
        />
        </div>
        <div className='bg-white rounded-full p-[6px] shadow-md'>
        <Eye className='cursor-pointer text-[#4b5563] hover:scale-110 transition'
        size={23}
        onClick={()=> setOpen(!open)}
        />
        </div>
        <div className='bg-white rounded-full p-[6px] shadow-md' >
        <ShoppingBag
        size={22}
        className='cursor-pointer text-[#4b5563] hover:scale-110 transition'
        />
        </div>
      </div>
      {open && (
        <ProductDetailsCard data={product} setOpen={setOpen} />
      )}
    </div>
  );
};

export default ProductCard;
