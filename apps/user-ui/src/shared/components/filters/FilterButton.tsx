"use client";

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface FilterButtonProps {
  onClick: () => void;
  activeFiltersCount?: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick, activeFiltersCount = 0 }) => {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
    >
      <SlidersHorizontal className="w-4 h-4" />
      <span>Filters</span>
      
      {activeFiltersCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
          {activeFiltersCount > 99 ? '99+' : activeFiltersCount}
        </div>
      )}
    </button>
  );
};

export default FilterButton;