"use client";

import React, { useEffect, useRef } from 'react';
import { X, Search, MapPin, Star } from 'lucide-react';
import { Range } from "react-range";

interface ShopFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  shopSearch: string;
  setShopSearch: (value: string) => void;
  selectedCategories: string[];
  toggleCategory: (category: string) => void;
  selectedCountries: string[];
  toggleCountry: (country: string) => void;
  categories: any[];
  countries: string[];
  minRating: number;
  setMinRating: (value: number) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  setPage: (value: number) => void;
}

const ShopFilterSidebar: React.FC<ShopFilterSidebarProps> = ({
  isOpen,
  onClose,
  shopSearch,
  setShopSearch,
  selectedCategories,
  toggleCategory,
  selectedCountries,
  toggleCountry,
  categories,
  countries,
  minRating,
  setMinRating,
  sortBy,
  setSortBy,
  setPage,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; 
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);


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

  const clearAllFilters = () => {
    setShopSearch('');
    selectedCategories.forEach(cat => toggleCategory(cat));
    selectedCountries.forEach(country => toggleCountry(country));
    setMinRating(0);
    setSortBy('newest');
    setPage(1);
  };

  const activeFiltersCount = selectedCategories.length + selectedCountries.length + (minRating > 0 ? 1 : 0);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300" />
      )}

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Shop Filters</h2>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Shops
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by shop name..."
                  value={shopSearch}
                  onChange={(e) => {
                    setShopSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="rating_high">Highest Rated</option>
                <option value="rating_low">Lowest Rated</option>
                <option value="followers_high">Most Followers</option>
                <option value="followers_low">Least Followers</option>
              </select>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">Categories</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <label
                    key={category.value}
                    className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => {
                        toggleCategory(category.value);
                        setPage(1);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex-1">{category.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {countries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Locations
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {countries.map((country) => (
                    <label
                      key={country}
                      className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country)}
                        onChange={() => {
                          toggleCountry(country);
                          setPage(1);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex-1">{country}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Minimum Rating
              </h3>
              <div className="space-y-2">
                <Range
                  step={0.5}
                  min={0}
                  max={5}
                  values={[minRating]}
                  onChange={(values) => {
                    setMinRating(values[0]);
                    setPage(1);
                  }}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-2 w-full bg-gray-200 rounded-full"
                      style={{
                        ...props.style,
                      }}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props }) => (
                    <div
                      {...props}
                      className="h-4 w-4 bg-blue-600 rounded-full shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        ...props.style,
                      }}
                    />
                  )}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 stars</span>
                  <span className="font-medium text-blue-600">
                    {minRating} stars & up
                  </span>
                  <span>5 stars</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 p-4 space-y-3">
            <button
              onClick={clearAllFilters}
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
      </div>
    </>
  );
};

export default ShopFilterSidebar;
