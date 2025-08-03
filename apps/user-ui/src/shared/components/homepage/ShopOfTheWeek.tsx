import React from "react";

const ShopOfTheWeek = ({ shop }: { shop: any }) => {
  if (!shop) return null;
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-blue-50 rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6 mb-10">
      <img
        src={shop.avatar || "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"}
        alt={shop.name}
        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
      />
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-[#115061] mb-1">Shop of the Week: {shop.name}</h3>
        <p className="text-gray-700 mb-2 line-clamp-2">{shop.description || 'Discover unique handmade creations from this talented artisan.'}</p>
        <a href={`/shop/${shop.id}`} className="text-blue-600 hover:underline font-medium">Visit Shop</a>
      </div>
    </div>
  );
};

export default ShopOfTheWeek; 