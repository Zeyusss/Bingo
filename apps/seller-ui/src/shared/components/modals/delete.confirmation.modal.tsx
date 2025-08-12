import { X, AlertTriangle, Trash2, Package, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';

interface DeleteConfirmationModalProps {
  product: any;
  onClose: () => void;
  onConfirm: () => void;
  onRestore?: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  product,
  onClose,
  onConfirm,
  onRestore
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const requiredText = product?.isDeleted ? 'RESTORE' : 'DELETE';
  const isConfirmValid = confirmText === requiredText;

  const handleAction = async () => {
    if (!isConfirmValid) return;
    
    setIsProcessing(true);
    try {
      if (product?.isDeleted && onRestore) {
        await onRestore();
      } else {
        await onConfirm();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const isRestore = product?.isDeleted;

  return (
    <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b border-gray-200 ${isRestore ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className='flex items-center space-x-3'>
            <div className={`p-2 rounded-full ${isRestore ? 'bg-green-100' : 'bg-red-100'}`}>
              {isRestore ? (
                <RotateCcw className={`h-5 w-5 ${isRestore ? 'text-green-600' : 'text-red-600'}`} />
              ) : (
                <AlertTriangle className={`h-5 w-5 ${isRestore ? 'text-green-600' : 'text-red-600'}`} />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isRestore ? 'text-green-900' : 'text-red-900'}`}>
                {isRestore ? 'Restore Product' : 'Delete Product'}
              </h3>
              <p className={`text-sm ${isRestore ? 'text-green-600' : 'text-red-600'}`}>
                {isRestore ? 'Bring back this product' : 'This action will soft delete the product'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className='text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Product Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-gray-400" />
              <div>
                <h4 className="font-semibold text-gray-900">{product.title}</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Category: {product.category}</p>
                  <p>Price: ${product.sale_price || product.regular_price}</p>
                  <p>Stock: {product.stock} units</p>
                  <p className="font-mono text-xs">ID: {product.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning/Info */}
          <div className={`mb-6 p-4 border rounded-lg ${isRestore ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start space-x-3">
              {isRestore ? (
                <RotateCcw className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h4 className={`font-semibold mb-2 ${isRestore ? 'text-green-900' : 'text-red-900'}`}>
                  {isRestore ? 'Product Restoration' : '24-Hour Deletion Schedule'}
                </h4>
                <ul className={`text-sm space-y-1 ${isRestore ? 'text-green-700' : 'text-red-700'}`}>
                  {isRestore ? (
                    <>
                      <li>• This product will be <strong>restored</strong> and made active again</li>
                      <li>• It will become visible to customers immediately</li>
                      <li>• All product data and images will be preserved</li>
                      <li>• You can delete it again later if needed</li>
                    </>
                  ) : (
                    <>
                      <li>• This product will be <strong>scheduled for deletion in 24 hours</strong></li>
                      <li>• It will be hidden from customers immediately</li>
                      <li>• You can restore it within 24 hours before permanent deletion</li>
                      <li>• After 24 hours, the product will be permanently deleted</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className={`font-mono px-1 rounded ${isRestore ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {requiredText}
              </span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${requiredText}" here`}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                confirmText && !isConfirmValid 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : isConfirmValid
                  ? `border-${isRestore ? 'green' : 'green'}-300 focus:border-${isRestore ? 'green' : 'green'}-500 focus:ring-${isRestore ? 'green' : 'green'}-200`
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              disabled={isProcessing}
            />
            {confirmText && !isConfirmValid && (
              <p className="text-red-500 text-xs mt-1">Please type "{requiredText}" exactly as shown</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={!isConfirmValid || isProcessing}
            className={`px-6 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRestore 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isRestore ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>
              {isProcessing 
                ? (isRestore ? "Restoring..." : "Deleting...") 
                : (isRestore ? "Restore Product" : "Delete Product")
              }
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
