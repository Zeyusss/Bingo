"use client";
import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
<button
  onClick={scrollToTop}
  className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md transition-opacity duration-300 ${
    isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
  }`}
  aria-label="Scroll to top"
>
  <ChevronUp className="w-5 h-5 text-black" />
</button>

  );
};

export default ScrollToTopButton;
