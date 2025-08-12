"use client"
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, MessageCircle, ShoppingBag, X } from "lucide-react";
import Ratings from "../ratings";
import { useStore } from "apps/user-ui/src/store";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { isProtected } from "apps/user-ui/src/utils/protected";



const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || "");
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isLoading,setIsLoading] = useState(false);
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

    const { user } = useUser();
  const location = useLocationTracking()
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const showPersonalizationPrompt = useStore((state: any) => state.showPersonalizationPrompt);
  const { showChatLoginPrompt } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);


  useEffect(() => {
    modalRef.current?.focus();
  }, []);



  const handleChat = async ()=>{
    if(isLoading){
      return;
    }


    if (!user) {
      showChatLoginPrompt();
      return;
    }

    setIsLoading(true);
    
    
    const sellerId = data?.Shop?.sellerId || 
                    data?.shop?.sellerId || 
                    data?.sellerId ||
                    data?.shopId;
    

    
    if (!sellerId) {
      console.error('No sellerId found in product data:', data);
      alert('Unable to start conversation: Seller information not available.');
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await axiosInstance.post("/chatting/api/create-user-conversationGroup",{sellerId: data?.Shop?.sellerId},isProtected)
      router.push(`/inbox?conversationId=${res.data.conversation.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      alert("Failed to start conversation. Please try again.");
    }finally{
      setIsLoading(false)
    }
  }
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-fadeIn"
      onClick={() => setOpen(false)}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 animate-scaleIn max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        tabIndex={0}
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 shadow transition focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
          onClick={() => setOpen(false)}
          aria-label="Close product details"
        >
          <X size={24} />
        </button>
        <div className="flex-1 lg:max-w-lg">
          <div className="w-full aspect-square bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
            <Image
              src={data?.images?.[activeImage]?.url || "https://via.placeholder.com/400x400?text=No+Image"}
              alt={data?.title || "Product image"}
              width={400}
              height={400}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/400x400?text=No+Image";
              }}
            />
          </div>
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            {data?.images?.map((img: any, index: number) => (
              <button
                key={img?.url || index}
                className={`border-2 rounded-md p-1 transition-all duration-150 ${activeImage === index ? "border-blue-500 bg-blue-50 scale-105" : "border-transparent"}`}
                onClick={() => setActiveImage(index)}
                aria-label={`Show image ${index + 1}`}
              >
                <Image
                  src={img?.url || "https://via.placeholder.com/60x60?text=No+Image"}
                  alt={`Thumbnail ${index + 1}`}
                  width={60}
                  height={60}
                  className="rounded-md object-cover w-12 h-12"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/60x60?text=No+Image";
                  }}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 lg:max-w-md space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
            <Image
              src={data?.Shop?.avatar?.url || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"}
              alt={data?.Shop?.name || "Shop Logo"}
              width={48}
              height={48}
              className="rounded-full w-12 h-12 object-cover border-2 border-white shadow-sm flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <Link
                href={`/shop/${data?.Shop?.id}`}
                className="text-lg font-semibold text-blue-700 hover:underline block truncate"
              >
                {data?.Shop?.name || "Shop Name"}
              </Link>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600 mt-1">
                <Ratings rating={data?.Shop?.ratings || 0} showTextFallback={true} />
                <span className="flex items-center text-gray-500">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{data?.Shop?.address || data?.Shop?.location || "Location Not Set"}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{data?.title}</h2>
            {data?.brand && (
              <p className="text-sm text-gray-500"><strong>Brand:</strong> {data.brand}</p>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold text-green-600">
              ${data?.sale_price || data?.regular_price || 0}
            </span>
            {data?.regular_price && data?.sale_price && data.regular_price > data.sale_price && (
              <span className="text-lg text-gray-400 line-through">${data.regular_price}</span>
            )}
            <div className="flex items-center">
              <Ratings rating={typeof data?.ratings === 'number' ? data.ratings : 0} showTextFallback={true} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 py-2 bg-white min-w-[3rem] text-center">{quantity}</span>
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => setQuantity(q => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-700 text-sm leading-relaxed">
              {data?.short_description || "No description available."}
            </p>
          </div>
          <div className="space-y-4">
            {data?.colors?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Color:</h4>
                <div className="flex flex-wrap gap-2">
                  {data.colors.map((color: string) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isSelected === color ? "border-blue-500 scale-110 shadow-lg" : "border-gray-300 hover:border-gray-400"}`}
                      onClick={() => setIsSelected(color)}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            {data?.sizes?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Size:</h4>
                <div className="flex flex-wrap gap-2">
                  {data.sizes.map((size: string) => (
                    <button
                      key={size}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isSizeSelected === size ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"}`}
                      onClick={() => setIsSizeSelected(size)}
                      aria-label={`Select size ${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              onClick={() => handleChat()}
              disabled={isLoading}
            >
              <MessageCircle size={18} /> 
              {isLoading ? "Loading..." : "Chat With Seller"}
            </button>
            <button
             onClick={ ()=> {
              // Check if product requires personalization
              if (data.personalizationEnabled && data.personalizationRequired) {
                showPersonalizationPrompt('required', data);
                return;
              }
              
              // Check if product has personalization enabled (optional)
              if (data.personalizationEnabled && !data.personalizationRequired) {
                showPersonalizationPrompt('optional', data);
                return;
              }

              addToCart({
                ...data,
                quantity,
                selectedOptions:{
                color:isSelected,
                  size: isSizeSelected
                },
                price: data.sale_price || data.regular_price
               },
              user,
              location,
              deviceInfo
              )
             }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#FF8A00] hover:bg-[#E17800] text-white font-semibold shadow-md transition-colors flex-1">
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;