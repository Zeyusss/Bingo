"use client";

import { categories } from "apps/user-ui/src/configs/categories";
import ShopCard from "apps/user-ui/src/shared/components/cards/shop-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import Footer from "apps/user-ui/src/shared/components/homepage/Footer";
import ShopFilterSidebar from "apps/user-ui/src/shared/components/filters/ShopFilterSidebar";
import FilterButton from "apps/user-ui/src/shared/components/filters/FilterButton";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category")?.split(",").filter(Boolean) || []
  );
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    searchParams.get("country")?.split(",").filter(Boolean) || []
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [shopSearch, setShopSearch] = useState("");
  const [debouncedShopSearch, setDebouncedShopSearch] = useState("");
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [minRating, setMinRating] = useState(
    parseFloat(searchParams.get("minRating") || "0")
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [viewMode, setViewMode] = useState<"grid-3" | "grid-4">("grid-4");
  const [countries] = useState<string[]>([]);

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
    if (selectedCountries.length > 0)
      params.set("country", selectedCountries.join(","));
    if (minRating > 0) params.set("minRating", minRating.toString());
    if (sortBy !== "newest") params.set("sortBy", sortBy);
    params.set("page", page.toString());
    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedCategories.length > 0)
        query.set("category", selectedCategories.join(","));
      if (selectedCountries.length > 0)
        query.set("country", selectedCountries.join(","));
      if (minRating > 0) query.set("minRating", minRating.toString());
      if (sortBy !== "newest") query.set("sortBy", sortBy);
      query.set("page", page.toString());
      query.set("limit", "8");

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
  }, [selectedCategories, selectedCountries, minRating, sortBy, page]);

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) =>
      prev.includes(label)
        ? prev.filter((cat) => cat !== label)
        : [...prev, label]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedCountries.length +
    (minRating > 0 ? 1 : 0) +
    (shopSearch.trim() ? 1 : 0);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative h-[320px] md:h-[420px] overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/assets/shops/bg-shop.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Artists</h1>
          <p className="text-lg mb-6">
            Discover talented artists and their unique creations
          </p>
          <nav className="text-sm">
            <Link href="/" className="hover:underline opacity-80">
              Home
            </Link>
            <span className="mx-2 opacity-60">/</span>
            <span className="font-medium">Artists</span>
          </nav>
        </div>
      </div>

      <div className="w-full pb-10">
        <div className="w-[95%] m-auto pt-8">
          {/* Filter Sidebar */}
          <ShopFilterSidebar
            isOpen={isFilterSidebarOpen}
            onClose={() => setIsFilterSidebarOpen(false)}
            shopSearch={shopSearch}
            setShopSearch={setShopSearch}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            selectedCountries={selectedCountries}
            toggleCountry={toggleCountry}
            categories={categories}
            countries={countries}
            minRating={minRating}
            setMinRating={setMinRating}
            sortBy={sortBy}
            setSortBy={setSortBy}
            setPage={setPage}
          />

          <div className="w-full flex flex-col lg:flex-row gap-8">
            {/* Main Content Area */}
            <div className="flex-1 px-2 lg:px-3">
              {/* Top Bar with Filter Button and Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                {/* Left side - Filter button and results count */}
                <div className="flex items-center gap-4">
                  <FilterButton
                    onClick={() => setIsFilterSidebarOpen(true)}
                    activeFiltersCount={activeFiltersCount}
                  />
                  <div className="text-sm text-gray-700">
                    {isShopLoading ? (
                      <p>Loading shops...</p>
                    ) : displayedShops.length > 0 ? (
                      <p>
                        Showing {displayedShops.length} of {shops.length} shops
                      </p>
                    ) : (
                      <p>No shops found</p>
                    )}
                  </div>
                </div>

                {/* Right side - View controls and sorting */}
                <div className="flex items-center gap-4 flex-wrap justify-end">
                  {/* View icons */}
                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      onClick={() => setViewMode("grid-3")}
                      className={viewMode === "grid-3" ? "text-black" : ""}
                      title="3x3 Grid"
                    >
                      <svg width="20" height="20" fill="currentColor">
                        {[5, 10, 15].map((y) =>
                          [5, 10, 15].map((x) => (
                            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />
                          ))
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("grid-4")}
                      className={viewMode === "grid-4" ? "text-black" : ""}
                      title="4x4 Grid"
                    >
                      <svg width="20" height="20" fill="currentColor">
                        {[4, 8, 12, 16].map((y) =>
                          [4, 8, 12, 16].map((x) => (
                            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />
                          ))
                        )}
                      </svg>
                    </button>
                  </div>

                  {/* Sort dropdown */}
                  <div className="relative">
                    <select
                      className="pl-4 pr-8 py-1 rounded-full border text-sm appearance-none cursor-pointer bg-white shadow-sm"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="newest">Sort by newest</option>
                      <option value="oldest">Sort by oldest</option>
                      <option value="name_asc">Sort by name A-Z</option>
                      <option value="name_desc">Sort by name Z-A</option>
                      <option value="rating_high">Sort by highest rated</option>
                      <option value="rating_low">Sort by lowest rated</option>
                      <option value="followers_high">
                        Sort by most followers
                      </option>
                      <option value="followers_low">
                        Sort by least followers
                      </option>
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop Grid */}
              {isShopLoading ? (
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid-3"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  }`}
                >
                  {Array.from({ length: viewMode === "grid-3" ? 9 : 16 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                      ></div>
                    )
                  )}
                </div>
              ) : displayedShops.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No Shops Found!</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              ) : (
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid-3"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  }`}
                >
                  {displayedShops.map((shop: any) => (
                    <ShopCard key={shop.id} shop={shop} />
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-1 rounded border border-gray-200 text-sm ${
                        page === i + 1
                          ? "bg-orange-600 text-white"
                          : "bg-white text-black hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
