"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import ProductCard from "../cards/product-card";

const BestSellerProduct = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get("/product/api/categories-with-count");
      const categoryNames = data.categories.map((cat: any) => cat.name);
      setCategories(["All", ...categoryNames]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

const fetchProducts = async (category: string) => {
  try {
    setLoading(true);
    const { data } = await axiosInstance.get(
      `/product/api/best-sellers?limit=12${
        category && category !== "All"
          ? `&category=${encodeURIComponent(category)}`
          : ""
      }`
    );
    setProducts(data.products || []);
  } catch (error) {
    console.error("Failed to fetch best sellers:", error);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="mb-12 py-16 px-4 md:px-8 lg:px-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Weekly bestsellers
        </h2>

        <div className="flex gap-1 flex-wrap md:justify-end text-sm font-medium">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative transition-colors duration-200 px-2 py-1 group ${
                  isActive ? "text-black font-semibold" : "text-[#888]"
                }`}
              >
                {cat}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] w-full transition-transform duration-300 ${
                    isActive
                      ? "bg-[#ff8a00] scale-x-100"
                      : "bg-[#ff8a00] scale-x-0 group-hover:scale-x-100"
                  } origin-left`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.slice(0, 10).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href={
                selectedCategory === "All"
                  ? "/products"
                  : `/products?categories=${encodeURIComponent(selectedCategory)}`
              }
              className="inline-block px-6 py-2 text-white bg-[#ff8a00] hover:bg-[#e17800] rounded-full text-sm font-semibold transition"
            >
              See All
            </a>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No products found.</p>
      )}
    </div>
  );
};

export default BestSellerProduct;
