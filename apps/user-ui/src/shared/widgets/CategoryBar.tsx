"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import categoryIcons from "../../assets/svgs/categoryIcons";

const CATEGORIES = [
  "Jewelry", "Clothing", "Home Decor", "Art", "Toys",
  "Accessories", "Bags", "Ceramics", "Woodwork", "Knitting"
];

const CategoryBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const handleClick = (category: string) => {
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="w-full py-2 border-b border-gray-200 hidden lg:block">
      <div className="flex flex-wrap items-center justify-between px-[10%] overflow-x-hidden">
        <div className="flex flex-wrap items-center gap-6">
          {CATEGORIES.map((category) => {
            const Icon = categoryIcons[category];
            const isActive = currentCategory === category;

            return (
              <div
                key={category}
                onClick={() => handleClick(category)}
                className={`flex items-center gap-1 text-sm cursor-pointer whitespace-nowrap transition 
                  ${isActive ? "text-orange-500 font-semibold" : "text-black hover:text-orange-500"}`}
              >
                {Icon && <Icon />}
                <span>{category}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 lg:mt-0 ml-6 shrink-0 border border-gray-200 bg-gray-100 text-black px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:bg-gray-200 transition cursor-pointer whitespace-nowrap">
          Free shipping for all orders of $1.300
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
