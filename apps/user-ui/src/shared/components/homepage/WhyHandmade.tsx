"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

const WhyHandmade = () => {
  const [showVideo, setShowVideo] = useState(false);
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!showVideo) return;

    // 1) Remember current scroll
    scrollYRef.current = window.scrollY;

    // 2) Lock the page (works well on iOS/Android too)
    const { style } = document.body;
    const prev = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
    };

    style.overflow = "hidden";
    style.position = "fixed";
    style.top = `-${scrollYRef.current}px`;
    style.width = "100%";

    return () => {
      // 3) Restore
      style.overflow = prev.overflow;
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [showVideo]);

  return (
    <section className="py-16 px-4 md:px-20 lg:px-28 relative z-0 font-worksans">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#1c1c1c] mb-5">
          Why Buy Handmade?
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left Image */}
          <div className="md:w-1/2 relative">
            <Image
              src="/assets/whychoosehandmade/whychooseus.webp"
              alt="Chair"
              width={500}
              height={500}
              className="w-full h-auto"
            />
          </div>

          {/* Right Text & Video */}
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

            {/* Video Preview */}
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

      {/* Video Modal */}
      {showVideo && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center overscroll-contain touch-none"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowVideo(false);
          }}
          onWheel={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        >
          <div className="relative w-full max-w-5xl mx-auto p-6">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-12 right-0 text-white bg-red-600 hover:bg-red-700 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-all duration-200 hover:scale-110 shadow-lg"
              style={{ zIndex: 10000 }}
            >
              ×
            </button>

            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl shadow-2xl bg-black">
              <iframe
                src="https://www.youtube.com/embed/cJ61qnMgX4c?autoplay=1&rel=0&modestbranding=1"
                title="Bingo HandMade Collection Video"
                frameBorder="0"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                style={{ zIndex: 9998 }}
              />
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-black rounded-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default WhyHandmade;
