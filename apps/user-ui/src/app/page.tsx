"use client";
import React from "react";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

import WhyHandmade from "../shared/components/homepage/WhyHandmade";
import ShopOfTheWeek from "../shared/components/homepage/BestSellerProduct";
import CategoryGrid from "../shared/components/homepage/CategoryGrid";
import BrandShowcase from "../shared/components/homepage/BrandShowcase";
import CustomSlider from "../shared/components/homepage/HomeSlider";
import Blog from "../shared/components/homepage/Blog";
import NewProducts from "../shared/components/homepage/NewProducts";
import AboutSection from "../shared/components/homepage/AboutSection";
import Footer from "../shared/components/homepage/Footer";
import ProuductCollections from "../shared/components/homepage/ProductCollections";
import RecommendedProducts from "../shared/components/homepage/RecommendedProducts";

const Page = () => {
  const {
    data: products,
    isLoading
  } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/product/api/get-all-products?page=1&limit=10&includeShop=true"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const sliderProducts = products?.length ? (
    products.length === 1 ? [products[0]] : products.slice(0, 3)
  ) : [];
  
  return (
    <div>
      <div className="w-full bg-[#F4F2EF]">
        {!isLoading && sliderProducts.length > 0 && (
          <CustomSlider products={sliderProducts} />
        )}
        </div>
      <CategoryGrid />
      <NewProducts />
      <RecommendedProducts/>
      <ShopOfTheWeek />
      <BrandShowcase />
      <ProuductCollections />
      <WhyHandmade />
      <Blog />
      <AboutSection />
      <Footer/>
    </div>  
  );
};

export default Page;
