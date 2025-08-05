'use client';

import React, { useState, useEffect } from 'react';
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';

interface FilterOption {
  name: string;
  value: string;
  count?: number;
}

interface Brand {
  id: string;
  name: string;
  productCount: number;
}

interface Tag {
  name: string;
  count: number;
}

interface PriceRange {
  min: number;
  max: number;
  average: number;
}

interface SortOption {
  value: string;
  label: string;
}

interface FilterData {
  categories: FilterOption[];
  brands: Brand[];
  priceRange: PriceRange;
  tags: Tag[];
  sortOptions: SortOption[];
}

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
  onApplyFilters: () => void;
}

const SearchFiltersModal: React.FC<SearchFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters
}) => {
  const [filterData, setFilterData] = useState<FilterData>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 1000, average: 50 },
    tags: [],
    sortOptions: []
  });
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    tags: false,
    sort: true
  });
  useEffect(() => {
    if (isOpen) {
      loadFilterData();
    }
  }, [isOpen]);

  const loadFilterData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/product/api/search-filters');
      setFilterData(response.data.filters);
    } catch (error) {
      console.error('Failed to load filter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    
    handleFilterChange('tags', newTags);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: '',
      minPrice: '',
      maxPrice: '',
      tags: [],
      inStock: true,
      sortBy: 'relevance'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category && filters.category !== 'All') count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (!filters.inStock) count++;
    if (filters.sortBy && filters.sortBy !== 'relevance') count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <button
                    onClick={() => toggleSection('sort')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-medium text-gray-900">Sort By</h3>
                    {expandedSections.sort ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.sort && (
                    <div className="space-y-2">
                      {filterData.sortOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="sortBy"
                            value={option.value}
                            checked={filters.sortBy === option.value}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => toggleSection('category')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-medium text-gray-900">Category</h3>
                    {expandedSections.category ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.category && (
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          checked={!filters.category || filters.category === 'All'}
                          onChange={() => handleFilterChange('category', '')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">All Categories</span>
                      </label>
                      {filterData.categories.map((category) => (
                        <label key={category.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="category"
                            value={category.value}
                            checked={filters.category === category.value}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {category.name}
                            {category.count && (
                              <span className="text-gray-500 ml-1">({category.count})</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
                    {expandedSections.price ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.price && (
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                          <input
                            type="number"
                            placeholder={filterData.priceRange.max.toString()}
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="px-1">
                        <input
                          type="range"
                          min={filterData.priceRange.min}
                          max={filterData.priceRange.max}
                          value={filters.maxPrice || filterData.priceRange.max}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>${filterData.priceRange.min}</span>
                          <span>${filterData.priceRange.max}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => toggleSection('tags')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-sm font-medium text-gray-900">Tags</h3>
                    {expandedSections.tags ? (
                      <ChevronUp size={16} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.tags && (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {filterData.tags.slice(0, 15).map((tag) => (
                        <label key={tag.name} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={(filters.tags || []).includes(tag.name)}
                            onChange={() => handleTagToggle(tag.name)}
                            className="text-blue-600 focus:ring-blue-500 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {tag.name}
                            <span className="text-gray-500 ml-1">({tag.count})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">Availability</h3>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>
              </>
            )}
          </div>
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="flex space-x-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  onApplyFilters();
                  onClose();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFiltersModal;
