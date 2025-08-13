import { X, Save, Package, DollarSign, FileText, Hash, Layers, AlertCircle, ChevronDown } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface EditProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  editFormData: {
    title: string;
    detailed_description: string;
    regular_price: string;
    sale_price: string;
    category: string;
    stock: string;
    tags: string;
  };
  setEditFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    detailed_description: string;
    regular_price: string;
    sale_price: string;
    category: string;
    stock: string;
    tags: string;
  }>>;
  onSave: () => void;
  isSaving: boolean;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  editFormData,
  setEditFormData,
  onSave,
  isSaving
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);

 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:6002/api/get-categories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
  
        const safeCategories = Array.isArray(data.categories) ? data.categories : [];
        const safeSubCategories = Array.isArray(data.subCategories) ? data.subCategories : [];
        
        setCategories(safeCategories);
        setSubCategories(safeSubCategories);
        setAvailableSubCategories(safeSubCategories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);

        setCategories([]);
        setSubCategories([]);
        setAvailableSubCategories([]);
      }
    };
    
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

 
  useEffect(() => {
    if (editFormData.category && subCategories) {
    
      if (typeof subCategories === 'object' && !Array.isArray(subCategories)) {
        const categorySubcategories = subCategories[editFormData.category];
        if (Array.isArray(categorySubcategories)) {
          setAvailableSubCategories(categorySubcategories);
        } else {
          setAvailableSubCategories([]);
        }
      } else if (Array.isArray(subCategories)) {
   
        const filtered = subCategories.filter(sub => 
          sub && typeof sub === 'string' && (
            sub.toLowerCase().includes(editFormData.category.toLowerCase()) ||
            editFormData.category.toLowerCase().includes(sub.toLowerCase())
          )
        );
        setAvailableSubCategories(filtered.length > 0 ? filtered : subCategories);
      } else {
        setAvailableSubCategories([]);
      }
    } else {
      setAvailableSubCategories([]);
    }
  }, [editFormData.category, subCategories]);

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
    
    if (editFormData.sale_price && editFormData.regular_price && 
        parseFloat(editFormData.sale_price) > parseFloat(editFormData.regular_price)) {
      newErrors.sale_price = 'Sale price must be less than or equal to regular price';
    }
    

    if (editFormData.stock && parseInt(editFormData.stock) < 0) {
      newErrors.stock = 'Stock quantity cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    console.log('EditProductModal handleSave called with form data:', editFormData); 
    if (validateForm()) {
      console.log('Form validation passed, calling onSave'); 
      onSave();
    } else {
      console.log('Form validation failed, errors:', errors); 
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
      <div className='bg-white rounded-xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-hidden shadow-2xl'>
        {/* Header */}
        <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50'>
          <div className='flex items-center space-x-3'>
            <Package className='h-6 w-6 text-blue-600' />
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>Edit Product</h3>
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
                          setEditFormData((prev: any) => ({ ...prev, category: e.target.value }))
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
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />Description
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={6}
                    value={editFormData.detailed_description}
                    onChange={(e) =>
                      setEditFormData((prev: any) => ({ ...prev, detailed_description: e.target.value }))
                    }
                    placeholder="Detailed product description..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editFormData.detailed_description.length} characters
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing & Inventory */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />Pricing
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Regular Price * ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
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
                      Sale Price * ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
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
                    <p className="text-xs text-gray-500 mt-1">Current selling price</p>
                  </div>
                  
                  {editFormData.regular_price && editFormData.sale_price && parseFloat(editFormData.sale_price) < parseFloat(editFormData.regular_price) && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-700">
                        Discount: {Math.round((1 - parseFloat(editFormData.sale_price) / parseFloat(editFormData.regular_price)) * 100)}% off
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Layers className="h-5 w-5 mr-2" />Inventory
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <Input
                    type="number"
                    min="0"
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
                  
                  {editFormData.stock && (
                    <div className={`mt-2 p-2 rounded-md ${
                      parseInt(editFormData.stock) === 0 
                        ? 'bg-red-50 text-red-700'
                        : parseInt(editFormData.stock) < 10 
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                      <p className="text-xs font-medium">
                        {parseInt(editFormData.stock) === 0 
                          ? 'Out of Stock'
                          : parseInt(editFormData.stock) < 10 
                          ? 'Low Stock Warning'
                          : 'In Stock'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product ID Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Hash className="h-5 w-5 mr-2" />Product Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product ID:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">{product?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shop:</span>
                    <span className="font-medium">{product?.Shop?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {hasChanges ? (
              <span className="flex items-center text-orange-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                You have unsaved changes
              </span>
            ) : (
              <span>No changes made</span>
            )}
          </div>
          <div className="flex space-x-3">
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
              disabled={isSaving || !hasChanges}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
