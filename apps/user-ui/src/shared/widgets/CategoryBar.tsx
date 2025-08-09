"use client";
import React from "react";
import { navItems } from "../../configs/constants";
import Link from "next/link";

const CategoryBar = () => {
  return (
    <div className="w-full py-2 border-b border-gray-200 hidden lg:block">
      <div className="flex flex-wrap items-center justify-between px-[10%] overflow-x-hidden">
        <div className="flex items-center">
          {navItems.map((item: NavItemsTypes, index: number) => (
            <Link
              className="px-5 font-medium text-lg text-black hover:text-orange-500 transition"
              href={item.href}
              key={index}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <div className="mt-2 lg:mt-0 ml-6 shrink-0 border border-gray-200 bg-gray-100 text-black px-4 py-2 rounded-full font-semibold text-sm shadow-sm hover:bg-gray-200 transition cursor-pointer whitespace-nowrap">
          Free shipping for all orders over 5.000 L.E
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
