"use client";
import React from "react";
import { useRouter } from "next/navigation";
import categoryIcons from "../../assets/svgs/categoryIcons";

const CATEGORIES = [
  "Jewelry", "Clothing", "Home Decor", "Art", "Toys",
  "Accessories", "Bags", "Ceramics", "Woodwork", "Knitting"
];

const CategoryBar = () => {
  const router = useRouter();

  const handleClick = (category: string) => {
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="w-full py-2 border-b border-gray-200">
      <div className="flex items-center justify-between px-[10%] overflow-x-auto">
        {/* Categories */}
        <div className="flex items-center gap-6">
          {CATEGORIES.map((category) => {
            const Icon = categoryIcons[category];

            return (
              <div
                key={category}
                onClick={() => handleClick(category)}
                className="flex items-center gap-1 text-sm text-black cursor-pointer hover:text-gray-600 transition whitespace-nowrap"
              >
                {Icon && <Icon />}
                <span>{category}</span>
              </div>
            );
          })}
        </div>

        {/* Free Shipping Badge */}
        <div
          className="ml-6 shrink-0 border border-gray-200 bg-gray-100 text-black px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:bg-gray-200 transition cursor-pointer whitespace-nowrap"
        >
          Free shipping for all orders of $1.300
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
