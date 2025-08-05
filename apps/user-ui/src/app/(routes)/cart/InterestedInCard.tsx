"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import ProductCard from "apps/user-ui/src/shared/components/cards/product-card";

const InterestedInCard = ({
  category = "All",
  limit = 5,
}: {
  category?: string;
  limit?: number;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["best-sellers", category, limit],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/product/api/best-sellers?category=${category}&limit=${limit}`
      );
      return res.data.products;
    },
  });

  return (
    <div className="max-w-[1240px] mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        You May Be Interested In...
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {isLoading
          ? Array.from({ length: limit }).map((_, idx) => (
              <div
                key={idx}
                className="h-[300px] bg-gray-100 animate-pulse rounded"
              />
            ))
          : data?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </div>
  );
};

export default InterestedInCard;
