"use client";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "apps/user-ui/src/shared/components/cards/product-card";
import ProductListAnimator from "apps/user-ui/src/shared/components/animations/ProductListAnimator";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import Footer from "apps/user-ui/src/shared/components/homepage/Footer";
import FilterSidebar from "apps/user-ui/src/shared/components/filters/FilterSidebar";
import FilterButton from "apps/user-ui/src/shared/components/filters/FilterButton";

const PageContent = () => {
  const router = useRouter();
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [colorsWithCount, setColorsWithCount] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "grid-3" | "grid-4">(
    "grid-4"
  );
  const [sortOption, setSortOption] = useState("newest");
  const [itemsToShow, setItemsToShow] = useState(12);
  const [totalResults, setTotalResults] = useState(0);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  const getHexCodeFromColorFilter = (colorName: string): string => {
    const colorData = colorsWithCount.find((color) => color.name === colorName);
    if (colorData && colorData.code) {
      return colorData.code;
    }

    if (colorName.startsWith("#")) {
      return colorName;
    }

    return colorName;
  };

  const fetchColorsWithCount = async () => {
    try {
      const response = await axiosInstance.get(
        "/product/api/colors-with-count"
      );
      if (response.data && response.data.colors) {
        setColorsWithCount(response.data.colors);
      }
    } catch (error: any) {
      console.error("Failed to fetch colors:", error.message);
    }
  };

  const filteredColors = colorsWithCount.filter((color: any) =>
    color.name.toLowerCase().includes(colorSearch.toLowerCase())
  );

  useEffect(() => {
    fetchColorsWithCount();
  }, []);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const updateURL = () => {
    const params = new URLSearchParams();
    params.set("priceRange", priceRange.join(","));

    if (selectedCategories.length > 0) {
      const uniqueCategories = [...new Set(selectedCategories)].filter(
        (cat) => cat.trim().length > 0
      );
      params.set("categories", uniqueCategories.join(","));
    }

    if (selectedColors.length > 0) {
      const uniqueColors = [...new Set(selectedColors)];
      const hexColors = uniqueColors.map((color) =>
        getHexCodeFromColorFilter(color)
      );
      params.set("colors", hexColors.join(","));
    }

    if (selectedSizes.length > 0) {
      const uniqueSizes = [...new Set(selectedSizes)];
      params.set("sizes", uniqueSizes.join(","));
    }

    if (selectedStatus.length > 0) {
      const uniqueStatus = [...new Set(selectedStatus)];
      params.set("status", uniqueStatus.join(","));
    }

    params.set("page", page.toString());
    router.replace(`/todays-deals?${params.toString()}`);
  };

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("priceRange", priceRange.join(","));

      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","));
      }

      if (selectedColors.length > 0) {
        const hexColors = selectedColors.map((color) =>
          getHexCodeFromColorFilter(color)
        );
        query.set("colors", hexColors.join(","));
      }
      if (selectedSizes?.length > 0)
        query.set("sizes", selectedSizes.join(","));
      if (selectedStatus.length > 0)
        query.set("status", selectedStatus.join(","));
      query.set("page", page.toString());
      query.set("limit", "12");
      if (sortOption) query.set("sort", sortOption);
      if (debouncedProductSearch) query.set("search", debouncedProductSearch);

      const apiUrl = `/product/api/get-todays-deals?${query.toString()}`;

      const res = await axiosInstance.get(apiUrl);
      setProducts(res.data.products);
      setTotalPages(res.data.pagination.totalPages);
      setTotalResults(
        res.data?.pagination?.total || res.data?.products?.length || 0
      );
    } catch (error) {
      console.error("Failed to fetch filtered products", error);
    } finally {
      setIsProductLoading(false);
    }
  };

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const categoriesParam = searchParams.get("categories");
    const priceRangeParam = searchParams.get("priceRange");
    const colorsParam = searchParams.get("colors");
    const sizesParam = searchParams.get("sizes");
    const pageParam = searchParams.get("page");
    const statusParam = searchParams.get("status");

    if (categoriesParam) {
      const categories = [
        ...new Set(
          categoriesParam
            .split(",")
            .map((cat) => decodeURIComponent(cat.trim()))
            .filter((cat) => cat.length > 0)
        ),
      ];

      setSelectedCategories(categories);
    }

    // Initialize price range
    if (priceRangeParam) {
      const range = priceRangeParam.split(",").map(Number);
      if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
        setPriceRange(range);
        setTempPriceRange(range);
      }
    }

    // Initialize colors
    if (colorsParam) {
      const colors = [
        ...new Set(colorsParam.split(",").filter((color) => color.trim())),
      ];
      setSelectedColors(colors);
    }

    // Initialize sizes
    if (sizesParam) {
      const sizes = [
        ...new Set(sizesParam.split(",").filter((size) => size.trim())),
      ];
      setSelectedSizes(sizes);
    }

    // Initialize status
    if (statusParam) {
      const statuses = [
        ...new Set(statusParam.split(",").filter((status) => status.trim())),
      ];
      setSelectedStatus(statuses);
    }

    // Initialize page
    if (pageParam) {
      const pageNum = parseInt(pageParam);
      if (!isNaN(pageNum) && pageNum > 0) {
        setPage(pageNum);
      }
    }

    const fetchWithUrlParams = () => {
      const query = new URLSearchParams();

      if (categoriesParam) {
        query.set("categories", categoriesParam);
      }
      if (priceRangeParam) {
        query.set("priceRange", priceRangeParam);
      } else {
        query.set("priceRange", "0,1199");
      }
      if (colorsParam) {
        query.set("colors", colorsParam);
      }
      if (sizesParam) {
        query.set("sizes", sizesParam);
      }
      if (statusParam) {
        query.set("status", statusParam);
      }
      if (pageParam) {
        query.set("page", pageParam);
      } else {
        query.set("page", "1");
      }

      query.set("limit", "12");
      query.set("sort", sortOption);

      const apiUrl = `/product/api/get-todays-deals?${query.toString()}`;

      setIsProductLoading(true);
      axiosInstance
        .get(apiUrl)
        .then((res) => {
          setProducts(res.data.products);
          setTotalPages(res.data.pagination.totalPages);
          setTotalResults(
            res.data?.pagination?.total || res.data?.products?.length || 0
          );
          setIsInitialized(true);
        })
        .catch((error) => {
          console.error("Failed to fetch initial products", error);
          setIsInitialized(true);
        })
        .finally(() => {
          setIsProductLoading(false);
        });
    };

    fetchWithUrlParams();
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    updateURL();
    fetchFilteredProducts();
  }, [
    priceRange,
    selectedCategories,
    selectedColors,
    selectedSizes,
    page,
    selectedStatus,
    sortOption,
    itemsToShow,
  ]);

  useEffect(() => {
    const handler = setTimeout(
      () => setDebouncedProductSearch(productSearch),
      300
    );
    return () => clearTimeout(handler);
  }, [productSearch]);

  useEffect(() => {
    if (debouncedProductSearch !== productSearch) return;
    if (!isInitialized) return;

    fetchFilteredProducts();
  }, [debouncedProductSearch]);

  const displayedProducts = useMemo(() => {
    let filtered = [...products];

    if (debouncedProductSearch.trim().length > 0) {
      filtered = filtered.filter((product: any) =>
        product.title
          .toLowerCase()
          .includes(debouncedProductSearch.toLowerCase())
      );
    }

    switch (sortOption) {
      case "price-low":
        filtered.sort((a, b) => a.sale_price - b.sale_price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.sale_price - a.sale_price);
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "average":
      default:
        filtered.sort(
          (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0)
        );
        break;
    }

    return filtered;
  }, [debouncedProductSearch, products, sortOption]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const filteredCategories =
    data?.categories?.filter((category: string) =>
      category.toLowerCase().includes(categorySearch.toLowerCase())
    ) || [];

  const toggleCategory = (label: string) => {
    setSelectedCategories((prev) => {
      const cleanLabel = label.trim();
      if (prev.includes(cleanLabel)) {
        return prev.filter((cat) => cat !== cleanLabel);
      } else {
        const newCategories = [...prev, cleanLabel];
        return [...new Set(newCategories)];
      }
    });
    setPage(1);
  };

  const toggleColor = (colorCode: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(colorCode)) {
        return prev.filter((c) => c !== colorCode);
      } else {
        const newColors = [...prev, colorCode];
        return [...new Set(newColors)];
      }
    });
    setPage(1);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        return prev.filter((s) => s !== size);
      } else {
        const newSizes = [...prev, size];
        return [...new Set(newSizes)];
      }
    });
    setPage(1);
  };

  const toggleStatus = (status: string) => {
    setSelectedStatus((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        const newStatus = [...prev, status];
        return [...new Set(newStatus)];
      }
    });
    setPage(1);
  };

  return (
    <div>
      <div className="relative h-[320px] md:h-[420px] overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('/assets/shops/bg-shop.jpg')" }}
        />

        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 opacity-10 pointer-events-none z-[5]">
          <div
            className="h-full w-full bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">
              {selectedCategories.length > 0
                ? `${selectedCategories[0]} Deals`
                : "Today's Deals"}
            </h1>
            <p className="text-lg mb-6">Discover amazing discounts and special offers</p>
            <nav className="text-sm">
              <Link href="/" className="hover:underline opacity-80">
                Home
              </Link>
              <span className="mx-2 opacity-60">/</span>
              <span className="font-medium">Today's Deals</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="w-full pb-10">
        <div className="w-[95%] m-auto pt-8">
          <FilterSidebar
            isOpen={isFilterSidebarOpen}
            onClose={() => setIsFilterSidebarOpen(false)}
            productSearch={productSearch}
            setProductSearch={setProductSearch}
            tempPriceRange={tempPriceRange}
            setTempPriceRange={setTempPriceRange}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            setPage={setPage}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            filteredCategories={filteredCategories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            isLoading={isLoading}
            colorSearch={colorSearch}
            setColorSearch={setColorSearch}
            filteredColors={filteredColors}
            selectedColors={selectedColors}
            toggleColor={toggleColor}
            sizes={sizes}
            selectedSizes={selectedSizes}
            toggleSize={toggleSize}
            selectedStatus={selectedStatus}
            toggleStatus={toggleStatus}
          />

          <div className="w-full flex flex-col lg:flex-row gap-8">
            <div className="flex-1 px-2 lg:px-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <FilterButton
                    onClick={() => setIsFilterSidebarOpen(true)}
                    activeFiltersCount={
                      selectedCategories.length +
                      selectedColors.length +
                      selectedSizes.length +
                      selectedStatus.length +
                      (priceRange[0] !== 0 || priceRange[1] !== 1199 ? 1 : 0) +
                      (productSearch ? 1 : 0)
                    }
                  />
                  <div className="text-sm text-gray-700">
                    {isProductLoading ? (
                      <p>Loading products...</p>
                    ) : products.length > 0 ? (
                      <p>
                        Showing {(page - 1) * itemsToShow + 1}–
                        {Math.min(
                          page * itemsToShow,
                          totalResults || products.length
                        )}{" "}
                        of {totalResults || products.length} results
                      </p>
                    ) : (
                      <p>No products found</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-end">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Show :</span>
                    {[9, 12, 18, 24].map((count) => (
                      <button
                        key={count}
                        onClick={() => {
                          setItemsToShow(count);
                          setPage(1);
                        }}
                        className={`text-sm ${
                          count === itemsToShow
                            ? "text-black font-semibold"
                            : "text-gray-500"
                        } hover:underline`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <button
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "text-black" : ""}
                      title="List View"
                    >
                      <svg width="20" height="20" fill="currentColor">
                        <rect x="3" y="4" width="14" height="2" rx="1" />
                        <rect x="3" y="9" width="14" height="2" rx="1" />
                        <rect x="3" y="14" width="14" height="2" rx="1" />
                      </svg>
                    </button>
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

                  <div className="relative">
                    <select
                      className="pl-4 pr-8 py-1 rounded-full border text-sm appearance-none cursor-pointer bg-white shadow-sm"
                      defaultValue="average"
                      onChange={(e) => {
                        const selectedSort = e.target.value;
                        setSortOption(selectedSort);
                        setPage(1);
                      }}
                    >
                      <option value="average">Sort by average rating</option>
                      <option value="newest">Sort by newest</option>
                      <option value="price-low">
                        Sort by price: low to high
                      </option>
                      <option value="price-high">
                        Sort by price: high to low
                      </option>
                    </select>
                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      ▼
                    </div>
                  </div>
                </div>
              </div>
              {isProductLoading ? (
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid-3"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : viewMode === "grid-4"
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {Array.from({
                    length:
                      viewMode === "grid-3"
                        ? 9
                        : viewMode === "grid-4"
                        ? 16
                        : 10,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                    ></div>
                  ))}
                </div>
              ) : displayedProducts.length === 0 ? (
                <p>No Products Found!</p>
              ) : viewMode === "list" ? (
                <ProductListAnimator
                  className="space-y-4"
                  listKey={`todays-deals-list-${page}-${sortOption}-${selectedCategories.join(',')}-${selectedColors.join(',')}-${selectedSizes.join(',')}-${selectedStatus.join(',')}-${priceRange.join('-')}-${debouncedProductSearch}`}
                  staggerDelay={0.08}
                  animationDuration={0.4}
                  layout="flex"
                >
                  {displayedProducts.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isEvent={!!product.starting_date}
                      view="list"
                    />
                  ))}
                </ProductListAnimator>
              ) : (
                <ProductListAnimator
                  className={`grid gap-4 ${
                    viewMode === "grid-3"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  }`}
                  listKey={`todays-deals-grid-${viewMode}-${page}-${sortOption}-${selectedCategories.join(',')}-${selectedColors.join(',')}-${selectedSizes.join(',')}-${selectedStatus.join(',')}-${priceRange.join('-')}-${debouncedProductSearch}`}
                  staggerDelay={0.08}
                  animationDuration={0.4}
                  layout="grid"
                >
                  {displayedProducts.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isEvent={!!product.starting_date}
                    />
                  ))}
                </ProductListAnimator>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-1 !rounded border border-gray-200 text-sm ${
                        page === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white text-black"
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

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
}
