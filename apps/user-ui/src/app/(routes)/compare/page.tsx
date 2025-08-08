'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Heart, ShoppingCart, X, Eye, Star, Check, Minus } from 'lucide-react';
import Link from 'next/link';
import { useComparisonStore, ComparisonProduct } from '../../../store/comparisonStore';
import { useStore } from '../../../store';
import useUser from '../../../hooks/useUser';
import useLocationTracking from '../../../hooks/useLocationTracking';
import useDeviceTracking from '../../../hooks/useDeviceTracking';

interface ProductAttribute {
  key: string;
  label: string;
  type: 'text' | 'price' | 'rating' | 'boolean' | 'number';
  getValue: (product: ComparisonProduct) => any;
  highlight?: boolean;
}

const ComparePage: React.FC = () => {
  const { products, removeProduct } = useComparisonStore();
  const { addToCart, addToWishlist } = useStore();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const router = useRouter();
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);


  const allAttributes: ProductAttribute[] = [
    {
      key: 'title',
      label: 'Product Name',
      type: 'text',
      getValue: (product) => product.title,
    },
    {
      key: 'sale_price',
      label: 'Price',
      type: 'price',
      getValue: (product) => product.sale_price,
      highlight: true,
    },
    {
      key: 'regular_price',
      label: 'Regular Price',
      type: 'price',
      getValue: (product) => product.regular_price,
    },
    {
      key: 'ratings',
      label: 'Rating',
      type: 'rating',
      getValue: (product) => product.ratings,
      highlight: true,
    },
    {
      key: 'stock',
      label: 'Stock',
      type: 'number',
      getValue: (product) => product.stock,
      highlight: true,
    },
    {
      key: 'category',
      label: 'Category',
      type: 'text',
      getValue: (product) => product.category,
    },
    {
      key: 'shop',
      label: 'Shop',
      type: 'text',
      getValue: (product) => product.Shop?.name || 'Unknown',
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'text',
      getValue: (product) => product.tags?.join(', ') || 'None',
    },
  ];

  const displayAttributes = useMemo(() => {
    if (selectedAttributes.length === 0) {
      return allAttributes;
    }
    return allAttributes.filter(attr => selectedAttributes.includes(attr.key));
  }, [selectedAttributes]);

  const filteredAttributes = useMemo(() => {
    if (!showDifferencesOnly || products.length < 2) {
      return displayAttributes;
    }

    return displayAttributes.filter(attr => {
      const values = products.map(product => attr.getValue(product));
      return new Set(values).size > 1; 
    });
  }, [displayAttributes, showDifferencesOnly, products]);

  const getBestValue = (attribute: ProductAttribute, products: ComparisonProduct[]) => {
    if (!attribute.highlight) return null;

    const values = products.map(product => attribute.getValue(product)).filter(v => v !== null && v !== undefined);

    if (attribute.type === 'price') {
      return Math.min(...(values as number[]));
    } else if (attribute.type === 'rating' || attribute.type === 'number') {
      return Math.max(...(values as number[]));
    }
    return null;
  };

  const handleAddToCart = (product: ComparisonProduct) => {
    const cartProduct = {
      id: product.id,
      title: product.title,
      price: product.sale_price || product.regular_price,
      image: product.images?.[0]?.url || '/assets/categories/default.jpg',
      quantity: 1,
      shopId: product.Shop?.id || '',
      stock: product.stock || 0
    };
    
    addToCart(cartProduct, user, location, deviceInfo);
  };

  const handleAddToWishlist = (product: ComparisonProduct) => {
    
    const wishlistProduct = {
      ...product, 
      quantity: 1, 
      price: product.sale_price || product.regular_price, 
      image: product.images?.[0]?.url || '/assets/categories/default.jpg', 
      shopId: product.Shop?.id || ''
    };
    addToWishlist(wishlistProduct, user, location, deviceInfo);
  };

  const handleShare = async () => {
    const productIds = products.map(p => p.id).join(',');
    const shareUrl = `${window.location.origin}/compare?products=${productIds}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Product Comparison',
          text: 'Check out this product comparison',
          url: shareUrl
        });
      } catch (error) {
        navigator.clipboard.writeText(shareUrl);
        alert('Comparison link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Comparison link copied to clipboard!');
    }
  };

  const renderAttributeValue = (attribute: ProductAttribute, product: ComparisonProduct) => {
    const value = attribute.getValue(product);
    const bestValue = getBestValue(attribute, products);
    const isBest = bestValue !== null && value === bestValue;

    let displayValue: React.ReactNode = value;

    switch (attribute.type) {
      case 'price':
        displayValue = `$${value}`;
        break;
      case 'rating':
        displayValue = (
          <div className="flex items-center space-x-1">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span>{value}</span>
          </div>
        );
        break;
      case 'boolean':
        displayValue = value ? (
          <Check size={16} className="text-green-500" />
        ) : (
          <Minus size={16} className="text-gray-400" />
        );
        break;
      case 'number':
        displayValue = typeof value === 'number' && value > 0 ? value : 'N/A';
        break;
      default:
        displayValue = value || 'N/A';
    }

    return (
      <div className={`p-3 text-center ${isBest ? 'bg-green-50 border-green-200' : 'bg-gray-50'} border rounded-md`}>
        {isBest && (
          <div className="text-xs text-green-600 font-medium mb-1">Best Value</div>
        )}
        <div className={`${isBest ? 'text-green-700 font-semibold' : 'text-gray-900'}`}>
          {displayValue}
        </div>
      </div>
    );
  };

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Products to Compare</h2>
          <p className="text-gray-600 mb-6">Add some products to your comparison to get started.</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Compare Products ({products.length})
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDifferencesOnly(!showDifferencesOnly)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                  showDifferencesOnly
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Eye size={16} />
                <span>Differences Only</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* attribute */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Compare Attributes:</h3>
            <div className="flex flex-wrap gap-2">
              {allAttributes.map(attr => (
                <button
                  key={attr.key}
                  onClick={() => {
                    if (selectedAttributes.includes(attr.key)) {
                      setSelectedAttributes(prev => prev.filter(key => key !== attr.key));
                    } else {
                      setSelectedAttributes(prev => [...prev, attr.key]);
                    }
                  }}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedAttributes.length === 0 || selectedAttributes.includes(attr.key)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {attr.label}
                </button>
              ))}
              {selectedAttributes.length > 0 && (
                <button
                  onClick={() => setSelectedAttributes([])}
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 border border-gray-300 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Show All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* comparison */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-medium text-gray-900 bg-gray-50">
                    Attribute
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="p-4 bg-gray-50">
                      <div className="text-center">
                        <div className="relative inline-block mb-3">
                          <img
                            src={product.images?.[0]?.url || '/assets/categories/default.jpg'}
                            alt={product.title}
                            className="w-20 h-20 object-cover rounded-lg mx-auto"
                          />
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            <ShoppingCart size={12} className="mr-1" />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(product)}
                            className="flex items-center px-3 py-1 bg-pink-600 text-white text-xs rounded hover:bg-pink-700 transition-colors"
                          >
                            <Heart size={12} className="mr-1" />
                            Wishlist
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAttributes.map((attribute, index) => (
                  <tr key={attribute.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 font-medium text-gray-900 border-r border-gray-200">
                      {attribute.label}
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-4">
                        {renderAttributeValue(attribute, product)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
