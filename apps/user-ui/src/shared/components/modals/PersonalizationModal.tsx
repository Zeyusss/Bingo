'use client';

import React from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../../../store';
import { useRouter } from 'next/navigation';

const PersonalizationModal: React.FC = () => {
  const { showPersonalizationModal, closePersonalizationModal, addToCart } = useStore();
  const router = useRouter();

  if (!showPersonalizationModal.show) return null;

  const { type, product } = showPersonalizationModal;

  const handleGoToProductPage = () => {
    closePersonalizationModal();
    router.push(`/product/${product.slug}`);
  };

  const handleAddWithoutPersonalization = () => {
    const cartProduct = {
      ...product,
      quantity: 1,
      price: product.sale_price || product.regular_price,
      image: product.images?.[0]?.url || '/assets/categories/default.jpg',
    };
    addToCart(cartProduct, null, null, null);
    closePersonalizationModal();
  };

  const handleClose = () => {
    closePersonalizationModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Modal Content */}
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-center mb-4">
            {type === 'required' ? (
              <AlertCircle className="text-orange-500 mr-3" size={24} />
            ) : (
              <Info className="text-blue-500 mr-3" size={24} />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {type === 'required' ? 'Personalization Required' : 'Personalization Available'}
            </h2>
          </div>

          {/* Product Info */}
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <img
              src={product?.images?.[0]?.url || '/assets/categories/default.jpg'}
              alt={product?.title}
              className="w-12 h-12 object-cover rounded-md mr-3"
            />
            <div>
              <h3 className="font-medium text-gray-900 text-sm">{product?.title}</h3>
              <p className="text-sm text-gray-600">
                ${product?.sale_price || product?.regular_price}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            {type === 'required' ? (
              <p className="text-gray-700">
                This product requires personalization details before it can be added to your cart. 
                Please visit the product page to add your personalization.
              </p>
            ) : (
              <p className="text-gray-700">
                This product can be personalized with custom details. Would you like to add 
                personalization or continue without it?
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleGoToProductPage}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {type === 'required' ? 'Go to Product Page' : 'Add Personalization'}
            </button>
            
            {type === 'optional' && (
              <button
                onClick={handleAddWithoutPersonalization}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Add to Cart Without Personalization
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationModal;
