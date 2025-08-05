"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { categoryImageMap } from "./categoryImageMap";
import { useRouter } from "next/navigation";

interface Category {
  name: string;
  count: number;
}

const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/product/api/categories-with-count");
        setCategories(res.data.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleClick = (category: string) => {
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="py-16 px-4 sm:px-6 font-[Work Sans]">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Our categories</h2>
        <p className="text-gray-500 text-base sm:text-lg mb-10">
          Lots of new products and product collections
        </p>

        <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.slice(0, 10).map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleClick(cat.name)}
              className="cursor-pointer relative aspect-square w-full rounded-full overflow-hidden group transition-transform duration-300 hover:scale-105"
            >
              <img
                src={
                  categoryImageMap[cat.name.trim().replace(/\s/g, "")] ||
                  "/assets/categories/default.jpg"
                }
                alt={cat.name}
                className="object-cover w-full h-full rounded-full"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-center">
                <button className="bg-white text-black text-xs sm:text-sm font-semibold px-4 py-1 sm:px-5 sm:py-2 rounded-full mb-2">
                  {cat.name}
                </button>
                <span className="text-white text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition duration-300">
                  {cat.count} product{cat.count !== 1 && "s"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
