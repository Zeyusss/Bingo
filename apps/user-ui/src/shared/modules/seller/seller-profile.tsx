"use client";
import { shops as PrismaShop } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ShopData = Omit<PrismaShop, "avatar"> & {
  avatar?: string | { url: string } | null;
};
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import {
  Calendar,
  Clock,
  Heart,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ProductCard from "../../components/cards/product-card";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import { sendKafkaEvent } from "apps/user-ui/src/actions/track-user";

const TABS = ["Products", "Offers", "Reviews"];

const SellerProfile = ({
  shop,
  followersCount,
  productsCount,
  eventsCount,
}: {
  shop: ShopData;
  followersCount: number;
  productsCount: number;
  eventsCount: number;
}) => {
  const [activeTab, setActiveTab] = useState("Products");
  const [followers, setFollowers] = useState(followersCount);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["seller-products", shop.id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-seller-products/${shop?.id}?page=1&limit=10`
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!shop?.id) return;
      try {
        const res = await axiosInstance.get(
          `/seller/api/is-following/${shop?.id}`
        );
        setIsFollowing(res.data.isFollowing !== null);
      } catch (error) {
        console.error("Failed to fetch follow status", error);
      }
    };
    fetchFollowStatus();
  }, [shop?.id]);

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["seller-events"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-seller-events/${shop?.id}?page=1&limit=10`
      );
      return res.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: reviews, isLoading: isReviewsLoading } = useQuery({
    queryKey: ["seller-reviews", shop.id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/seller/api/get-reviews/${shop?.id}?page=1&limit=10`
      );
      return res.data.reviews;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: userReview } = useQuery({
    queryKey: ["user-review", shop.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await axiosInstance.get(
        `/seller/api/get-user-review/${shop?.id}`
      );
      return res.data.userReview;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await axiosInstance.post(`/seller/api/unfollow-shop`, {
          shopId: shop?.id,
        });
      } else {
        await axiosInstance.post(`/seller/api/follow-shop`, {
          shopId: shop?.id,
        });
      }
    },
    onSuccess: () => {
      if (isFollowing) {
        setFollowers(followers - 1);
      } else {
        setFollowers(followers + 1);
      }
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ["is-following", shop?.id] });
    },
    onError: () => {
      console.error("Failed to follow/unfollow shop");
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/seller/api/create-review`, {
        shopId: shop?.id,
        rating: reviewRating,
        reviews: reviewText,
      });
    },
    onSuccess: () => {
      setReviewText("");
      setReviewRating(5);
      setShowReviewForm(false);
      queryClient.invalidateQueries({ queryKey: ["seller-reviews", shop?.id] });
      queryClient.invalidateQueries({
        queryKey: ["user-review", shop?.id, user?.id],
      });
    },
    onError: () => {
      console.error("Failed to create review");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      await axiosInstance.delete(`/seller/api/delete-review`, {
        data: { reviewId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-reviews", shop?.id] });
      queryClient.invalidateQueries({
        queryKey: ["user-review", shop?.id, user?.id],
      });
    },
    onError: () => {
      console.error("Failed to delete review");
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (!location || !deviceInfo || !user?.id) return;
      sendKafkaEvent({
        userId: user?.id,
        shopId: shop?.id,
        action: "shop_visit",
        country: location?.country || "Unknown",
        city: location?.city || "Unknown",
        device: deviceInfo || "Unknown",
      });
    }
  }, [location, deviceInfo, isLoading]);

  return (
    <div>
      <div className="relative w-full flex justify-center">
        <Image
          src={shop?.coverBanner || "https://ik.imagekit.io/w7lwh7wre/cover-handmade.webp?updatedAt=175424311149"}
          alt="Shop Cover Banner"
          className="w-full h-[400px] object-cover"
          width={1200}
          height={300}
        />
      </div>

      {/* seller header info */}
      <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex flex-col lg:flex-row gap-6">
        <div className="bg-gray-200 p-6 rounded-lg shadow-lg flex-1">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative w-[100px] h-[100px] rounded-full border-4 border-slate-300 overflow-hidden">
              <Image
                src={
                  typeof shop?.avatar === "string"
                    ? shop.avatar
                    : shop?.avatar?.url || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"
                }
                alt="Seller Avatar"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className="flex-1 w-full">
              <h1 className="text-2xl font-semibold text-slate-900">
                {shop?.name}
              </h1>
              <p className="text-slate-800 text-sm mt-1">
                {shop?.bio || "No bio available."}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-blue-400 gap-1">
                  <Star fill="#60a5fa" size={18} />{" "}
                  <span>{shop?.ratings || "N/A"}</span>
                </div>
                <div className="flex items-center text-slate-700 gap-1">
                  <Users size={18} /> <span>{followers} Followers</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 text-slate-700">
                <Clock size={18} />
                <span>{shop?.opening_hours || "Mon-Sat : 9 AM - 6 PM"}</span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-slate-700">
                <MapPin size={18} />{" "}
                <span>{shop?.address || "No address provided"}</span>
              </div>
            </div>
            {user && user.id !== shop.sellerId && (
              <button
                className={`px-6 py-2 h-[40px] rounded-lg font-semibold flex items-center gap-2 transition ${
                  isFollowing
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={() => toggleFollowMutation.mutate()}
                disabled={toggleFollowMutation.isPending}
              >
                <Heart size={18} />
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
          <h2 className="text-xl font-semibold text-slate-900">Shop Details</h2>
          <div className="flex items-center gap-3 mt-3 text-slate-700">
            <Calendar size={18} />
            <span>
              Joined At: {new Date(shop?.createdAt!).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* tab section */}
      <div className="w-[85%] lg:w-[70%] mx-auto mt-8">
        <div className="flex border-b border-gray-300">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 text-lg font-semibold ${
                activeTab === tab
                  ? "text-slate-800 border-b-2 border-blue-600"
                  : "text-slate-600"
              } transition`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-gray-200 rounded-lg my-4 text-slate-700">
          {/* Products */}
          {activeTab === "Products" && (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {isLoading &&
                Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                  />
                ))}
              {products?.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {products?.length === 0 && (
                <p className="py-2">No products available yet !</p>
              )}
            </div>
          )}

          {/* Offers */}
          {activeTab === "Offers" && (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {isEventsLoading &&
                Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                  />
                ))}
              {events?.map((product: any) => (
                <ProductCard
                  isEvent={true}
                  key={product.id}
                  product={product}
                />
              ))}
              {events?.length === 0 && (
                <p className="py-2">No offer available yet!</p>
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === "Reviews" && (
            <div className="p-4">
              {/* User's Review Section */}
              {user && userReview && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900">Your Review</h3>
                    <button
                      onClick={() => deleteReviewMutation.mutate(userReview.id)}
                      disabled={deleteReviewMutation.isPending}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleteReviewMutation.isPending
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < userReview.rating ? "#fbbf24" : "#e5e7eb"}
                        className="text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-slate-700">{userReview.reviews}</p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {new Date(userReview.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Seller Message */}
              {user && user.id === shop.sellerId && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    You cannot review your own shop.
                  </p>
                </div>
              )}

              {/* Review Form */}
              {user && !userReview && user.id !== shop.sellerId && (
                <div className="mb-6 p-4 bg-white rounded-lg border">
                  {!showReviewForm ? (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Write a Review
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Rating:</span>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setReviewRating(i + 1)}
                            className="focus:outline-none"
                          >
                            <Star
                              size={20}
                              fill={i < reviewRating ? "#fbbf24" : "#e5e7eb"}
                              className="text-yellow-400 hover:scale-110 transition"
                            />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your review..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => createReviewMutation.mutate()}
                          disabled={
                            !reviewText.trim() || createReviewMutation.isPending
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {createReviewMutation.isPending
                            ? "Submitting..."
                            : "Submit Review"}
                        </button>
                        <button
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewText("");
                            setReviewRating(5);
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {isReviewsLoading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-24 bg-gray-300 animate-pulse rounded-lg"
                    />
                  ))}
                </div>
              )}
              {reviews?.map((review: any) => (
                <div
                  key={review.id}
                  className="border-b border-gray-300 py-4 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <Image
                        src={review.user?.avatar?.url || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"}
                        alt={review.user?.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {review.user?.name || "Anonymous"}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < review.rating ? "#fbbf24" : "#e5e7eb"}
                                className="text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        {user && review.user?.id === user.id && (
                          <button
                            onClick={() =>
                              deleteReviewMutation.mutate(review.id)
                            }
                            disabled={deleteReviewMutation.isPending}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            {deleteReviewMutation.isPending
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        )}
                      </div>
                      <p className="text-slate-700 text-sm">{review.reviews}</p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {reviews?.length === 0 && (
                <p className="text-center py-5 text-slate-600">
                  No reviews available yet!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;
