import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axiosInstance";
import ProductCard from "../cards/product-card";
import ProductListAnimator from "../animations/ProductListAnimator";

const TopOffersSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["top-offers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-events?page=1&limit=10");
      return res.data.events;
    },
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="my-8 block">
      <h2 className="md:text-3xl text-xl font-semibold mb-4">Top Offers</h2>
      <div className="bg-orange-50 rounded-xl shadow-inner p-6 mb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="text-center text-red-500">No Offers available!</p>
        ) : data?.length ? (
          <ProductListAnimator
            className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5"
            listKey="top-offers"
            staggerDelay={0.08}
            animationDuration={0.4}
            layout="grid"
          >
            {data.map((product: any) => (
              <ProductCard key={product.id} product={product} isEvent={!!product.starting_date} />
            ))}
          </ProductListAnimator>
        ) : (
          <p className="text-center">No products to display.</p>
        )}
      </div>
    </div>
  );
};

export default TopOffersSection; 