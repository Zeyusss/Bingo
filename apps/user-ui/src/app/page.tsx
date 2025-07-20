"use client"
import React from "react";


import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

import Hero from "../shared/modules";
import SectionTitle from "../shared/components/section/section-title";
import ProductCard from "../shared/components/cards/product-card";
import ShopCard from "../shared/components/cards/shop-card";
import WhyHandmade from "../shared/components/homepage/WhyHandmade";
import CategoryScroller from "../shared/components/homepage/CategoryScroller";
import LatestProductsCarousel from "../shared/components/homepage/LatestProductsCarousel";
import ShopOfTheWeek from "../shared/components/homepage/ShopOfTheWeek";
import TopOffersSection from "../shared/components/homepage/TopOffersSection";
import CategoryGrid from "../shared/components/cards/CategoryGrid";

const Page = () => {
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const {data:latestProducts} = useQuery({
    queryKey:["latest-products"],
    queryFn : async ()=>{
      const res = await axiosInstance.get("product/api/get-all-products?page=1&limit=10&type=latest");
      return res.data.products;
    },
    staleTime : 1000 * 60 * 2
  });

  const {data:shops,isLoading : shopLoading} = useQuery({
    queryKey: ["shops"],
    queryFn : async ()=> {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    staleTime : 1000 * 60 *2,
  });

  const featuredShop = shops?.[0];
  return (
    <div className="bg-[#f5f5f5]">
      <CategoryGrid />
      <div className="md:w-[80%] w-[90%] my-10 m-auto">
        <WhyHandmade />
        <CategoryScroller />
        <div className="mb-8">
          <SectionTitle title="Suggested Products" />
        </div>
        {/* Suggested Products Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-12">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : !isError && products?.length ? (
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center">No Products available yet!</p>
          )}
        </div>
        {/* Top Offers Section */}
        <TopOffersSection />
        {/* Latest Products Carousel Section */}
        <div className="my-8 block">
          <SectionTitle title="Latest Products" />
        </div>
        <div className="bg-blue-50 rounded-xl shadow-inner p-6 mb-12">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            <LatestProductsCarousel products={latestProducts || []} />
          )}
          {latestProducts?.length === 0 && !isLoading && (
            <p className="text-center">No products Available yet!</p>
          )}
        </div>
        {/* Shop of the Week */}
        {shopLoading ? (
          <div className="h-[120px] bg-gray-300 animate-pulse rounded-xl mb-10" />
        ) : (
          <ShopOfTheWeek shop={featuredShop} />
        )}
        {/* Top Shops Section */}
        <div className="my-8 block">
          <SectionTitle title="Top Shops" />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          {shopLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : shops?.length ? (
            <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
              {shops.map((shop: any) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <p className="text-center">No shops available yet!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
