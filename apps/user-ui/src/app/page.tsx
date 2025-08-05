"use client";
import React from "react";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

import WhyHandmade from "../shared/components/homepage/WhyHandmade";
import ShopOfTheWeek from "../shared/components/homepage/BestSellerProduct";
import CategoryGrid from "../shared/components/homepage/CategoryGrid";
import BrandShowcase from "../shared/components/homepage/BrandShowcase";
import CustomSlider from "../shared/components/homepage/HomeSlider";
import ScrollToTopButton from "../shared/components/homepage/ScrollToTopButton";
import Blog from "../shared/components/homepage/Blog";
import NewProducts from "../shared/components/homepage/NewProducts";
import AboutSection from "../shared/components/homepage/AboutSection";
import Footer from "../shared/components/homepage/Footer";
import ProuductCollections from "../shared/components/homepage/ProductCollections";

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
  const { data: latestProducts } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "product/api/get-all-products?page=1&limit=10&type=latest"
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: shops, isLoading: shopLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 2,
  });

  const featuredShop = shops?.[0];
  
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
