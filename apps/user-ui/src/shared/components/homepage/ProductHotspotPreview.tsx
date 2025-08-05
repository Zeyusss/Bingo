'use client';

import { useEffect, useState } from 'react';
import axiosInstance from "../../../utils/axiosInstance";

type Product = {
  id: string;
  title: string;
  short_description: string;
  sale_price: number;
  images: { url: string }[];
};

export default function ProductHotspotPreview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get('/api/product/three');
        setProducts(data.products);
        setSelected(data.products[0]);
      } catch (error) {
        console.error("Failed to load products", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex w-full h-[600px] gap-8 p-6">
      <div className="w-1/2 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden">
        {selected && (
          <div className="text-center p-8 transform transition-all duration-500 ease-out animate-fade-in">
            <div className="relative mb-6">
              <img
                src={selected.images?.[0]?.url || '/placeholder.png'}
                alt={selected.title}
                className="w-[280px] h-[280px] object-contain mx-auto rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                Featured
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 transition-colors duration-300">{selected.title}</h2>
            <p className="text-gray-600 mb-4 leading-relaxed max-w-sm mx-auto">{selected.short_description}</p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-2xl font-bold text-orange-500 transition-colors duration-300">
                ${selected.sale_price.toFixed(2)}
              </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5">
                View Details
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="relative w-1/2 h-full rounded-2xl overflow-hidden shadow-2xl"
        style={{
          backgroundImage: "url('/room.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        
        {products.map((product, index) => (
          <div key={product.id} className="absolute">
            <div
              onMouseEnter={() => {
                setSelected(product);
                setHoveredProduct(product);
              }}
              onMouseLeave={() => setHoveredProduct(null)}
              className="relative w-12 h-12 bg-white rounded-full shadow-xl cursor-pointer transition-all duration-300 hover:scale-125 hover:shadow-2xl border-4 border-orange-500 flex items-center justify-center group"
              style={{
                top: `${30 + index * 20}%`,
                left: `${40 + index * 10}%`,
                animation: `pulse-ring 2s infinite ${index * 0.5}s`,
              }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-20"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              
              {hoveredProduct?.id === product.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white rounded-lg shadow-2xl p-4 min-w-[250px] z-10 transition-all duration-300 animate-slide-up">
                  <div className="flex items-start gap-3">
                    <img
                      src={product.images?.[0]?.url || '/placeholder.png'}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg shadow-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{product.title}</h3>
                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{product.short_description}</p>
                      <p className="text-orange-500 font-bold text-lg">${product.sale_price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(249, 115, 22, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(249, 115, 22, 0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
