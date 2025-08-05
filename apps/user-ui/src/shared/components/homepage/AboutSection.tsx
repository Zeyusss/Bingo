"use client";
import React, { useState, useRef, useEffect } from "react";

const AboutSection = () => {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [expanded]);

  return (
    <section className=" px-6 py-12 md:px-20 md:py-20 text-black font-Poppins">
      <div className="max-w-6xl mx-auto space-y-10">
        <h2 className="text-[22px] md:text-[26px] font-semibold leading-tight">
          Furniture production is a modern form of art
        </h2>

        <div
          className={`relative transition-all duration-700 ease-in-out ${
            expanded ? "max-h-full" : "max-h-[150px] overflow-hidden"
          }`}
          ref={contentRef}
        >
          <p className="text-[16px] text-gray-600 leading-relaxed">
            Furniture manufacturers, as well as manufacturers of other home goods, are full of amazing offers: we often come across both standard mass-produced products and unique creations – furniture from professional craftsmen, which will be appreciated by true connoisseurs of beauty. We have selected for you the best models from modern craftsmen who managed to ingeniously combine elegance, quality and practicality in each product unit. Our assortment includes products from proven companies. Who for many years of continuous joint work did...
          </p>

          {/* Fade effect */}
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#FAF8F3] to-transparent pointer-events-none" />
          )}
        </div>

        {/* Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-semibold text-black hover:text-orange-500 border-b border-black hover:border-orange-500 transition duration-200"
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      </div>
    </section>
  );
};

export default AboutSection;
