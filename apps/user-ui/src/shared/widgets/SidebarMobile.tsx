"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Search, ChevronRight } from "lucide-react";

const categories = [
  "Jewelry",
  "Clothing",
  "Clothing & Fashion",
  "Home Decor",
  "Art",
  "Toys",
  "Accessories",
  "Bags",
  "Ceramics",
  "Woodwork",
  "Knitting",
];

const menuItems = [
  { label: "Home", path: "/" },
  { label: "Demos", path: "/demos" },
  { label: "Blog", path: "/blogs" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
  { label: "Showrooms", path: "/showrooms" },
  { label: "Gift Cards", path: "/gift-cards" },
];

const SidebarMobile = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<"categories" | "menu">("categories");
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/products?categories=${encodeURIComponent(category)}`);
    onClose();
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[9999] shadow transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center p-4 border-b">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search for products"
          className="w-full outline-none text-sm"
        />
        <X size={18} className="ml-2 cursor-pointer" onClick={onClose} />
      </div>

      <div className="flex border-b text-sm font-semibold">
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 py-2 ${
            activeTab === "categories"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-gray-500"
          }`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={`flex-1 py-2 ${
            activeTab === "menu"
              ? "border-b-2 border-orange-500 text-orange-500"
              : "text-gray-500"
          }`}
        >
          Menu
        </button>
      </div>

      <div className="p-4 text-sm">
        {activeTab === "categories" && (
          <ul>
            {categories.map((item) => (
              <li
                key={item}
                onClick={() => handleCategoryClick(item)}
                className="py-2 border-b flex justify-between items-center cursor-pointer hover:text-orange-500"
              >
                {item} <ChevronRight size={16} />
              </li>
            ))}
          </ul>
        )}
        {activeTab === "menu" && (
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.label}
                className="py-2 border-b hover:text-orange-500 cursor-pointer"
              >
                <Link href={item.path} onClick={onClose}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SidebarMobile;
