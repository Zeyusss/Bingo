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
    const params = new URLSearchParams();
    params.set("categories", category);
    params.set("page", "1");
    params.set("priceRange", "0,1199"); 
    
    router.push(`/products?${params.toString()}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent, category: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick(category);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 font-[Work Sans]">
      <div className=" mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2">Our categories</h2>
        <p className="text-gray-500 text-base sm:text-lg mb-10">
          Lots of new products and product collections
        </p>

        <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-center mx-auto w-fit">
          {categories.slice(0, 10).map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleClick(cat.name)}
              onKeyDown={(e) => handleKeyDown(e, cat.name)}
              tabIndex={0}
              role="button"
              aria-label={`Browse ${cat.name} category with ${cat.count} products`}
              className="cursor-pointer relative aspect-square w-full rounded-full overflow-hidden group 
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                         motion-reduce:transition-none motion-reduce:transform-none"
            >
              <img
                src={
                  categoryImageMap[cat.name.trim().replace(/\s/g, "")] ||
                  "/assets/categories/default.jpg"
                }
                alt={cat.name}
                style={{ willChange: 'transform, filter' }}
                className="object-cover w-full h-full rounded-full 
                           transition-all duration-[375ms] ease-out
                           group-hover:scale-105 group-hover:brightness-75
                           group-focus-visible:scale-105 group-focus-visible:brightness-75
                           motion-reduce:transition-none motion-reduce:transform-none motion-reduce:filter-none"
              />
              
              <div className="absolute inset-0 bg-black/10 rounded-full
                              transition-all duration-[375ms] ease-out
                              group-hover:bg-black/35 group-focus-visible:bg-black/35
                              motion-reduce:bg-black/10 motion-reduce:transition-none" />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <button className="bg-white text-black text-xs sm:text-sm font-semibold px-4 py-1 sm:px-5 sm:py-2 rounded-full mb-2 pointer-events-none">
                  {cat.name}
                </button>
                
                <span className="text-white text-xs sm:text-sm opacity-0 translate-y-2.5
                                 transition-all duration-[375ms] ease-out
                                 group-hover:opacity-100 group-hover:translate-y-0
                                 group-focus-visible:opacity-100 group-focus-visible:translate-y-0
                                 motion-reduce:opacity-0 motion-reduce:translate-y-0 motion-reduce:transition-none">
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
