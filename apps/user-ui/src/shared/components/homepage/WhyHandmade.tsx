"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const WhyHandmade = () => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (showVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showVideo]);

  return (
    <section className="py-16 px-4 md:px-20 lg:px-28 relative font-worksans">
      <div className="mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1c] mb-5">
          Why Buy Handmade?
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="md:w-1/2 relative">
            <Image
              src="/assets/whychoosehandmade/whychooseus.webp"
              alt="Chair"
              width={500}
              height={500}
              className="w-full h-auto"
            />
          </div>

          <div className="md:w-1/2">
            <p className="text-gray-700 mb-3 font-bold">
              Bingo — Where soulful finds meet everyday needs.
            </p>

            <p className="text-gray-500 mb-3">
              Handmade, Heartmade is more than just a shop – it’s a celebration
              of soulful craftsmanship. Every product you’ll find here is
              lovingly handcrafted, designed to carry the warmth, story, and
              spirit of its maker. Whether you’re searching for a heartfelt gift
              or something special for yourself, you’ll discover pieces that
              feel personal, purposeful, and full of heart.
            </p>

            <ul className="pl-10 space-y-2 mb-5 list-disc marker:text-[#ff8a00]">
              <li className="text-[#777] leading-[26px]">
                Support independent artisans and small businesses
              </li>
              <li className="text-[#777] leading-[26px]">
                Unique, one-of-a-kind products crafted with care
              </li>
              <li className="text-[#777] leading-[26px]">
                Eco-friendly and sustainable choices
              </li>
              <li className="text-[#777] leading-[26px]">
                High quality, made with love
              </li>
            </ul>

            <div className="relative overflow-hidden rounded-[100px] w-full max-w-xl">
              <Image
                src="/assets/whychoosehandmade/choosing-video.webp"
                alt="Video Preview"
                width={800}
                height={500}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white text-center px-4">
                <p className="text-sm">How choose HandMade</p>
                <h3 className="text-2xl font-bold">
                  Bingo HandMade collection
                </h3>
                <button
                  onClick={() => setShowVideo(true)}
                  className="mt-4 p-3 bg-white rounded-full shadow text-black hover:scale-105 transition"
                >
                  <Play className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1000]">
          <div className="relative w-full max-w-4xl mx-4">
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
              <iframe
                src="https://www.youtube.com/embed/cJ61qnMgX4c?autoplay=1"
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white hover:bg-black/70 rounded-full p-2 text-2xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default WhyHandmade;