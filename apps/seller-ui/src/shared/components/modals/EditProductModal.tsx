import { X, Save, Package, DollarSign, FileText, AlertCircle, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface EditProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  isSaving: boolean;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  isSaving
}) => {
  const [editFormData, setEditFormData] = useState({
    title: '',
    detailed_description: '',
    regular_price: '',
    sale_price: '',
    category: '',
    subCategory: '',
    stock: '',
    tags: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use the same endpoint as the all products page
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/product/api/get-seller-categories`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    };
    
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && product) {
      const original = {
        title: product.title || '',
        detailed_description: product.detailed_description || product.short_description || '',
        regular_price: product.regular_price ? product.regular_price.toString() : '',
        sale_price: product.sale_price ? product.sale_price.toString() : '',
        category: product.category || '',
        subCategory: product.subCategory || product.subcategory || '', 
        stock: product.stock ? product.stock.toString() : '0',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : (typeof product.tags === 'string' ? product.tags : '')
      };
      
      setOriginalData(original);
      setEditFormData(original);
      setHasChanges(false);
      setErrors({});
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (originalData) {
      const changed = Object.keys(editFormData).some(
        key => editFormData[key as keyof typeof editFormData] !== originalData[key]
      );
      setHasChanges(changed);
    }
  }, [editFormData, originalData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!editFormData.title.trim()) {
      newErrors.title = 'Product title is required';
    }
    
    if (editFormData.regular_price && parseFloat(editFormData.regular_price) <= 0) {
      newErrors.regular_price = 'Regular price must be greater than 0';
    }
    
    if (editFormData.sale_price && parseFloat(editFormData.sale_price) <= 0) {
      newErrors.sale_price = 'Sale price must be greater than 0';
    }
    
    if (editFormData.stock && parseInt(editFormData.stock) < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(editFormData);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl max-w-4xl w-full mx-4 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col'>
        {/* Header */}
        <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 rounded-full bg-blue-100'>
              <Package className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <h3 className='text-lg font-semibold text-gray-900'>Edit Product</h3>
              <p className='text-sm text-gray-500'>Update product information and settings</p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            {hasChanges && (
              <span className='text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium'>
                Unsaved changes
              </span>
            )}
            <button 
              onClick={handleClose} 
              className='text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />Basic Information
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <Input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Enter product title"
                      className={errors.title ? 'border-red-300 focus:border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />{errors.title}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <div className="relative">
                      <select
                        value={editFormData.category}
                        onChange={(e) =>
                          setEditFormData((prev: any) => ({ ...prev, category: e.target.value, subCategory: '' }))
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white ${
                          errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {Array.isArray(categories) && categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />{errors.category}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editFormData.detailed_description}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({ ...prev, detailed_description: e.target.value }))
                      }
                      placeholder="Enter product description"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing & Inventory */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />Pricing & Inventory
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Regular Price *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editFormData.regular_price}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({ ...prev, regular_price: e.target.value }))
                      }
                      placeholder="0.00"
                      className={errors.regular_price ? 'border-red-300 focus:border-red-500' : ''}
                    />
                    {errors.regular_price && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />{errors.regular_price}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Price
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editFormData.sale_price}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({ ...prev, sale_price: e.target.value }))
                      }
                      placeholder="0.00"
                      className={errors.sale_price ? 'border-red-300 focus:border-red-500' : ''}
                    />
                    {errors.sale_price && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />{errors.sale_price}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Optional - Leave empty if no sale price</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <Input
                      type="number"
                      value={editFormData.stock}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({ ...prev, stock: e.target.value }))
                      }
                      placeholder="0"
                      className={errors.stock ? 'border-red-300 focus:border-red-500' : ''}
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />{errors.stock}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <Input
                      type="text"
                      value={editFormData.tags}
                      onChange={(e) =>
                        setEditFormData((prev: any) => ({ ...prev, tags: e.target.value }))
                      }
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="px-6 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>
              {isSaving ? "Saving..." : "Save Changes"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditProductModal;
