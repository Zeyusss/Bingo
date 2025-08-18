"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import ProductCard from "../cards/product-card";
import ProductListAnimator from "../animations/ProductListAnimator";
import useUser from "../../../hooks/useUser";

const RecommendedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: userLoading } = useUser();

  const fetchRecommendedProducts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get("/recommendation/api/get-recommendation-products");
      setProducts(data.recommendations || []);
    } catch (error: any) {
      console.error("Failed to fetch recommended products:", error);
      setError("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchRecommendedProducts();
    }
  }, [user, userLoading]);

  // Don't render if user is not logged in
  if (!user || userLoading) {
    return null;
  }

  return (
    <div className="mb-12 py-3 px-4 md:px-8 lg:px-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Recommended for You
          </h2>
          <p className="text-gray-600 mt-2">
            Personalized picks based on your shopping behavior
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff8a00]"></div>
          <p className="ml-3 text-gray-400">Loading your recommendations...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchRecommendedProducts}
            className="px-4 py-2 bg-[#ff8a00] text-white rounded-lg hover:bg-[#e17800] transition"
          >
            Try Again
          </button>
        </div>
      ) : products.length > 0 ? (
        <>
          <ProductListAnimator
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6"
            listKey="recommended-products"
            layout="grid"
            staggerDelay={0.08}
            animationDuration={0.4}
          >
            {products.slice(0, 10).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductListAnimator>

          {products.length > 10 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  // You can implement a "See More" functionality here
                  // For now, we'll just show all products
                  setProducts(products);
                }}
                className="inline-block px-6 py-2 text-white bg-[#ff8a00] hover:bg-[#e17800] rounded-full text-sm font-semibold transition"
              >
                See More Recommendations
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-2">No recommendations yet</p>
          <p className="text-sm text-gray-400">
            Browse and interact with products to get personalized recommendations
          </p>
        </div>
      )}
    </div>
  );
};

export default RecommendedProducts;
