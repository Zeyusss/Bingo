'use client';
import React, { useState } from 'react';

type Product = {
  id: number;
  title: string;
  price: string;
  image: string;
};

const products: Product[] = [
  {
    id: 1,
    title: 'Boho Cup Decor',
    price: '$25',
    image: 'https://images.unsplash.com/photo-1527505937496-ec9bd1d25da5?w=600',
  },
  {
    id: 2,
    title: 'Rustic Ceramic Teacups',
    price: '$18',
    image: 'https://plus.unsplash.com/premium_photo-1679868096292-54efdc6c021f?w=600',
  },
  {
    id: 3,
    title: 'Neutral Tone Shirt ',
    price: '$22',
    image: 'https://images.unsplash.com/photo-1573612664822-d7d347da7b80?w=600',
  },
  {
    id: 4,
    title: 'Beige Linen Blouse ',
    price: '$20',
    image: 'https://images.unsplash.com/photo-1556095667-9760aa7f4885?w=600',
  },
  {
    id: 5,
    title: 'Essential Bag',
    price: '$28',
    image: 'https://images.unsplash.com/photo-1527383214149-cb7be04ae387?q=80&w=1170',
  },
  {
    id: 6,
    title: 'Handcrafted Terracotta Vase',
    price: '$35',
    image: 'https://plus.unsplash.com/premium_photo-1675719071705-5f338a1c9349?q=80&w=687',
  },
  {
    id: 7,
    title: 'Earthy Essentials for Self-Care',
    price: '$21',
    image: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=687',
  },
  {
    id: 8,
    title: 'Natural Shoulder Bag',
    price: '$26',
    image: 'https://images.unsplash.com/photo-1531357732422-758bdf2af3d5?q=80&w=1974',
  },
  {
    id: 11,
    title: 'Natural Clay Mugs & Plates',
    price: '$23',
    image: 'https://images.unsplash.com/photo-1556970256-05e8a6edd190?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTN8fGhhbmRtYWRlfGVufDB8fDB8fHww',
  },
];

export default function Page() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="py-16 px-4 md:px-8 lg:px-20">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Product collections</h1>
        <p className="text-gray-600 text-base sm:text-lg">Explore product collections from our vendors</p>
      </div>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative break-inside-avoid rounded-xl overflow-hidden shadow-md group"
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full object-cover rounded-lg"
            />

            {/* Hotspot circle */}
            <div
              className="absolute top-1/2 left-1/2 w-5 h-5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group-hover:scale-110 transition-all"
              onMouseEnter={() => setHovered(product.id)}
              onMouseLeave={() => setHovered(null)}
            ></div>

            {/* Hover Card */}
            {hovered === product.id && (
              <div className="absolute top-2 left-2 bg-white p-3 rounded-xl shadow-xl z-20 w-40 animate-fade-in">
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-20 w-full rounded-md object-cover mb-1"
                />
                <h2 className="text-sm font-semibold">{product.title}</h2>
                <p className="text-xs text-gray-600">{product.price}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}