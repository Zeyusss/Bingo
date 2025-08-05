"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "../../../utils/axiosInstance";

type Shop = {
  id: string;
  name: string;
  city: string;
  country: string;
  avatar?: string;
  banner?: string;
};

export default function BrandShowcase() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data } = await axiosInstance.get("/product/api/brands/showcase");
        setShops(data.brands || []);
      } catch (error: any) {
        console.error("Failed to load shops:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  return (
    <section className="py-16 px-4 md:px-8 font-[Work Sans]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Shopping by brands</h2>
        <p className="text-gray-600 mb-8">Discover lots of products from popular brands</p>

        {loading ? (
          <p className="text-center text-gray-500">Loading shops...</p>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {shops.slice(0, 5).map((shop) => {
              const firstName = shop.name.split(" ")[0]; 
              return (
                <Link key={shop.id} href={`/brands/${shop.id}`}>
                  <div className="relative h-[370px] rounded-2xl overflow-hidden shadow-md group cursor-pointer">
                    <img
                      src={
                        shop.banner?.trim()
                          ? shop.banner
                          : "https://dummyimage.com/600x600/eeeeee/000000&text=Brand"
                      }
                      alt={shop.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />


                    <div className="absolute inset-0 bg-black/30 p-4 flex flex-col justify-between">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                        <span className="text-[14px] font-extrabold text-black lowercase tracking-wide">
                          {firstName}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-white text-lg font-semibold leading-tight mb-1">
                          {shop.name}
                        </h3>
                        <p className="text-white text-sm">
                          {shop.city} / {shop.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No shops found.</p>
        )}
      </div>
    </section>
  );
}
