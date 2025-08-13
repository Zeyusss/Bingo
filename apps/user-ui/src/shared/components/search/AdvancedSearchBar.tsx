"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Mic, X, Clock, TrendingUp, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import axiosInstance from "../../../utils/axiosInstance";
import SearchFiltersModal from "./SearchFiltersModal";

interface SearchSuggestion {
  id: string;
  name: string;
  slug?: string;
  category?: string;
  price?: number;
  image?: string;
  type: "product" | "category" | "brand";
  avatar?: string;
}

interface SearchSuggestions {
  products: SearchSuggestion[];
  categories: SearchSuggestion[];
  brands: SearchSuggestion[];
}

interface AdvancedSearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  onSearch?: (query: string, filters?: any) => void;
  className?: string;
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  placeholder = "Search for handmade products...",
  showFilters = true,
  onSearch,
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({
    products: [],
    categories: [],
    brands: [],
  });
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [isClient, setIsClient] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [filters, setFilters] = useState({
    categories: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    tags: [],
    inStock: true,
    sortBy: "relevance",
  });

  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);


  useEffect(() => {
    
    setIsClient(true);
    

    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        const response = await axiosInstance.get(
          "/product/api/search-popular?limit=8"
        );
        setPopularSearches(response.data.popularSearches);
      } catch (error) {
        console.error("Failed to fetch popular searches:", error);
      }
    };
    fetchPopularSearches();
  }, []);

  const getSuggestions = useCallback(async (searchTerm: string) => {
    if (!searchTerm || typeof searchTerm !== "string") {
      setSuggestions({ products: [], categories: [], brands: [] });
      return;
    }

    const sanitizedTerm = searchTerm.trim().slice(0, 100);

    if (sanitizedTerm.length < 2) {
      setSuggestions({ products: [], categories: [], brands: [] });
      return;
    }
    const dangerousPatterns =
      /<script|javascript:|data:|vbscript:|onload|onerror/i;
    if (dangerousPatterns.test(sanitizedTerm)) {
      console.warn("Potentially dangerous input detected");
      setSuggestions({ products: [], categories: [], brands: [] });
      return;
    }

    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await axiosInstance.get(
        `/product/api/search-suggestions?q=${encodeURIComponent(
          sanitizedTerm
        )}&limit=10`,
        {
          signal: controller.signal,
          timeout: 5000,
        }
      );

      clearTimeout(timeoutId);

      if (response.data?.success && response.data?.suggestions) {
        setSuggestions(response.data.suggestions);
      } else {
        setSuggestions({ products: [], categories: [], brands: [] });
      }
    } catch (error: any) {
      if (error.name === "AbortError") {

      } else {
        console.error("Failed to fetch suggestions:", error.message || error);
      }
      setSuggestions({ products: [], categories: [], brands: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedGetSuggestions = debounce(getSuggestions, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value;

      if (value.length > 100) {
        return;
      }

      setQuery(value);
      debouncedGetSuggestions(value);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error handling input change:", error);
    }
  };

  const handleSearch = (searchQuery?: string, selectedFilters?: any) => {
    const finalQuery = searchQuery || query;
    const finalFilters = selectedFilters || filters;

    if (!finalQuery.trim()) return;

    const updatedRecent = [
      finalQuery,
      ...recentSearches.filter((s) => s !== finalQuery),
    ].slice(0, 10);
    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

    setShowSuggestions(false);

    if (onSearch) {
      onSearch(finalQuery, finalFilters);
    } else {
      const params = new URLSearchParams();
      params.set("q", finalQuery);

      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value && value !== "" && value !== "relevance") {
          if (Array.isArray(value) && value.length > 0) {
            params.set(key, value.join(","));
          } else if (typeof value === "boolean") {
            params.set(key, value.toString());
          } else {
            params.set(key, value.toString());
          }
        }
      });

      router.push(`/search?${params.toString()}`);
    }
  };
  const startVoiceSearch = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Voice search is not supported in your browser");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "product") {
      router.push(`/product/${suggestion.slug || suggestion.id}`);
    } else if (suggestion.type === "category") {
      setQuery(suggestion.name);
      handleSearch(suggestion.name, { ...filters, categories: suggestion.name });
    } else if (suggestion.type === "brand") {
      setQuery(suggestion.name);
      handleSearch(suggestion.name, { ...filters, brand: suggestion.name });
    }
  };

  useEffect(() => {

    if (typeof document === 'undefined') return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={searchRef}
      className={`relative w-full max-w-2xl mx-auto ${className}`}
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm text-gray-900 placeholder-gray-500"
        />

        <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-4">
          <button
            onClick={startVoiceSearch}
            disabled={isListening}
            className={`p-1.5 rounded-full transition-colors ${
              isListening
                ? "bg-red-100 text-red-600"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
            title="Voice Search"
          >
            <Mic size={18} className={isListening ? "animate-pulse" : ""} />
          </button>

          {showFilters && (
            <button
              onClick={() => setShowFiltersModal(true)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Filters"
            >
              <Filter size={18} />
            </button>
          )}

          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions({ products: [], categories: [], brands: [] });
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <span className="mt-2 block">Searching...</span>
            </div>
          )}

          {!isLoading && query.length >= 2 && (
            <>
              {suggestions.products.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-700 px-3 py-2">
                    Products
                  </h3>
                  {suggestions.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product)}
                      className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md text-left"
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        {product.category && (
                          <p className="text-xs text-blue-600 mb-1">
                            {product.category}
                          </p>
                        )}
                        {product.price && (
                          <p className="text-sm text-gray-500">
                            ${product.price}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.categories.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 px-3 py-2">
                    Categories
                  </h3>
                  {suggestions.categories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(category)}
                      className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md text-left"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Search size={16} className="text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-900">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.brands.length > 0 && (
                <div className="p-2 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 px-3 py-2">
                    Brands
                  </h3>
                  {suggestions.brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleSuggestionClick(brand)}
                      className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md text-left"
                    >
                      <img
                        src={brand.avatar || "/default-brand.png"}
                        alt={brand.name}
                        className="w-8 h-8 object-cover rounded-full"
                      />
                      <span className="text-sm text-gray-900">
                        {brand.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-700 px-3 py-2 flex items-center">
                <Clock size={16} className="mr-2" />
                Recent Searches
              </h3>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md text-left"
                >
                  <span className="text-sm text-gray-900">{search}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = recentSearches.filter(
                        (_, i) => i !== index
                      );
                      setRecentSearches(updated);
                      localStorage.setItem(
                        "recentSearches",
                        JSON.stringify(updated)
                      );
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </button>
              ))}
            </div>
          )}
          {!query && popularSearches && popularSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 px-3 py-2 flex items-center">
                <TrendingUp size={16} className="mr-2" />
                Popular Searches
              </h3>
              {popularSearches.slice(0, 6).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full px-3 py-2 hover:bg-gray-50 rounded-md text-left"
                >
                  <span className="text-sm text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          )}
          {!isLoading &&
            query.length >= 2 &&
            suggestions.products.length === 0 &&
            suggestions.categories.length === 0 &&
            suggestions.brands.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <Search size={24} className="mx-auto mb-2 text-gray-300" />
                <p>No suggestions found for "{query}"</p>
                <button
                  onClick={() => handleSearch()}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Search anyway
                </button>
              </div>
            )}
        </div>
      )}
      <SearchFiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={() => {
          setShowFiltersModal(false);
          handleSearch();
        }}
      />
    </div>
  );
};

export default AdvancedSearchBar;
