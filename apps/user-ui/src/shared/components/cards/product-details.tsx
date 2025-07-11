"use client"
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import Ratings from "../ratings";

const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
    const [activeImage,setActiveImage] = useState(0);
    const router =  useRouter();
  return (
    <div
      className="fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50"
      onClick={() => setOpen(false)}
    >
      <div className="w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg"
      onClick={(e)=> e.stopPropagation()}
      >
      <div className="w-full flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 h-full">
        <Image
          src={data?.images?.[activeImage]?.url}
          alt={data?.images?.[activeImage]?.url}
          width={400}
          height={400}
          className="w-full rounded-lg object-contain"
        />
        <div className="flex gap-2 mt-4">
        {data?.images?.map((img:any,index:number)=>(
            <div className={`cursor-pointer border rounded-md ${activeImage === index ? "border-gray-500 p-1" : "border-transparent"}`
            
            } onClick={()=> setActiveImage(index)} key={index}>
            <Image
            src={img?.url}
             alt={`Thumbnail ${index}`}
            width={60}
            height={80}
            className="rounded-md"
            />
            </div>
        ))}
        </div>
      </div>
      <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
      <div className="border-b relative pb-3 border-gray-200 flex items-center justify-between">
      <div className="flex items-start gap-3">
      <Image
      src={data?.Shops?.avatar}
      alt="Shop Logo"
      width={60}
      height={60}
      className="rounded-full w-[60px] h-[60px] object-cover"
      />
      <div>
        <Link 
        href={`/shop/${data?.Shop?.id}`}
        className="text-lg font-medium"
        >
            {data?.Shop?.name}
        </Link>
        <span className="block mt-1">
            <Ratings rating={data?.Shop?.ratings}/>
        </span>
        <p className="text-gray-600 mt-1 flex items-center ">
            <MapPin size={20}/> {" "}
            {data?.Shop?.address || "Location Not Available"}
        </p>
      </div>
      </div>

      {/* <button className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
      onClick={()=> router.push(`/inbox?shopId=${data?.Shop?.id}`)}
      >
      Chat With Seller
      </button> */}

      </div>
      </div>
      </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;
