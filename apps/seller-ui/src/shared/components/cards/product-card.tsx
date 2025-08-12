import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Eye } from 'lucide-react';
import Link from 'next/link';

const ProductCard = ({ product, isEvent }: { product: any; isEvent?: boolean }) => {
  const [timeleft, setTimeLeft] = useState('');
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  React.useEffect(() => {
    if (isEvent && product?.ending_date) {
      const interval = setInterval(() => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft('Expired');
          clearInterval(interval);
          return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h left`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m left`);
        } else {
          setTimeLeft(`${minutes}m left`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
    return () => {};
  }, [isEvent, product?.ending_date]);

  return (
    <div className="w-full min-h-[350px] bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group border border-gray-700 hover:border-blue-500">
      {isEvent && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-400  text-xs font-bold py-1 px-3 rounded-full shadow-lg z-20">
          OFFER
        </div>
      )}
      
      {product?.stock <= 5 && product?.stock > 0 && (
        <div className="absolute top-3 right-3 bg-yellow-500 text-gray-900 text-xs font-bold py-1 px-3 rounded-full shadow z-20">
          Limited Stock
        </div>
      )}
      
      {product?.stock === 0 && (
        <div className="absolute top-3 right-3 bg-red-500 text-xs font-bold py-1 px-3 rounded-full shadow z-20">
          Out of Stock
        </div>
      )}

      <Link href={`/product/${product?.slug}`} className="block group">
        <div className="relative w-full h-[200px] bg-gray-700 border-b border-gray-600">
          <Image
            src={
              product?.images?.[0]?.url ||
              "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"
            }
            alt={product?.title || "Product Image"}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-2">
        <Link href={`/shop/${product?.Shop?.name}`} className="block">
          <span className="text-blue-400 text-xs font-semibold hover:underline">
            {product?.Shop?.name || "Unknown Shop"}
          </span>
        </Link>

        <Link href={`/product/${product?.slug}`}>
          <h3 className="font-bold text-base line-clamp-2 hover:text-blue-400 transition">
            {product?.title || "Untitled Product"}
          </h3>
        </Link>

        <div className="flex items-center">
          <div className="flex items-center text-yellow-400 gap-1">
            <Star fill="#facc15" size={16} />
            <span className="text-sm">{product?.ratings || "N/A"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          {product?.sale_price && (
            <span className="text-green-400 font-bold text-lg">
              {formatPrice(product.sale_price)}
            </span>
          )}
          {product?.regular_price && 
           product.regular_price > product.sale_price && (
            <span className="text-gray-400 line-through text-sm">
              {formatPrice(product.regular_price)}
            </span>
          )}
          {!product?.sale_price && product?.regular_price && (
            <span className="font-bold text-lg">
              {formatPrice(product.regular_price)}
            </span>
          )}
        </div>
      </div>

      {isEvent && timeleft && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 bg-orange-500  px-3 py-1 rounded-full text-xs font-medium shadow z-20">
          {timeleft}
        </div>
      )}
      
      <div className="absolute z-10 flex flex-col gap-2 right-3 top-3 items-end">
        <Link href={`/product/${product?.slug}`}>
          <button 
            className="bg-gray-800 rounded-full p-2 shadow-md hover:bg-blue-600 transition group border border-gray-600"
            title="View Product"
            aria-label="View Product"
          >
            <Eye 
              size={18}
              className="cursor-pointer text-gray-300 group-hover:text-white transition"
            />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
