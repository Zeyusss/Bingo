import React from "react";

const CATEGORIES = [
  "Jewelry", "Clothing", "Home Decor", "Art", "Toys", "Accessories", "Bags", "Ceramics", "Woodwork", "Knitting"
];

const CategoryScroller = () => (
  <div className="w-full overflow-x-auto py-4 mb-6">
    <div className="flex gap-3 min-w-max">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          className="px-5 py-2 bg-blue-50 text-blue-700 rounded-full font-medium border border-blue-100 hover:bg-blue-600 hover:text-white transition whitespace-nowrap shadow-sm"
          onClick={() => window.location.href = `/products?categories=${encodeURIComponent(cat)}`}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);

export default CategoryScroller; 