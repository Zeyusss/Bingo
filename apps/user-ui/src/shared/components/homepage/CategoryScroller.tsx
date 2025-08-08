import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

const CategoryScroller = () => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosInstance.get("/product/api/categories-with-count");
        const categoryNames = data.categories.map((cat: any) => cat.name);
        setCategories(categoryNames.slice(0, 10));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="w-full overflow-x-auto py-4 mb-6">
      <div className="flex gap-3 min-w-max">
        {categories.map((cat) => (
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
};

export default CategoryScroller;