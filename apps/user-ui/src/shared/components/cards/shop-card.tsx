import { MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    avatar: {
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

  const maxCategories = 3;
  const displayedCategories = categories.slice(0, maxCategories);
  const extraCount = categories.length - maxCategories;

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-[140px] w-full overflow-hidden">
        {shop.coverBanner?.trim() ? (
          <Image
            src={shop.coverBanner}
            alt="Cover"
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <img
            src="https://dummyimage.com/600x600/eeeeee/000000&text=Brand"
            alt="Default Cover"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        )}
      </div>

      <div className="relative flex justify-center -mt-10 z-10">
        <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white transition-transform hover:scale-105 duration-300">
          {shop.avatar?.url ? (
            <Image
              src={shop.avatar.url}
              alt={shop.name}
              width={80}
              height={80}
              className="object-cover"
            />
          ) : (
            <img
              src="https://dummyimage.com/80x80/eeeeee/000000&text=User"
              alt="Default Avatar"
              width={80}
              height={80}
              className="object-cover"
            />
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 text-center">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
          {shop.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {shop.followers?.length ?? 0} Followers
        </p>

        <div className="flex items-center justify-center text-sm text-gray-500 mt-3 gap-4 flex-wrap">
          {shop.address && (
            <span className="flex items-center gap-1 max-w-[140px] truncate">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {shop.rating ?? "N/A"}
          </span>
        </div>

        {displayedCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {displayedCategories.map((cat: string) => (
              <span
                key={cat}
                className="bg-blue-100 text-blue-600 capitalize px-3 py-0.5 rounded-full font-medium"
              >
                {cat.replace(/_/g, " ")}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full font-medium">
                +{extraCount} more
              </span>
            )}
          </div>
        )}

        <div className="mt-5">
          <Link
            href={`/shop/${shop.id}`}
            className="block w-full text-center text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 transition px-4 py-2 rounded-lg shadow"
          >
            Visit Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;