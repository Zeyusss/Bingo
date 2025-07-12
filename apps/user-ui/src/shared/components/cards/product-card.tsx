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
            
        } else {
            setTimeLeft("");
        }
    }, [isEvent, product?.ending_date]);

  return (
    <div className="w-full min-h-[390px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group border border-gray-100 hover:border-blue-200">
      {/* Badges */}
      {isEvent && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-400 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg animate-pulse z-20">
          OFFER
        </div>
      )}
      {product?.stock <= 5 && (
        <div className="absolute top-3 right-3 bg-yellow-300 text-gray-800 text-xs font-bold py-1 px-3 rounded-full shadow z-20">
          Limited Stock
        </div>
      )}

      {/* Image */}
      <Link href={`/product/${product?.slug}`} className="block group">
        <img
          src={
            product?.images?.[0]?.url ||
            'https://images.unsplash.com/photo-1610513320995-1ad4bbf25e55?q=80&w=1470&auto=format&fit=crop'
          }
          alt={product?.title}
          width={300}
          height={300}
          className="w-full h-[210px] object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300 bg-gray-50 border-b border-gray-100"
          loading="lazy"
        />
      </Link>

      <div className="p-4 flex flex-col gap-2">
        {/* Shop name */}
        <Link
          href={`/shop/${product?.Shop?.id}`}
          className="block text-blue-700 text-xs font-semibold hover:underline mb-1"
        >
          {product?.Shop?.name}
        </Link>

        {/* Title */}
        <Link href={`/product/${product?.slug}`}>
          <h3 className="text-gray-900 font-bold text-base line-clamp-2 hover:text-blue-600 transition">
            {product?.title}
          </h3>
        </Link>

        {/* Ratings */}
        <div className='mt-1'>
          <Ratings rating={typeof product?.ratings === 'number' ? product.ratings : 5} />
        </div>

        {/* Price */}
        <div className='flex items-center gap-2 mt-2'>
          {product?.sale_price && (
            <span className="text-green-600 font-bold text-lg">
              ${product.sale_price}
            </span>
          )}
          {product?.regular_price && product.regular_price > product.sale_price && (
            <span className="text-gray-400 line-through text-sm ml-1">
              ${product.regular_price}
            </span>
          )}
        </div>
      </div>

      {/* Event Timer */}
      {isEvent && timeleft && (
        <div className='absolute left-1/2 -translate-x-1/2 bottom-20 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium shadow z-20'>
          {timeleft}
        </div>
      )}

      {/* Action Icons */}
      <div className='absolute z-10 flex flex-col gap-3 right-4 top-4 items-end'>
        <button
          className='bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition group'
          title="Add to Wishlist"
          aria-label="Add to Wishlist"
        >
          <Heart className='cursor-pointer group-hover:scale-110 transition text-gray-400 group-hover:text-red-500' size={22} />
        </button>
        <button
          className='bg-white rounded-full p-2 shadow-md hover:bg-blue-50 transition group'
          title="Quick View"
          aria-label="Quick View"
          onClick={() => setOpen(!open)}
        >
          <Eye className='cursor-pointer text-[#4b5563] group-hover:text-blue-600 group-hover:scale-110 transition' size={22} />
        </button>
        <button
          className='bg-white rounded-full p-2 shadow-md hover:bg-green-50 transition group'
          title="Add to Cart"
          aria-label="Add to Cart"
        >
          <ShoppingBag size={21} className='cursor-pointer text-[#4b5563] group-hover:text-green-600 group-hover:scale-110 transition' />
        </button>
      </div>

      {/* Product Details Modal */}
      {open && (
        <ProductDetailsCard data={product} setOpen={setOpen} />
      )}
    </div>
  );
};

export default ProductCard;
