import { X, ExternalLink, Calendar, DollarSign, Package, Star, User, Tag, Image as ImageIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

interface ViewProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  if (!isOpen || !product) return null;

  const handleGoToProductPage = () => {
    const productUrl = `${process.env.NEXT_PUBLIC_USE_UI_LINK}/product/${product.id}`;
    window.open(productUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (stock < 10) return { text: `Low Stock (${stock})`, color: 'text-orange-600 bg-orange-50' };
    return { text: `In Stock (${stock})`, color: 'text-green-600 bg-green-50' };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden shadow-2xl'>
        {/* Header */}
        <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <div className='flex items-center space-x-3'>
            <Package className='h-6 w-6 text-blue-600' />
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Product Overview</h3>
              <p className='text-sm text-gray-500'>Complete product information</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className='text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors'
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Product Header */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center"><Tag className="h-4 w-4 mr-1" />{product.category}</span>
                  <span className="flex items-center"><User className="h-4 w-4 mr-1" />{product.Shop?.name || "Unknown Shop"}</span>
                  {product.createdAt && (
                    <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" />Created {formatDate(product.createdAt)}</span>
                  )}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${product.isDeleted ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100"}`}>
                {product.isDeleted ? "Inactive" : "Active"}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sale Price</p>
                  <p className="text-2xl font-bold text-green-600">${product.sale_price}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
              {product.original_price && product.original_price !== product.sale_price && (
                <p className="text-xs text-gray-500 mt-1">Original: ${product.original_price}</p>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Stock Status</p>
                  <p className={`text-lg font-semibold ${stockStatus.color.split(' ')[0]}`}>{product.stock}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <p className={`text-xs px-2 py-1 rounded-full mt-1 ${stockStatus.color}`}>
                {stockStatus.text}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">{product.ratings || "N/A"}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">out of 5.0</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Images</p>
                  <p className="text-2xl font-bold text-purple-600">{product.images?.length || 0}</p>
                </div>
                <ImageIcon className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mt-1">uploaded</p>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="h-5 w-5 mr-2" />Product Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product ID:</span>
                    <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{product.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">{product.weight || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium">{product.dimensions || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {product.tags && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Tag className="h-5 w-5 mr-2" />Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.split(',').map((tag: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || "No description available for this product."}
                  </p>
                </div>
              </div>

              {product.images && product.images.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />Product Images ({product.images.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {product.images.slice(0, 6).map((image: any, index: number) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200 group-hover:shadow-md transition-shadow"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all" />
                      </div>
                    ))}
                    {product.images.length > 6 && (
                      <div className="flex items-center justify-center h-24 bg-gray-200 rounded-lg border border-gray-300">
                        <span className="text-gray-500 text-sm">+{product.images.length - 6} more</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Close
          </Button>
          <Button
            onClick={handleGoToProductPage}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Go to Product Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;
