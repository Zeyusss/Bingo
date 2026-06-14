"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import useUser from "../../../hooks/useUser";

const ProductReviews = ({ productId }: { productId: string }) => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { data: reviews, isLoading: isReviewsLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/product/api/get-reviews/${productId}?page=1&limit=10`
      );
      return res.data.reviews;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!productId,
  });

  const { data: userReview } = useQuery({
    queryKey: ["product-user-review", productId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await axiosInstance.get(
        `/product/api/get-user-review/${productId}`
      );
      return res.data.userReview;
    },
    enabled: !!user?.id && !!productId,
    staleTime: 1000 * 60 * 5,
  });

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/product/api/create-review`, {
        productId,
        rating: reviewRating,
        reviews: reviewText,
      });
    },
    onSuccess: () => {
      setReviewText("");
      setReviewRating(5);
      setShowReviewForm(false);
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-user-review", productId, user?.id] });
    },
    onError: () => {
      console.error("Failed to create review");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      await axiosInstance.delete(`/product/api/delete-review`, {
        data: { reviewId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-user-review", productId, user?.id] });
    },
    onError: () => {
      console.error("Failed to delete review");
    },
  });

  return (
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
              {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
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

      {/* Review Form */}
      {user && !userReview && (
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
                  disabled={!reviewText.trim() || createReviewMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
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
            <div key={index} className="h-24 bg-gray-300 animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {reviews?.map((review: any) => (
        <div key={review.id} className="border-b border-gray-300 py-4 last:border-b-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <Image
                src={review.user?.avatar?.url || "/assets/default-avatar.svg"}
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
                    onClick={() => deleteReviewMutation.mutate(review.id)}
                    disabled={deleteReviewMutation.isPending}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
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
        <p className="text-center py-5 text-slate-600">No reviews available yet!</p>
      )}
    </div>
  );
};

export default ProductReviews;
