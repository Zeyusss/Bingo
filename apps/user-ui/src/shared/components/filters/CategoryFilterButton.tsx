"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter, X, Search, ChevronDown, ChevronUp } from "lucide-react";

interface CategoryFilterButtonProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  title?: string;
  className?: string;
}

const CategoryFilterButton: React.FC<CategoryFilterButtonProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  title = "Filter by Category",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  
  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const visibleCategories = showAll ? filteredCategories : filteredCategories.slice(0, 8);
  const hasMoreCategories = filteredCategories.length > 8;

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        setShowAll(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category);
    setIsOpen(false);
    setSearchTerm("");
    setShowAll(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
      >
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {selectedCategory === "All" ? title : selectedCategory}
        </span>
        {selectedCategory !== "All" && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="w-full max-w-lg bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out animate-slide-up max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96">
              {filteredCategories.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm">No categories found</p>
                </div>
              ) : (
                <>
                  <div className="p-2">
                    {visibleCategories.map((category) => {
                      const isActive = selectedCategory === category;
                      return (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-150 mb-1 ${
                            isActive
                              ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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
                  </div>

                  {hasMoreCategories && !searchTerm && (
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full px-4 py-3 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-150 font-medium flex items-center justify-center space-x-2"
                      >
                        <span>
                          {showAll 
                            ? "Show Less" 
                            : `Show ${filteredCategories.length - 8} More Categories`
                          }
                        </span>
                        {showAll ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="text-xs text-gray-500 text-center">
                {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'} available
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default CategoryFilterButton;
