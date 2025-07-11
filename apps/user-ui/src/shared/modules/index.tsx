"use client";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Hero = () => {
  const router = useRouter();

  return (
    <div className="bg-[#115061] min-h-[85vh] flex items-center w-full">
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center gap-10 md:gap-20">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <p className="text-white text-lg md:text-xl font-medium font-Roboto mb-2">
            Starting from <span className="text-yellow-400">$40</span>
          </p>
          <h1 className="text-white text-4xl md:text-6xl font-extrabold font-Roboto leading-tight">
            The best Handmade <br /> Collection 2025
          </h1>
          <p className="font-Oregano text-2xl md:text-3xl text-white mt-4">
            Exclusive offer <span className="text-yellow-400 font-bold">10%</span> this week
          </p>

          <button
            onClick={() => router.push("/products")}
            className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-yellow-500 transition-all"
          >
            Shop Now <MoveRight />
          </button>
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <Image
            src="https://ik.imagekit.io/zeyuss/products/product-1752056081205_JDnTdfMxS.jpg?updatedAt=1752056150100"
            alt="Handmade Product"
            width={450}
            height={450}
            className="rounded-xl shadow-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
