'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, List, Filter } from 'lucide-react';
import AdvancedSearchBar from '../../../shared/components/search/AdvancedSearchBar';
import SearchFiltersModal from '../../../shared/components/search/SearchFiltersModal';
import ProductCard from '../../../shared/components/cards/product-card';
import axiosInstance from '../../../utils/axiosInstance';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  sale_price: number;
  regular_price: number;
  images: { url: string }[];
  Shop: {
    id: string;
    name: string;
    avatar: string;
  };
  ratings: number;
  stock: number;
  category: string;
  tags: string[];
}

interface SearchResponse {
  success: boolean;
  products: SearchResult[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: any;
}

interface SearchFilters {
  categories: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  tags: string[];
  inStock: boolean;
  sortBy: string;
}

const SearchPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: searchParams.get('categories') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    inStock: searchParams.get('inStock') !== 'false',
    sortBy: searchParams.get('sortBy') || 'relevance'
  });

  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    if (query || Object.values(filters).some(v => v && v !== 'relevance' && (Array.isArray(v) ? v.length > 0 : true))) {
      performSearch();
    }
  }, [query, currentPage, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '' && value !== 'relevance') {
          if (Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(','));
          } else if (typeof value === 'boolean') {
            params.set(key, value.toString());
          } else {
            params.set(key, value.toString());
          }
        }
      });

      const response = await axiosInstance.get(`/product/api/search-advanced?${params.toString()}`);
      const data: SearchResponse = response.data;

      if (data.success) {
        setResults(data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalResults: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string, searchFilters?: any) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    params.set('page', '1');

    const finalFilters = searchFilters || filters;
    Object.entries(finalFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'relevance') {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (typeof value === 'boolean') {
          params.set(key, value.toString());
        } else {
          params.set(key, value.toString());
        }
      }
    });

    router.push(`/search?${params.toString()}`);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    handleSearch(query, filters);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/search?${params.toString()}`);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...filters, sortBy };
    setFilters(newFilters);
    handleSearch(query, newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <AdvancedSearchBar
            placeholder="Search for handmade products..."
            onSearch={handleSearch}
            className="max-w-4xl"
          />
        </div>

        {/* Search Results Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {query ? `Search Results for "${query}"` : 'Browse Products'}
              </h1>
              <p className="text-gray-600">
                {loading ? 'Searching...' : `${pagination.totalResults} products found`}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                >
                  <List size={20} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Filter size={20} />
                <span>Filters</span>
                {Object.values(filters).some(v => v && v !== 'relevance' && (Array.isArray(v) ? v.length > 0 : v !== true)) && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {Object.entries(filters).some(([key, value]) => 
            value && value !== '' && value !== 'relevance' && 
            (Array.isArray(value) ? value.length > 0 : (key !== 'inStock' || !value))
          ) && (
            <div className="flex flex-wrap gap-2">
              {filters.categories && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Category: {filters.categories}
                  <button
                    onClick={() => handleFiltersChange({ ...filters, categories: '' })}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.brand && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Brand: {filters.brand}
                  <button
                    onClick={() => handleFiltersChange({ ...filters, brand: '' })}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Price: ${filters.minPrice || '0'} - ${filters.maxPrice || '∞'}
                  <button
                    onClick={() => handleFiltersChange({ ...filters, minPrice: '', maxPrice: '' })}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.tags.length > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Tags: {filters.tags.join(', ')}
                  <button
                    onClick={() => handleFiltersChange({ ...filters, tags: [] })}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-gray-600">Searching products...</span>
            </div>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  view={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-md ${
                            page === pagination.currentPage
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {query 
                ? `No products match your search for "${query}". Try adjusting your filters or search terms.`
                : 'No products match your current filters. Try adjusting your criteria.'
              }
            </p>
            <button
              onClick={() => {
                setFilters({
                  categories: '',
                  brand: '',
                  minPrice: '',
                  maxPrice: '',
                  tags: [],
                  inStock: true,
                  sortBy: 'relevance'
                });
                router.push('/search');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <SearchFiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default SearchPage;
