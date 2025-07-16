import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../cards/product-card";

const LatestProductsCarousel = ({ products }: { products: any[] }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -320 : 320,
        behavior: 'smooth',
      });
    }
  };
  if (!products?.length) return <p className="text-center py-8">No products to display.</p>;
  return (
    <div className="relative">
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hidden md:block"
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        style={{ left: -24 }}
      >
        <ChevronLeft className="w-6 h-6 text-blue-600" />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {products.map((product: any) => (
          <div key={product.id} className="min-w-[260px] max-w-[260px] flex-shrink-0 scroll-snap-align-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <button
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hidden md:block"
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        style={{ right: -24 }}
      >
        <ChevronRight className="w-6 h-6 text-blue-600" />
      </button>
    </div>
  );
};

export default LatestProductsCarousel; 