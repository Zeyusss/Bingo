import { X, AlertTriangle, Trash2, Package } from 'lucide-react';
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
  const [isDeleting, setIsDeleting] = useState(false);
  
  const requiredText = 'DELETE';
  const isConfirmValid = confirmText === requiredText;

  const handleDelete = async () => {
    if (!isConfirmValid) return;
    
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-red-50'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-red-100 rounded-full'>
              <AlertTriangle className='h-5 w-5 text-red-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-red-900'>Delete Product</h3>
              <p className='text-sm text-red-600'>This action cannot be undone</p>
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
                  <p>Price: ${product.sale_price}</p>
                  <p>Stock: {product.stock} units</p>
                  <p className="font-mono text-xs">ID: {product.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 mb-2">Permanent Deletion</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• This product will be <strong>permanently deleted</strong></li>
                  <li>• All product data, images, and history will be lost</li>
                  <li>• Customer orders referencing this product may be affected</li>
                  <li>• This action <strong>cannot be reversed</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-mono bg-gray-100 px-1 rounded text-red-600">{requiredText}</span> to confirm deletion:
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
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
              }`}
              disabled={isDeleting}
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
            disabled={isDeleting}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="px-6 bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? "Deleting..." : "Delete Forever"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
