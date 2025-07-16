import { Star } from "lucide-react";
import React from "react";

const WhyHandmade = () => (
  <div className="bg-white rounded-xl shadow-md p-8 my-12 flex flex-col md:flex-row items-center gap-8">
    <div className="flex-1">
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#115061]">Why Buy Handmade?</h2>
      <ul className="list-disc pl-5 text-gray-700 space-y-2">
        <li>Support independent artisans and small businesses</li>
        <li>Unique, one-of-a-kind products crafted with care</li>
        <li>Eco-friendly and sustainable choices</li>
        <li>High quality, made with love</li>
      </ul>
    </div>
    <div className="flex flex-col items-center gap-3">
      <Star className="w-12 h-12 text-yellow-400" />
      <span className="text-lg font-semibold text-[#115061]">Trusted Marketplace</span>
    </div>
  </div>
);

export default WhyHandmade; 