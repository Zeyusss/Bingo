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
  setIsLoading(true);
  try {
    const res = await axiosInstance.post("/chatting/api/create-user-conversationGroup",{sellerId:data?.Shop?.sellerId},isProtected)
  router.push(`/inbox?conversationId=${res.data.conversation.id}`);
  } catch (error) {
    console.log(error);
  }finally{
    setIsLoading(false)
  }
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all animate-fadeIn"
      onClick={() => setOpen(false)}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 animate-scaleIn"
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
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full flex justify-center">
            <Image
              src={data?.images?.[activeImage]?.url}
              alt={data?.title}
              width={400}
              height={400}
              className="rounded-xl object-contain border border-gray-200 shadow-md max-h-[350px] bg-gray-50"
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
                  src={img?.url}
                  alt={`Thumbnail ${index}`}
                  width={60}
                  height={60}
                  className="rounded-md object-cover w-12 h-12"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 min-w-[250px]">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src={data?.Shop?.avatar}
              alt="Shop Logo"
              width={48}
              height={48}
              className="rounded-full w-12 h-12 object-cover border border-gray-200"
            />
            <div>
              <Link
                href={`/shop/${data?.Shop?.id}`}
                className="text-lg font-semibold text-blue-700 hover:underline"
              >
                {data?.Shop?.name}
              </Link>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Ratings rating={data?.Shop?.ratings} />
                <span className="ml-2 flex items-center"><MapPin size={16} className="mr-1" />{data?.Shop?.address || "Location Not Available"}</span>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">{data?.title}</h2>
          {data?.brand && (
            <p className="text-sm text-gray-500"><strong>Brand:</strong> {data.brand}</p>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-2xl font-bold text-green-600">${data?.sale_price}</span>
            {data?.regular_price && data.regular_price > data.sale_price && (
              <span className="text-lg text-gray-400 line-through">${data.regular_price}</span>
            )}
            <span className="ml-2"><Ratings rating={typeof data?.ratings === 'number' ? data.ratings : 5} /></span>
          </div>

          <div className="flex items-center  mt-4">
            <span className="font-medium mr-2">Quantity :</span>
            <button
              type="button"
              className="px-3 py-1 cursor-pointer rounded-md border border-gray-300 bg-gray-300 hover:bg-gray-200"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-4 bg-gray-100 py-1">{quantity}</span>
            <button
              type="button"
              className="px-2 py-1 rounded-md  border border-gray-300 cursor-pointer bg-gray-300 hover:bg-gray-200"
              onClick={() => setQuantity(q => q + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap w-full text-base">
            {data?.short_description}
          </p>
          <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
            {data?.colors?.length > 0 && (
              <div>
                <strong>Color:</strong>
                <div className="flex gap-2 mt-1">
                  {data.colors.map((color: string) => (
                    <button
                      key={color}
                      className={`w-8 h-8 cursor-pointer rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isSelected === color ? "border-blue-500 scale-110 shadow-md" : "border-gray-200"}`}
                      onClick={() => setIsSelected(color)}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
            {data?.sizes?.length > 0 && (
              <div>
                <strong>Size:</strong>
                <div className="flex gap-2 mt-1">
                  {data.sizes.map((size: string) => (
                    <button
                      key={size}
                      className={`px-3 py-1 rounded border-2 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isSizeSelected === size ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700"}`}
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
          <div className="flex gap-3 mt-6">
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
              onClick={() => handleChat()}
            >
              <MessageCircle size={18} /> Chat With Seller
            </button>
            <button
             onClick={ ()=> addToCart({
              ...data,
              quantity,
              selectedOptions:{
              color:isSelected,
                size: isSizeSelected
              },
             },
            user,
            location,
            deviceInfo
            )
             }
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow transition">
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
