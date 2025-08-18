"use client";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  Scale,
  Star,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Ratings from "../../components/ratings";
import Link from "next/link";
import { useStore } from "apps/user-ui/src/store";
import CartBagIcon from "apps/user-ui/src/assets/svgs/cart-icon";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import ProductCard from "../../components/cards/product-card";
import ProductListAnimator from "../../components/animations/ProductListAnimator";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { useComparisonStore } from "../../../store/comparisonStore";
import { isProtected } from "apps/user-ui/src/utils/protected";
import { useRouter } from "next/navigation";

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const { user, isLoading } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const router = useRouter();
  const { addProduct, removeProduct, isProductInComparison, canAddMore } = useComparisonStore();
  const isInComparison = isProductInComparison(productDetails.id);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images[0]?.url
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [specsPage, setSpecsPage] = useState(1);
  const [propsPage, setPropsPage] = useState(1);
  const itemsPerPage = 5;

  const [isSelected, setIsSelected] = useState(
    productDetails?.colors?.[0] || ""
  );
  const [isSizeSelected, setIsSizeSelected] = useState(
    productDetails?.sizes?.[0] || ""
  );
  const [quantity, setQuantity] = useState(1);

  const [personalizationText, setPersonalizationText] = useState("");

  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some(
    (item: any) => item.id === productDetails.id
  );

  type Review = {
    id: string;
    rating: number;
    title?: string | null;
    comment?: string | null;
    images?: string[];
    createdAt: string;
    user?: { id: string; name: string; avatar?: { url?: string } | null };
  };

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [averageRating, setAverageRating] = useState<number>(productDetails?.ratings || 0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [reviewHoverRating, setReviewHoverRating] = useState<number | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await axiosInstance.get(`/product/api/products/${productDetails.id}/reviews`, {
        params: { page: reviewsPage, limit: 10 },
      });
      setReviews(res.data.reviews || []);
      setReviewsTotalPages(res.data?.pagination?.totalPages || 1);
      setAverageRating(res.data?.average ?? productDetails?.ratings ?? 0);
    } catch (error) {
      // silent fail for now
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (productDetails?.id) {
      fetchReviews();
    }
  }, [productDetails?.id, reviewsPage]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSubmitting(true);
      if (editingReviewId) {
        await axiosInstance.put(
          `/product/api/reviews/${editingReviewId}`,
          {
            rating: Number(reviewForm.rating),
            title: reviewForm.title?.trim() || undefined,
            comment: reviewForm.comment?.trim() || undefined,
          },
          isProtected
        );
      } else {
        await axiosInstance.post(
          `/product/api/products/${productDetails.id}/reviews`,
          {
            rating: Number(reviewForm.rating),
            title: reviewForm.title?.trim() || undefined,
            comment: reviewForm.comment?.trim() || undefined,
          },
          isProtected
        );
      }
      setReviewForm({ rating: 5, title: "", comment: "" });
      setReviewsPage(1);
      setEditingReviewId(null);
      await fetchReviews();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          (editingReviewId ? "Failed to update review." : "Failed to submit review. You may have already reviewed this product.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const startEditReview = (r: Review) => {
    setEditingReviewId(r.id);
    setReviewForm({ rating: r.rating, title: r.title || "", comment: r.comment || "" });
    // Scroll to form
    const el = document.getElementById('reviews');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setReviewForm({ rating: 5, title: "", comment: "" });
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Delete your review?')) return;
    try {
      await axiosInstance.delete(`/product/api/reviews/${reviewId}`, isProtected);
      if (editingReviewId === reviewId) cancelEdit();
      await fetchReviews();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete review.');
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(productDetails?.images[currentIndex - 1]?.url)
    }
  };
  const nextImage = () => {
    if (currentIndex < productDetails?.images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(productDetails?.images[currentIndex + 1]?.url)
    }
  };

  const discountPercentage = Math.round(
    ((productDetails.regular_price - productDetails.sale_price) /
      productDetails.regular_price) *
      100
  );


  const hasCustomSpecs = productDetails?.custom_specifications && 
    Array.isArray(productDetails.custom_specifications) && 
    productDetails.custom_specifications.length > 0;
  
  const hasCustomProps = productDetails?.custom_properties && 
    Array.isArray(productDetails.custom_properties) && 
    productDetails.custom_properties.length > 0;

  const getSpecsEntries = () => {
    if (!hasCustomSpecs) return [];
    return productDetails.custom_specifications.map((spec: any) => [spec.name, spec.value]);
  };

  const getPropsEntries = () => {
    if (!hasCustomProps) return [];
    return productDetails.custom_properties.map((prop: any) => [
      prop.label, 
      Array.isArray(prop.values) ? prop.values.join(', ') : prop.values
    ]);
  };

  const getPaginatedSpecs = () => {
    const specs = getSpecsEntries();
    const startIndex = (specsPage - 1) * itemsPerPage;
    return specs.slice(startIndex, startIndex + itemsPerPage);
  };

  const getPaginatedProps = () => {
    const props = getPropsEntries();
    const startIndex = (propsPage - 1) * itemsPerPage;
    return props.slice(startIndex, startIndex + itemsPerPage);
  };

  const getSpecsTotalPages = () => Math.ceil(getSpecsEntries().length / itemsPerPage);
  const getPropsTotalPages = () => Math.ceil(getPropsEntries().length / itemsPerPage);

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();
      query.set("page", "1");
      query.set("limit", "5");

      const res = await axiosInstance.get(
        `/product/api/get-filtered-products?${query.toString()}`
      );
      setRecommendedProducts(res.data.products);
    } catch (error) {

    }
  };
  useEffect(() => {
    fetchFilteredProducts();
  }, []);

  const { showChatLoginPrompt } = useStore();

  const handleChat = async () => {
    if (isChatLoading) {
      return;
    }


    if (!user) {
      showChatLoginPrompt();
      return;
    }

    setIsChatLoading(true);
    try {
      const res = await axiosInstance.post(
        "/chatting/api/create-user-conversationGroup",
        { sellerId: productDetails?.Shop?.sellerId },
        isProtected
      );
      router.push(`/inbox?conversationId=${res.data.conversation.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to start conversation. Please try again.");
    } finally {
      setIsChatLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-700">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {productDetails?.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="relative">
              <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={currentImage}
                  alt={productDetails?.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                {productDetails?.images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={
                        currentIndex === productDetails?.images.length - 1
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="flex space-x-2 mt-4">
                {productDetails?.images?.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setCurrentImage(img?.url);
                    }}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImage === img
                        ? "border-orange-500"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img?.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Product Information */}
          <div className="space-y-6">
            {/* Brand */}
            <div className="text-right">
              <span className="text-gray-600 font-medium">
                {productDetails?.brand ||
                  productDetails?.Shop?.brand ||
                  "No Brand"}
              </span>
            </div>

            {/* Title and SKU */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {productDetails?.title}
              </h1>
              <p className="text-gray-600">
                <span className="font-medium">SKU:</span>{" "}
                {productDetails?.id || "N/A"}
              </p>
            </div>

            {/* Rating and Reviews */}
            <div className="p-4">
              <h1 className="text-xl mb-2 font-medium">{productDetails?.title}</h1>
              <div className="w-full flex items-center justify-between">
                <div className="flex gap-2 mt-2 text-yellow-500">
                  <Ratings rating={averageRating || productDetails?.ratings} />
                </div>
                <Link
                  href="#reviews"
                  className="text-blue-600 hover:underline text-sm"
                >
                  ({reviews.length} customer review
                  {reviews.length !== 1 ? "s" : ""})
                </Link>
              </div>
            </div>

            {/* Collection Badge */}
            <div className="inline-flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-full">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  {productDetails?.subCategory || "Collection"}
                </p>

                <p className="text-xs text-orange-600">
                  Hurry and get discounts up to 20%{" "}
                  <button className="underline font-medium">Read more</button>
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">
              {productDetails?.short_description ||
                "The compact and well-proportioned silhouette of both the seats and the small sofa, opens up to a new way of using the dining space: as a living room within the living room, a hybrid situation."}
            </p>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-4xl font-bold text-orange-500">
                ${productDetails?.sale_price}
              </div>
              {productDetails?.regular_price > productDetails?.sale_price && (
                <div className="flex items-center space-x-2">
                  <span className="text-xl text-gray-400 line-through">
                    ${productDetails?.regular_price}
                  </span>
                  <span className="text-red-600 font-medium">
                    -{discountPercentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-4">
              {/* Colors */}
              {productDetails?.colors?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex space-x-2">
                    {productDetails?.colors?.map(
                      (color: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setIsSelected(color)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            isSelected === color
                              ? "border-gray-800 scale-110 shadow-lg"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {productDetails?.sizes?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <div className="flex space-x-2">
                    {productDetails.sizes.map((size: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setIsSizeSelected(size)}
                        className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                          isSizeSelected === size
                            ? "border-gray-800 bg-gray-800 text-white"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and Stock */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(prev + 1, productDetails?.stock || 0))}
                  className={`px-3 py-2 transition-colors ${
                    quantity >= (productDetails?.stock || 0)
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'hover:bg-gray-50'
                  }`}
                  disabled={quantity >= (productDetails?.stock || 0)}
                >
                  +
                </button>
              </div>
              {productDetails?.stock > 0 ? (
                <span className="text-green-600 font-medium">
                  In Stock ({productDetails?.stock} available)
                </span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Product Personalization Section - Show if personalization is enabled */}
            {productDetails?.personalizationEnabled && (
              <div className="space-y-3 p-4 border border-orange-200 rounded-lg bg-orange-50">
                <h4 className="font-semibold text-gray-900">Personalize Your Product</h4>
                
                {/* Display seller's personalization instructions */}
                {productDetails.personalizationInstructions && (
                  <div className="text-sm text-gray-600 bg-white p-3 rounded border-l-4 border-orange-400">
                    <strong>Instructions:</strong> {productDetails.personalizationInstructions}
                  </div>
                )}
                
                {/* Personalization input textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Personalization Details
                    {productDetails.personalizationRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    value={personalizationText}
                    onChange={(e) => setPersonalizationText(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your personalization details here..."
                  />
                  {productDetails.personalizationRequired && !personalizationText.trim() && (
                    <p className="text-red-500 text-sm mt-1">Personalization is required for this product</p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (productDetails?.personalizationRequired && !personalizationText.trim()) {
                      alert('Please provide personalization details before adding to cart.');
                      return;
                    }
                    
                    addToCart(
                      {
                        ...productDetails,
                        price: productDetails.sale_price || productDetails.regular_price,
                        quantity,
                        selectedOptions: {
                          color: isSelected,
                          size: isSizeSelected,
                        },
                        personalizationData: productDetails?.personalizationEnabled ? {
                          text: personalizationText.trim(),
                          instructions: productDetails.personalizationInstructions
                        } : null,
                      },
                      user,
                      location,
                      deviceInfo
                    )
                  }}
                  disabled={productDetails?.stock === 0 || (productDetails?.personalizationRequired && !personalizationText.trim())}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CartBagIcon />
                  <span>Add to cart</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex justify-center space-x-6 text-sm">
                <button
                  onClick={() =>
                    isWishlisted
                      ? removeFromWishlist(
                          productDetails.id,
                          user,
                          location,
                          deviceInfo
                        )
                      : addToWishlist(
                          { ...productDetails, quantity: 1 },
                          user,
                          location,
                          deviceInfo
                        )
                  }
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Heart
                    size={16}
                    fill={isWishlisted ? "currentColor" : "none"}
                    className={isWishlisted ? "text-red-500" : ""}
                  />
                  <span>Add to wishlist</span>
                </button>
                <button 
                  onClick={() => {
                    if (isInComparison) {
                      removeProduct(productDetails.id);
                    } else if (canAddMore()) {
                      addProduct({
                        id: productDetails.id,
                        title: productDetails.title,
                        slug: productDetails.slug,
                        sale_price: productDetails.sale_price || productDetails.regular_price,
                        regular_price: productDetails.regular_price,
                        images: productDetails.images || [],
                        Shop: productDetails.Shop || { id: '', name: '', avatar: null },
                        ratings: productDetails.ratings || 0,
                        stock: productDetails.stock || 0,
                        category: productDetails.category || '',
                        tags: productDetails.tags || [],
                        specifications: productDetails.specifications || {},
                        customProperties: productDetails.customProperties || {},
                        personalizationEnabled: productDetails.personalizationEnabled || false,
                        personalizationRequired: productDetails.personalizationRequired || false,
                        personalizationInstructions: productDetails.personalizationInstructions || '',
                        addedAt: Date.now(),
                        lastViewed: Date.now(),
                        source: 'product_page'
                      }, 'product_page');
                    }
                  }}
                  disabled={!canAddMore() && !isInComparison}
                  className={`flex items-center space-x-1 transition-colors ${
                    isInComparison 
                      ? 'text-blue-600 hover:text-blue-800' 
                      : canAddMore() 
                        ? 'text-gray-600 hover:text-gray-800' 
                        : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Scale size={16} />
                  <span>
                    {isInComparison ? 'Remove from compare' : canAddMore() ? 'Add to compare' : 'Compare limit reached'}
                  </span>
                </button>
              </div>
            </div>

            {/* Shipping and Returns */}
            <div className="border-t pt-6">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer py-3 text-gray-900 font-medium">
                  <span>Shipping and returns</span>
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-2 text-sm text-gray-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} />
                    <span>
                      Delivery to {location?.city}, {location?.country}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package size={16} />
                    <span>7 Days Returns</span>
                  </div>
                </div>
              </details>
            </div>

            {/* Product Care */}
            <div className="border-t">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer py-3 text-gray-900 font-medium">
                  <span>Product care</span>
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    Clean with a soft, dry cloth. Avoid harsh chemicals and
                    direct sunlight.
                  </p>
                </div>
              </details>
            </div>

            {/* Seller Info */}
            <div className="border-t pt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={productDetails?.Shop?.avatar?.url || '/assets/HomeSlider/profile.webp'}
                        alt={productDetails?.Shop?.name || 'Shop'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/HomeSlider/profile.webp';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sold by</p>
                      <p className="font-medium text-lg">
                        {productDetails?.Shop?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleChat}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <MessageSquareText size={16} />
                    <span>Chat Now</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                  <div>
                    <p className="text-xs text-gray-500">Seller Rating</p>
                    <p className="font-semibold">88%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ship on Time</p>
                    <p className="font-semibold">100%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Chat Response</p>
                    <p className="font-semibold">100%</p>
                  </div>
                </div>
                <div className="text-center mt-4 border-t pt-4">
                  <Link
                    href={`/shop/${productDetails?.Shop.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                  >
                    GO TO STORE
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "details"
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Product details
            </button>
            <button
              onClick={() => setActiveTab("description")}
              className={`px-6 py-4 font-medium text-sm transition-colors ${
                activeTab === "description"
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Description
            </button>
            {hasCustomSpecs && (
              <button
                onClick={() => setActiveTab("specifications")}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === "specifications"
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Specifications
              </button>
            )}
            {hasCustomProps && (
              <button
                onClick={() => setActiveTab("properties")}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === "properties"
                    ? "border-b-2 border-orange-500 text-orange-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Properties
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "details" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-6">
                    Product details of {productDetails?.title}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Brand</span>
                      <span className="font-medium">
                        {productDetails?.brand ||
                          productDetails?.Shop?.brand ||
                          "No Shop Info"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">SKU</span>
                      <span className="font-medium">{productDetails?.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Stock</span>
                      <span className="font-medium">
                        {productDetails?.stock} pieces
                      </span>
                    </div>
                    {productDetails?.colors?.length > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Colors</span>
                        <div className="flex space-x-1">
                          {productDetails.colors.map(
                            (color: string, index: number) => (
                              <div
                                key={index}
                                className="w-5 h-5 rounded-full border border-gray-300"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}
                    {productDetails?.sizes?.length > 0 && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Sizes</span>
                        <span className="font-medium">
                          {productDetails.sizes.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={currentImage}
                    alt={productDetails?.title}
                    className="w-full object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {activeTab === "description" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div
                  className="prose prose-sm text-gray-700 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      productDetails?.detailed_description ||
                      "No detailed description available.",
                  }}
                />
              </div>
            )}

            {activeTab === "specifications" && hasCustomSpecs && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Custom Specifications</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedSpecs().map(([key, value]: [string, any], index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination for Specifications */}
                {getSpecsTotalPages() > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {((specsPage - 1) * itemsPerPage) + 1} to {Math.min(specsPage * itemsPerPage, getSpecsEntries().length)} of {getSpecsEntries().length} specifications
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSpecsPage(Math.max(1, specsPage - 1))}
                        disabled={specsPage === 1}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm bg-orange-500 text-white rounded">
                        {specsPage} of {getSpecsTotalPages()}
                      </span>
                      <button
                        onClick={() => setSpecsPage(Math.min(getSpecsTotalPages(), specsPage + 1))}
                        disabled={specsPage === getSpecsTotalPages()}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "properties" && hasCustomProps && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Custom Properties</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Label
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPaginatedProps().map(([key, value]: [string, any], index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination for Properties */}
                {getPropsTotalPages() > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-700">
                      Showing {((propsPage - 1) * itemsPerPage) + 1} to {Math.min(propsPage * itemsPerPage, getPropsEntries().length)} of {getPropsEntries().length} properties
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPropsPage(Math.max(1, propsPage - 1))}
                        disabled={propsPage === 1}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm bg-orange-500 text-white rounded">
                        {propsPage} of {getPropsTotalPages()}
                      </span>
                      <button
                        onClick={() => setPropsPage(Math.min(getPropsTotalPages(), propsPage + 1))}
                        disabled={propsPage === getPropsTotalPages()}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* about brand */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-6">About Shop</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="relative">
                <Image
                  src={productDetails?.Shop?.coverBanner || "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"}
                  alt={productDetails?.Shop?.name || "Shop"}
                  width={800}
                  height={256}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg";
                  }}
                />
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">
                  {productDetails?.Shop?.name || "No Brand"}
                </h4>
                <p className="text-gray-600 mb-4">
                  {productDetails?.Shop?.bio ||
                    "No description available for this shop."}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <Link href={`/seller/${productDetails?.Shop?.sellers?.[0]?.id || productDetails?.Shop?.id}`} className="text-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <div className="w-8 h-8 bg-orange-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Package className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="font-medium text-sm">Products</p>
                  </Link>
                  <Link href={`/seller/${productDetails?.Shop?.sellers?.[0]?.id || productDetails?.Shop?.id}#reviews`} className="text-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                    <div className="w-8 h-8 bg-orange-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Star className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="font-medium text-sm">Quality</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Ratings & Reviews of {productDetails?.title}</h3>
            <div className="flex items-center gap-2 text-yellow-500">
              <Ratings rating={averageRating || productDetails?.ratings} />
              <span className="text-sm text-gray-600">Avg {Number(averageRating || productDetails?.ratings || 0).toFixed(1)}</span>
            </div>
          </div>

          {user && (
            <form onSubmit={submitReview} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Write a review</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map((r) => {
                      const active = (reviewHoverRating ?? reviewForm.rating) >= r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onMouseEnter={() => setReviewHoverRating(r)}
                          onMouseLeave={() => setReviewHoverRating(null)}
                          onClick={() => setReviewForm((f) => ({ ...f, rating: r }))}
                          className={`p-1 transition-colors ${active ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                          aria-label={`${r} star${r>1?"s":""}`}
                        >
                          <Star className="w-6 h-6" />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-sm text-gray-600">{reviewForm.rating} / 5</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title (optional)</label>
                  <input
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full border rounded-md p-2"
                    placeholder="Great product!"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-gray-700 mb-1">Comment (optional)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  rows={3}
                  className="w-full border rounded-md p-2"
                  placeholder="Share your experience..."
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  disabled={submitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                  type="submit"
                >
                  {submitting
                    ? editingReviewId ? "Updating..." : "Submitting..."
                    : editingReviewId ? "Update Review" : "Submit Review"}
                </button>
                {editingReviewId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="py-2 px-4 rounded-md border text-gray-700 hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {reviewsLoading ? (
            <p className="text-gray-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No reviews yet. Be the first to review this product.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.user?.avatar?.url || "/assets/HomeSlider/profile.webp"}
                        alt={r.user?.name || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm">{r.user?.name || "Anonymous"}</p>
                        <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-yellow-500"><Ratings rating={r.rating} /></div>
                      {r.user?.id === user?.id && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditReview(r)}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteReview(r.id)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                  {r.comment && <p className="text-gray-700 text-sm mt-1">{r.comment}</p>}
                </div>
              ))}

              {reviewsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                    disabled={reviewsPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">Page {reviewsPage} of {reviewsTotalPages}</span>
                  <button
                    onClick={() => setReviewsPage((p) => Math.min(reviewsTotalPages, p + 1))}
                    disabled={reviewsPage === reviewsTotalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h3 className="text-xl font-semibold mb-6">You may also like</h3>
          <ProductListAnimator
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            listKey={`related-products-${productDetails?.id}`}
            staggerDelay={0.08}
            animationDuration={0.4}
            layout="grid"
          >
            {recommendedProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductListAnimator>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
