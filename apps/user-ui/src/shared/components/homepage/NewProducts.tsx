"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import ProductCard from "../cards/product-card";
import CategorySideFilter from "../filters/CategorySideFilter";
import CategoryFilterButton from "../filters/CategoryFilterButton";
import ProductListAnimator from "../animations/ProductListAnimator";

const NewProducts = () => {
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
        `/product/api/get-new-products?limit=50${
          category && category !== "All"
            ? `&category=${encodeURIComponent(category)}`
            : ""
        }`
      );

      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch new products:", error);
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
    <div className="mb-12 py-3 px-4 md:px-8 lg:px-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
        <h2 className="text-3xl font-bold text-gray-800">
          New Products
        </h2>

        <div className="hidden md:block">
          <CategorySideFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            title="Filter"
            showSearch={true}
            maxVisible={6}
            className="min-w-[280px]"
          />
        </div>

       
        <div className="block md:hidden w-full">
          <CategoryFilterButton
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            title="Filter by Category"
            className="w-full justify-center"
          />
        </div>
      </div>


      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : products.length > 0 ? (
        <>
          <ProductListAnimator
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6"
            listKey={`new-products-${selectedCategory}`}
            layout="grid"
            staggerDelay={0.08}
            animationDuration={0.4}
          >
            {products.slice(0, 10).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductListAnimator>

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

export default NewProducts;
