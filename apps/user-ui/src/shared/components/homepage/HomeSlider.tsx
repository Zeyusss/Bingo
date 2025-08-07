"use client";

import React, { useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PrevArrow = ({ onClick }: any) => (
  <div
    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 cursor-pointer bg-white rounded-full p-2 shadow-md"
    onClick={onClick}
  >
    <ArrowLeft />
  </div>
);

const NextArrow = ({ onClick }: any) => (
  <div
    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 cursor-pointer bg-white rounded-full p-2 shadow-md"
    onClick={onClick}
  >
    <ArrowRight />
  </div>
);

const FALLBACK_AVATAR_URL = "/assets/HomeSlider/profile.webp";

const SLIDE_BACKGROUNDS = [
  "/assets/HomeSlider/wd-furniture-slider-1-opt-1.webp",
  "/assets/HomeSlider/wd-furniture-slider-2-opt-1.webp",
  "/assets/HomeSlider/wd-furniture-slider-3-opt-1.webp",
];

const CustomSlider = ({ products }: { products: any[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);


  const isSingleProduct = products.length === 1;
  
  const settings = {
    dots: !isSingleProduct, 
    infinite: !isSingleProduct, 
    autoplay: !isSingleProduct, 
    autoplaySpeed: 6000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: isSingleProduct ? <></> : <NextArrow />, 
    prevArrow: isSingleProduct ? <></> : <PrevArrow />,
    beforeChange: (_: number, next: number) => setActiveIndex(next),
  };

  return (
    <div className="relative w-full">
      <Slider {...settings}>
        {products.map((product, index) => {
          const bgImage = SLIDE_BACKGROUNDS[index % SLIDE_BACKGROUNDS.length];
          
          const shopAvatar = product?.Shop?.avatar?.url || FALLBACK_AVATAR_URL;
          const ownerName = product?.Shop?.name || "Unknown Shop";
          const productName = product?.title || "Unnamed Product";
          const rawDescription = product?.short_description || product?.description || "Discover this amazing handmade product crafted with care and attention to detail.";
          const productDescription = rawDescription.length > 120 ? rawDescription.substring(0, 120) + "..." : rawDescription;
          const category = product?.category || "category";
          const price = product?.sale_price ? `$${product.sale_price}` : "$N/A";
          const productSlug = product?.slug || product?._id;

          return (
            <div
              key={product._id || index}
              className="relative min-h-[500px] overflow-hidden rounded-xl animate-wave-fade"
            >
              <Image
                src={bgImage}
                alt="Slide background"
                fill
                priority
                className="object-cover w-full h-full z-0 transition-all duration-700"
              />


              <div className="relative z-20 max-w-xl px-20 py-20 animate-slide-in-left">
                <p className="text-gray-800 text-sm drop-shadow">
                  Discover more products in the{" "}
                  <Link
                    href={`/products?categories=${encodeURIComponent(category)}&page=1`}
                    className="text-orange-600 underline font-semibold hover:text-orange-800 transition"
                  >
                    {category}
                  </Link>{" "}
                  category
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-4 drop-shadow">
                  {productName}
                </h2>

                <div className="flex items-center gap-3 mt-4">
                  <p className="text-lg font-medium text-gray-800">by</p>
                  <Image
                    src={shopAvatar}
                    alt={`${ownerName} shop avatar`}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                  <p className="text-lg font-medium text-gray-800">
                    {ownerName}
                  </p>
                </div>

                <p className="text-gray-700 text-base mt-3 drop-shadow max-w-md">
                  {productDescription}
                </p>

                <div className="mt-6">
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-green-700">
                      {price}
                    </span>
                  </div>
                  <Link
                    href={`/product/${productSlug}`}
                    className="bg-black text-white py-2 px-6 rounded-full text-sm font-semibold hover:bg-gray-800 transition inline-block"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default CustomSlider;
