"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Star,
  MapPin,
  Users,
  Pencil,
  Clock,
  Calendar,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import useSeller from "../hooks/useSeller";
import ProductCard from "../shared/components/cards/product-card";
import ImageUploadModal from "../shared/components/modals/ImageUploadModal";

const TABS = ["Products", "Offers", "Reviews"];

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  const products = res.data.products?.filter((i: any) => !i.starting_date);
  return products;
};

const fetchEvents = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  const products = res.data.products?.filter((i: any) => i.starting_date);
  return products;
};

const Page = () => {
  const { seller, isLoading, refetch } = useSeller();
  const [activeTab, setActiveTab] = useState("Products");
  const [editType, setEditType] = useState<"cover" | "avatar" | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!seller && !isLoading) {
      router.push("/login");
    }
  }, [seller, isLoading]);

  const { data: events = [] } = useQuery({
    queryKey: ["shop-events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch reviews data
  const { data: reviews = [] } = useQuery({
    queryKey: ["shop-reviews"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-reviews/${seller?.shop?.id}`
      );
      return res.data.reviews;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!seller?.shop?.id && activeTab === "Reviews",
  });

  const handleImageUploadSuccess = (
    imageUrl: string,
    type: "cover" | "avatar"
  ) => {
    console.log(`${type} updated successfully with URL:`, imageUrl);
    console.log("Current seller data before invalidation:", seller);

    // Refresh seller data to show updated image
    queryClient.invalidateQueries({ queryKey: ["seller"] });

    // Force refetch to ensure we get the latest data
    refetch().then((result: any) => {
      console.log("Refetched seller data:", result.data);
      if (type === "avatar") {
        console.log("Avatar URL after refetch:", result.data?.shop?.avatar);
      }
    });
  };

  return (
    <>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="w-full min-h-screen bg-gray-900">
          <ImageUploadModal
            isOpen={!!editType}
            onClose={() => setEditType(null)}
            editType={editType}
            onUploadSuccess={handleImageUploadSuccess}
          />

          <div className="w-full px-3 pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>

          <div className="relative w-full flex justify-center bg-gray-800">
            <Image
              src={
                seller?.shop?.coverBanner ||
                "https://ik.imagekit.io/w7lwh7wre/cover-handmade.webp?updatedAt=175424311149"
              }
              alt="Shop Cover Banner"
              className="w-full h-[400px] object-cover"
              width={1200}
              height={300}
            />
            {seller?.id && (
              <button
                className="absolute top-3 right-3 bg-blue-600 px-3 py-2 rounded-md flex justify-center items-center hover:bg-blue-700 transition shadow-lg"
                onClick={() => setEditType("cover")}
              >
                <Pencil size={16} className="text-white" />{" "}
                <span className="text-white ml-1">Edit Cover</span>
              </button>
            )}
          </div>

          {/* seller info section */}
          <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex flex-col lg:flex-row gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex-1">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="relative w-[100px] h-[100px] rounded-full border-4 border-slate-300">
                  <Image
                    src={
                      seller?.shop?.avatar ||
                      "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"
                    }
                    alt="Seller Avatar"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                  {seller?.id && (
                    <button
                      className="absolute -top-2 -right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg z-30 border-2 border-white"
                      onClick={() => setEditType("avatar")}
                    >
                      <Pencil size={16} className="text-white" />
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <h1 className="text-2xl font-semibold text-white">
                    {seller?.shop?.name}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    {seller?.shop?.bio || "No bio available."}
                  </p>
                  <div className="flex item-center gap-4 mt-2">
                    <div className="flex items-center text-yellow-400 gap-1">
                      <Star fill="#facc15" size={18} />{" "}
                      <span>{seller?.shop?.ratings || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-gray-300 gap-1">
                      <Users size={18} />{" "}
                      <span>{seller?.followers || 0} Followers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-gray-400">
                    <Clock size={18} />
                    <span>
                      {seller?.shop?.opening_hours || "Mon - Sat: 9 AM - 6 PM"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-gray-400">
                    <MapPin size={18} />{" "}
                    <span>
                      {seller?.shop?.address || "No address provided"}
                    </span>
                  </div>
                </div>
                {seller?.id ? (
                  <button
                    className="px-6 py-2 h-[40px] bg-blue-600 rounded-lg font-semibold flex items-center justify-center hover:bg-blue-700 transition"
                    onClick={() => router.push("/edit-profile")}
                  >
                    <Pencil size={18} />
                    Edit Profile
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
              <h2 className="text-xl font-semibold text-white">Shop Details</h2>
              <div className="flex items-center gap-3 mt-3 text-gray-400">
                <Calendar size={18} />
                <span>
                  Joined At:{" "}
                  {seller?.shop?.createdAt
                    ? new Date(seller.shop.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-3 text-gray-400">
                <Globe size={18} />
                <span>
                  Last Updated:{" "}
                  {seller?.shop?.updatedAt
                    ? new Date(seller.shop.updatedAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* tab section */}
          <div className="w-[85%] lg:w-[70%] mx-auto mt-8">
            <div className="flex border-b border-gray-700">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-6 text-lg font-semibold ${
                    activeTab === tab
                      ? "text-white border-b-2 border-blue-600"
                      : "text-gray-400"
                  } transition`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg my-4 text-gray-300 min-h-[400px]">
              {/* Products */}
              {activeTab === "Products" && (
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {products?.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                  {products?.length === 0 && (
                    <p className="py-2 text-gray-400">
                      No products available yet!
                    </p>
                  )}
                </div>
              )}

              {/* Offers */}
              {activeTab === "Offers" && (
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {events?.map((product: any) => (
                    <ProductCard
                      isEvent={true}
                      key={product.id}
                      product={product}
                    />
                  ))}
                  {events?.length === 0 && (
                    <p className="py-2 text-gray-400">
                      No offers available yet!
                    </p>
                  )}
                </div>
              )}

              {/* Reviews */}
              {activeTab === "Reviews" && (
                <div className="p-4">
                  {reviews?.map((review: any) => (
                    <div
                      key={review.id}
                      className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < review.rating ? "#fbbf24" : "#e5e7eb"}
                            className="text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-gray-300">{review.reviews}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={
                                review.user.avatar?.url ||
                                "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"
                              }
                              alt="User Avatar"
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                          <span className="text-sm text-gray-400">
                            {review.user.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {reviews?.length === 0 && (
                    <p className="py-2 text-gray-400">No reviews yet!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
