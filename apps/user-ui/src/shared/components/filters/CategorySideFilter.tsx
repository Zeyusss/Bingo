"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

interface CategorySideFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  title?: string;
  showSearch?: boolean;
  maxVisible?: number;
  className?: string;
}

const CategorySideFilter: React.FC<CategorySideFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  title = "Categories",
  showSearch = true,
  maxVisible = 6,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  
  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const visibleCategories = isExpanded 
    ? filteredCategories 
    : filteredCategories.slice(0, maxVisible);

  const hasMoreCategories = filteredCategories.length > maxVisible;

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsExpanded(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
    setIsExpanded(false);
    setSearchTerm("");
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">{title}:</span>
          <span className="text-sm text-gray-900 font-semibold">
            {selectedCategory === "All" ? "All Categories" : selectedCategory}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {showSearch && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          )}


          <div className="max-h-64 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No categories found
              </div>
            ) : (
              <>
                {visibleCategories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-l-blue-500"
                          : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category === "All" ? "All Categories" : category}</span>
                        {isActive && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {hasMoreCategories && !searchTerm && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-4 py-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150 border-t border-gray-100 font-medium flex items-center justify-center space-x-1"
                  >
                    <span>
                      {isExpanded 
                        ? `Show Less` 
                        : `Show ${filteredCategories.length - maxVisible} More`
                      }
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </>
            )}
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} available
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySideFilter;
