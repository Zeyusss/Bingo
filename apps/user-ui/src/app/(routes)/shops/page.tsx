"use client";

import { categories } from "apps/user-ui/src/configs/categories";
import ShopCard from "apps/user-ui/src/shared/components/cards/shop-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";


const Page = () => {
  const router = useRouter();
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [shopSearch, setShopSearch] = useState("");
  const [debouncedShopSearch, setDebouncedShopSearch] = useState("");


  useEffect(() => {
    const handler = setTimeout(() => setDebouncedShopSearch(shopSearch), 300);
    return () => clearTimeout(handler);
  }, [shopSearch]);


  const displayedShops = useMemo(() => {
    if (debouncedShopSearch.trim().length === 0) return shops;
    return shops.filter((shop: any) =>
      shop.name.toLowerCase().includes(debouncedShopSearch.toLowerCase())
    );
  }, [debouncedShopSearch, shops]);


  const updateURL = () => {
    const params = new URLSearchParams();
    if (selectedCategories.length > 0)
      params.set("category", selectedCategories.join(","));
    if(selectedCountries.length>0)
      params.set("country",selectedCountries.join(","))
    params.set("page", page.toString());
    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedCategories.length > 0)
        query.set("category", selectedCategories.join(","));
      if(selectedCountries.length > 0)
        query.set("country",selectedCountries.join(","));
        query.set("page", page.toString());
        query.set("limit", "12");

        const res = await axiosInstance.get(
          `/product/api/get-filtered-shops?${query.toString()}`
        );
        setShops(res.data.shops);
        setTotalPages(res.data.pagination.totalPages);
      
    } catch (error) {
      console.error("Failed to fetch filtered shops", error);
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
  }, [ selectedCategories, page]);



  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <div className="pb-[50px]">
          <h1 className="md:pt-[40px] font-semibold text-[44px] leading-1 mb-[14px] font-jost">
            Artists
          </h1>
          <Link href={"/"} className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">Artists</span>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* sidebar */}
          <aside className="w-full lg:w-[270px] !rounded bg-white p-4 space-y-6 shadow-md">

            {/* Shop Search */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1">
              Search
            </h3>
            <div className="relative mb-5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search shop by name..."
                value={shopSearch}
                onChange={e => setShopSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 shadow-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm transition placeholder-gray-400"
              />
            </div>
            {/* Categories */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <ul className="space-y-2 !mt-3">
                {categories?.map((category: any) => (
                  <li
                    key={category.value}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.value)}
                        onChange={() => toggleCategory(category.value)}
                        className="accent-blue-600"
                      />
                      {category.label}
                    </label>
                  </li>
                ))
            }
            </ul>
            <hr className="my-4 border-slate-200" />
            {/* Countries */}
            {/* <ul className="space-y-2 !mt-3 max-h-48 overflow-y-auto pr-1">
                {filteredCountries?.map((country: any) => (
                  <li
                    key={country}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition-colors duration-200">
                      <input
                        type="checkbox"
                        checked={selectedCountries.includes(country)}
                        onChange={() => toggleCountry(country)}
                        className="accent-blue-600"
                      />
                      {country}
                    </label>
                  </li>
                ))
            }
            </ul> */}
          </aside>
          {/* Shop Grid */}
          <div className="flex-1 px-2 lg:px-3">
            <div className="rounded-xl bg-white/70 p-2 md:p-4">
            {isShopLoading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {Array.from({length:10}).map((_,index)=>(
                <div
                key={index}
                className="h-[250px] bg-gray-200 animate-pulse rounded-xl"
                >
                </div>
                ))}

             </div>
            ) : displayedShops.length === 0 ? (
              <p>No Shops Found!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {displayedShops.map((shop:any)=>(
                    <ShopCard key={shop.id} shop={shop}/>
                ))}
              </div>
            )}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                {Array.from({length : totalPages}).map((_,i)=>(
                    <button
                    key={i + 1}
                    onClick={()=>setPage(i + 1)}
                    className={`px-3 py-1 !rounded border border-gray-200 text-sm ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white text-black" }`}
                    >
                    {i+1}
                    </button>
                ))}
                </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
