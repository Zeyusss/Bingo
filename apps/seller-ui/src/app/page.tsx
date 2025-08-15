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
  Shield,
  CheckCircle,
  Layout,
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
    queryClient.invalidateQueries({ queryKey: ["seller"] });

    refetch().then((result: any) => {
      if (type === "avatar") {
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
        <div
          className="w-full min-h-screen bg-[#F4F2EF]"
          style={{
            backgroundImage: "url('/assets/wd-furniture-background.webp')",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
          }}
        >
          <ImageUploadModal
            isOpen={!!editType}
            onClose={() => setEditType(null)}
            editType={editType}
            onUploadSuccess={handleImageUploadSuccess}
          />

          <div className="w-full px-4 py-4 flex justify-between items-center bg-white border-b border-gray-200">
            <button
              onClick={() =>
                router.push(
                  seller?.isVerified &&
                    seller?.verificationStatus === "Approved"
                    ? "/dashboard"
                    : "/settings"
                )
              }
              className="flex items-center gap-2 text-black  transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">
                Back to{" "}
                {seller?.isVerified && seller?.verificationStatus === "Approved"
                  ? "Dashboard"
                  : "Settings"}
              </span>
            </button>
          </div>

          <div className="relative w-full flex justify-center bg-white">
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
                onClick={() => setEditType("cover")}
                className="absolute top-4 right-4 bg-white hover:bg-gray-50 text-black p-3 rounded-full shadow-lg z-10 border border-gray-200 transition-colors"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>

          {/* seller info section */}
          <div className="w-[88%] m-auto relative -mt-20 z-10">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={
                        seller?.shop?.avatar ||
                        "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"
                      }
                      alt="Shop Avatar"
                      className="w-full h-full object-cover"
                      width={128}
                      height={128}
                    />
                  </div>
                  {seller?.id && (
                    <button
                      onClick={() => setEditType("avatar")}
                      className="absolute -bottom-1 -right-1 bg-white hover:bg-gray-50 text-black p-2 rounded-full shadow-lg z-30 transform translate-x-1 translate-y-1 border border-gray-200 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-black font-[Poppins]">
                        {seller?.shop?.name}
                      </h1>
                      <p className="text-gray-600 text-base mt-2 font-[Work Sans]">
                        {seller?.shop?.bio || "No bio available."}
                      </p>
                      <div className="flex item-center gap-4 mt-4">
                        <div className="flex items-center text-yellow-500 gap-1">
                          <Star fill="#eab308" size={18} />{" "}
                          <span className="text-gray-700 font-medium">
                            {seller?.shop?.ratings || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-700">
                          <Users size={18} />{" "}
                          <span className="font-medium">
                            {seller?.followers || 0} Followers
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4 text-gray-700">
                        <Clock size={18} />
                        <span className="font-medium">
                          {seller?.shop?.opening_hours ||
                            "Mon - Sat: 9 AM - 6 PM"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-gray-700">
                        <MapPin size={18} />{" "}
                        <span className="font-medium">
                          {seller?.shop?.address || "No address provided"}
                        </span>
                      </div>
                    </div>

                    <div className="lg:w-64 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-sm font-bold text-gray-800 font-[Poppins] mb-3">
                        Shop Info
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={14} />
                          <span className="text-xs font-medium">
                            Joined{" "}
                            {seller?.shop?.createdAt
                              ? new Date(
                                  seller.shop.createdAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Globe size={14} />
                          <span className="text-xs font-medium">
                            Updated{" "}
                            {seller?.shop?.updatedAt
                              ? new Date(
                                  seller.shop.updatedAt
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {seller?.id ? (
                  <div className="flex flex-col gap-3">
                    {/* Verification Status */}
                    {(!seller?.isVerified ||
                      seller?.verificationStatus === "None" ||
                      seller?.verificationStatus === "Pending" ||
                      seller?.verificationStatus === "Rejected" ||
                      seller?.verificationStatus ===
                        "RequiresResubmission") && (
                      <button
                        className="px-6 py-2 h-[40px] bg-yellow-600 rounded-lg font-semibold flex items-center justify-center hover:bg-yellow-700 transition"
                        onClick={() => router.push("/settings/verification")}
                      >
                        <Shield size={18} className="mr-2" />
                        {seller?.verificationStatus === "None"
                          ? "Verify Identity"
                          : seller?.verificationStatus === "Pending"
                          ? "View Verification Status"
                          : seller?.verificationStatus === "Rejected" ||
                            seller?.verificationStatus ===
                              "RequiresResubmission"
                          ? "Update Verification"
                          : "Verify Identity"}
                      </button>
                    )}

                    {seller?.isVerified &&
                      seller?.verificationStatus === "Approved" && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg">
                          <CheckCircle size={18} className="text-white" />
                          <span className="text-white font-medium">
                            Verified Seller
                          </span>
                        </div>
                      )}

                    {/* Dashboard Button - Only show for verified sellers */}
                    {seller?.isVerified &&
                      seller?.verificationStatus === "Approved" && (
                        <button
                          className="px-6 py-2 h-[40px] bg-blue-600 rounded-lg font-semibold flex items-center justify-center hover:bg-blue-700 transition"
                          onClick={() => router.push("/dashboard")}
                        >
                          <Layout size={18} className="mr-2" />
                          Dashboard
                        </button>
                      )}

                    <button
                      className="px-6 py-2 h-[40px] bg-gray-600 rounded-lg font-semibold flex items-center justify-center hover:bg-gray-700 transition"
                      onClick={() => router.push("/edit-profile")}
                    >
                      <Pencil size={18} className="mr-2" />
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>

          {/* tab section */}
          <div className="w-[88%] mx-auto mt-8">
            <div className="flex border-b border-gray-200 bg-white rounded-t-lg">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 text-lg font-semibold font-[Poppins] transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-orange-500 text-black bg-gray-50"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-b-lg border border-gray-200 border-t-0 min-h-[400px]">
              {/* Products */}
              {activeTab === "Products" && (
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {products?.map((product: any) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  {products?.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg font-[Work Sans]">
                        No products available yet!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Offers */}
              {activeTab === "Offers" && (
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {events?.map((product: any) => (
                      <ProductCard
                        isEvent={true}
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>
                  {events?.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg font-[Work Sans]">
                        No offers available yet!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews */}
              {activeTab === "Reviews" && (
                <div className="p-6">
                  {reviews?.map((review: any) => (
                    <div
                      key={review.id}
                      className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            fill={i < review.rating ? "#eab308" : "#e5e7eb"}
                            className="text-yellow-500"
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-base font-[Work Sans] leading-relaxed mb-4">
                        {review.reviews}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
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
                          <span className="text-sm font-medium text-gray-800 font-[Poppins]">
                            {review.user.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 font-[Work Sans]">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {reviews?.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg font-[Work Sans]">
                        No reviews yet!
                      </p>
                    </div>
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
