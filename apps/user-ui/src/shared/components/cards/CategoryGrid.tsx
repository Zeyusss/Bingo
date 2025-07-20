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
        const res = await axiosInstance.get(
          "/product/api/categories-with-count"
        );
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
    <section className="py-10 text-center bg-[#F4F2EF]">
      <h2 className="text-3xl font-bold mb-2">Our Categories</h2>
      <p className="text-gray-500 mb-6">
        Lots of new products and product collections
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => handleClick(cat.name)}
            className="cursor-pointer relative w-[150px] h-[150px] rounded-full overflow-hidden shadow-lg group"
          >
            <img
              src={
                categoryImageMap[cat.name.trim().replace(/\s/g, "")] ||
                "/assets/categories/default.jpg"
              }
              alt={cat.name}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-90"
            />

            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center">
              <button className="bg-white text-black text-sm font-semibold px-3 py-1 rounded-full mb-1">
                {cat.name}
              </button>
              <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition duration-300">
                {cat.count} product{cat.count !== 1 && "s"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
