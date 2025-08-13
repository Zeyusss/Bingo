"use client";

import React, { useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { Range } from "react-range";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  productSearch: string;
  setProductSearch: (value: string) => void;
  tempPriceRange: number[];
  setTempPriceRange: (value: number[]) => void;
  priceRange: number[];
  setPriceRange: (value: number[]) => void;
  setPage: (value: number) => void;
  categorySearch: string;
  setCategorySearch: (value: string) => void;
  filteredCategories: string[];
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  isLoading: boolean;
  colorSearch: string;
  setColorSearch: (value: string) => void;
  filteredColors: any[];
  selectedColors: string[];
  toggleColor: (color: string) => void;
  sizes: string[];
  selectedSizes: string[];
  toggleSize: (size: string) => void;
  selectedStatus: string[];
  toggleStatus: (status: string) => void;
}

const MIN = 0;
const MAX = 1199;

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  productSearch,
  setProductSearch,
  tempPriceRange,
  setTempPriceRange,
  priceRange,
  setPriceRange,
  setPage,
  categorySearch,
  setCategorySearch,
  filteredCategories,
  selectedCategories,
  toggleCategory,
  isLoading,
  colorSearch,
  setColorSearch,
  filteredColors,
  selectedColors,
  toggleColor,
  sizes,
  selectedSizes,
  toggleSize,
  selectedStatus,
  toggleStatus,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    if (typeof document === 'undefined') return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = 'unset';
      
      return () => {};
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3 mb-4">
              Search
            </h3>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search product by name..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm transition placeholder-gray-400"
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3 mb-4">
              Price Range
            </h3>
            <div className="ml-2">
              <Range
                step={1}
                min={MIN}
                max={MAX}
                values={tempPriceRange}
                onChange={(values) => setTempPriceRange(values)}
                renderTrack={({ props, children }) => {
                  const [min, max] = tempPriceRange;
                  const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                  const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                  return (
                    <div
                      {...props}
                      className="h-[6px] bg-blue-200 rounded relative"
                      style={{ ...props.style }}
                    >
                      <div
                        className="absolute h-full bg-blue-600 rounded"
                        style={{
                          left: `${percentageLeft}%`,
                          width: `${percentageRight - percentageLeft}%`,
                        }}
                      />
                      {children}
                    </div>
                  );
                }}
                renderThumb={({ props }) => {
                  const { key, ...rest } = props;
                  return (
                    <div
                      key={key}
                      {...rest}
                      className="w-[16px] h-[16px] bg-blue-600 rounded-full shadow"
                    />
                  );
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                ${tempPriceRange[0]} - ${tempPriceRange[1]}
              </div>
              <button
                onClick={() => {
                  setPriceRange(tempPriceRange);
                  setPage(1);
                }}
                className="text-sm px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3 mb-4">
              Categories
            </h3>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Find a Category"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <span className="text-xs text-gray-600 font-medium">
                  {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'} available
                </span>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading categories...</span>
                    </div>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((category: string) => (
                      <div 
                        key={category} 
                        className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer group" 
                        onClick={() => toggleCategory(category)}
                      >
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="sr-only"
                          />
                          
                          <div className="relative">
                            <div
                              className={`w-7 h-7 rounded-lg border-2 transition-all duration-200 shadow-sm group-hover:scale-105 flex items-center justify-center ${
                                selectedCategories.includes(category)
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-gray-300 bg-gray-100 text-gray-600 group-hover:border-blue-400'
                              }`}
                            >
                              {selectedCategories.includes(category) ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            
                            {selectedCategories.includes(category) && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                            )}
                          </div>
                          
                          <span className={`text-sm font-medium transition-colors duration-200 ${
                            selectedCategories.includes(category) 
                              ? 'text-blue-700' 
                              : 'text-gray-700 group-hover:text-blue-600'
                          }`}>
                            {category}
                          </span>
                        </label>
                        
                        {selectedCategories.includes(category) && (
                          <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Selected
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm">No categories found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3 mb-4">
              Color
            </h3>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Find a Color"
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <span className="text-xs text-gray-600 font-medium">
                  {filteredColors.length} color{filteredColors.length !== 1 ? 's' : ''} available
                </span>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {filteredColors.length > 0 ? (
                    filteredColors.map((color) => (
                      <div key={color.name} className="flex items-center justify-between p-3 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer group" onClick={() => toggleColor(color.name)}>
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={selectedColors.includes(color.name)}
                            onChange={() => toggleColor(color.name)}
                            className="sr-only"
                          />
                          
                          <div className="relative">
                            <div
                              className={`w-7 h-7 rounded-full border-2 transition-all duration-200 shadow-sm group-hover:scale-105 ${
                                selectedColors.includes(color.name)
                                  ? 'border-blue-500 shadow-lg scale-110 ring-2 ring-blue-200'
                                  : 'border-gray-300 group-hover:border-blue-400'
                              }`}
                              style={{ backgroundColor: color.code }}
                            />
                            {selectedColors.includes(color.name) && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col">
                            <span className={`text-sm font-medium transition-colors duration-200 ${
                              selectedColors.includes(color.name) 
                                ? 'text-blue-700' 
                                : 'text-gray-700 group-hover:text-blue-600'
                            }`}>
                              {color.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({color.count} item{color.count !== 1 ? 's' : ''})
                            </span>
                          </div>
                        </label>
                        
                        {selectedColors.includes(color.name) && (
                          <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Selected
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-sm">No colors found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3 mb-4">
              Size
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                    selectedSizes.includes(size)
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3 mb-4">
              Availability
            </h3>
            <div className="space-y-2">
              {['In Stock', 'Out of Stock'].map((status) => (
                <label key={status} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedStatus.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 p-4 space-y-3 bg-white">
          <button
            onClick={() => {
              setProductSearch('');
              selectedCategories.forEach(cat => toggleCategory(cat));
              selectedColors.forEach(color => toggleColor(color));
              selectedSizes.forEach(size => toggleSize(size));
              selectedStatus.forEach(status => toggleStatus(status));
              setPriceRange([0, 1199]);
              setTempPriceRange([0, 1199]);
              setPage(1);
            }}
            className="w-full py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
