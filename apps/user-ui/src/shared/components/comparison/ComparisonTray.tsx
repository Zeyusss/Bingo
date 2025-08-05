'use client';

import React from 'react';
import { X, Eye, ShoppingCart, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useComparisonStore } from '../../../store/comparisonStore';
import { useStore } from '../../../store';

interface ComparisonTrayProps {
  className?: string;
}

const ComparisonTray: React.FC<ComparisonTrayProps> = ({ className = "" }) => {
  const { products, removeProduct } = useComparisonStore();
  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const router = useRouter();

  if (products.length === 0) return null;

  const handleCompare = () => {
    router.push('/compare');
  };

  const handleAddAllToCart = () => {
    products.forEach((product) => addToCart(product));
  };

  const handleAddAllToWishlist = () => {
    products.forEach((product) => addToWishlist(product));
  };

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Eye size={16} />
            <span className="text-sm font-medium">Compare ({products.length})</span>
          </div>
        </div>
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {products.map((product) => (
            <div key={product.id} className="relative group flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="relative flex-shrink-0">
                <img
                  src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                  alt={product.title}
                  className="w-12 h-12 object-cover rounded border"
                />
                <button
                  onClick={() => removeProduct(product.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate" title={product.title}>
                  {product.title}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-semibold text-blue-600">
                    ${product.sale_price?.toFixed(2) || product.regular_price?.toFixed(2)}
                  </span>
                  {product.sale_price && product.sale_price < product.regular_price && (
                    <span className="text-xs text-gray-500 line-through">
                      ${product.regular_price?.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.Shop?.name && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    by {product.Shop.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <button
            onClick={handleCompare}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Eye size={16} />
            <span>Compare Now</span>
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handleAddAllToCart}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
              title="Add all to cart"
            >
              <ShoppingCart size={14} />
              <span>Add All</span>
            </button>
            <button
              onClick={handleAddAllToWishlist}
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
              title="Add all to wishlist"
            >
              <Heart size={14} />
              <span>Save All</span>
            </button>
          </div>
        </div>

        {products.length >= 4 && (
          <p className="text-xs text-amber-600 mt-2 text-center">
            Maximum 4 products can be compared
          </p>
        )}
      </div>
    </div>
  );
};

export default ComparisonTray;
