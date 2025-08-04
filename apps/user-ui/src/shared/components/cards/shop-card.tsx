import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    avatar?: {
      url: string;
    };
    coverBanner?: string;
    address?: string;
    followers?: any[];
    rating?: number;
    categories?: string[];
  };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  const categories = Array.isArray(shop.categories)
    ? shop.categories
    : Array.isArray((shop as any).category)
    ? (shop as any).category
    : [];
  const maxCategories = 2;
  const displayedCategories = categories.slice(0, maxCategories);
  const extraCount = categories.length - maxCategories;

  return (
    <div className="w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden transition hover:shadow-lg">
      <div className="h-[120px] w-full relative">
        <Image
          src={
            shop?.coverBanner ||
            "https://ik.imagekit.io/w7lwh7wre/cover-handmade.webp?updatedAt=175424311149"
          }
          alt="Cover"
          fill
          className="object-cover w-full h-full"
        />
      </div>
      <div className="relative flex justify-center -mt-8">
        <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow bg-white">
          <Image
            src={
              shop.avatar?.url ||
              "https://ik.imagekit.io/w7lwh7wre/profile.webp?updatedAt=1754240423756"
            }
            alt={shop.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>
      <div className="px-4 pb-4 pt-2 text-center">
        <h3 className="text-base font-semibold text-gray-800 line-clamp-1">
          {shop?.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {shop?.followers?.length ?? 0} Followers
        </p>
        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap">
          {shop.address && (
            <span className="flex items-center gap-1 max-w-[120px]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            {shop.rating ?? "N/A"}
          </span>
        </div>
        {displayedCategories.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            {displayedCategories.map((cat: string, idx: number) => (
              <span
                key={cat}
                className="bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-full font-medium"
              >
                {cat.replace(/_/g, " ")}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                +{extraCount} more
              </span>
            )}
          </div>
        )}
        <div className="mt-4">
          <Link
            href={`/shop/${shop.id}`}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline hover:text-blue-700 transition"
          >
            Visit Shop
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
