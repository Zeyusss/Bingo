import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Heart, Eye, ShoppingCart, BarChart3 } from "lucide-react";
import ProductDetailsCard from "./product-details";
import { useStore } from "apps/user-ui/src/store";
import { useComparisonStore } from "../../../store/comparisonStore";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";

const getColorCode = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    'Red': '#FF0000',
    'Blue': '#0000FF',
    'Green': '#008000',
    'Yellow': '#FFFF00',
    'Black': '#000000',
    'White': '#FFFFFF',
    'Pink': '#FFC0CB',
    'Purple': '#800080',
    'Orange': '#FFA500',
    'Brown': '#A52A2A',
    'Gray': '#808080',
    'Grey': '#808080',
    'Navy': '#000080',
    'Maroon': '#800000',
    'Teal': '#008080',
    'Olive': '#808000',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
    'Beige': '#F5F5DC',
    'Cream': '#FFFDD0',
  };
  
  if (color.startsWith('#')) {
    return color;
  }
  
  return colorMap[color] || '#CCCCCC';
};

const getColorDisplayName = (color: string): string => {
  if (!color.startsWith('#')) {
    return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
  }
  
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const brightness = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  if (max - min < 30) {
    if (brightness < 50) return 'Black';
    if (brightness < 100) return 'Dark Gray';
    if (brightness < 150) return 'Gray';
    if (brightness < 200) return 'Light Gray';
    return 'White';
  }
  
  if (r >= g && r >= b) {
    if (g > b + 30) {
      return brightness > 200 ? 'Light Orange' : brightness > 80 ? 'Orange' : 'Dark Orange';
    } else if (b > g + 30) {
      return brightness > 200 ? 'Light Pink' : brightness > 80 ? 'Pink' : 'Dark Pink';
    } else {
      return brightness > 200 ? 'Light Red' : brightness > 80 ? 'Red' : 'Dark Red';
    }
  } else if (g >= r && g >= b) {
    if (r > b + 30) {
      return brightness > 200 ? 'Light Yellow' : brightness > 80 ? 'Yellow' : 'Dark Yellow';
    } else if (b > r + 30) {
      return brightness > 200 ? 'Light Teal' : brightness > 80 ? 'Teal' : 'Dark Teal';
    } else {
      return brightness > 200 ? 'Light Green' : brightness > 80 ? 'Green' : 'Dark Green';
    }
  } else {
    if (r > g + 30) {
      return brightness > 200 ? 'Light Purple' : brightness > 80 ? 'Purple' : 'Dark Purple';
    } else if (g > r + 30) {
      return brightness > 200 ? 'Light Cyan' : brightness > 80 ? 'Cyan' : 'Dark Cyan';
    } else {
      return brightness > 200 ? 'Light Blue' : brightness > 80 ? 'Blue' : 'Dark Blue';
    }
  }
};

const ProductCard = ({
  product,
  isEvent,
  view = "grid",
  isWishlist = false,
  source = 'product_page'
}: {
  product: any;
  isEvent?: boolean;
  view?: "list" | "grid";
  isWishlist?: boolean;
  hideHeart?: boolean;
  source?: 'search' | 'product_page' | 'category' | 'recommendation';
}) => {
  const [timeleft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === product.id);
  

  const { addProduct, removeProduct, isProductInComparison, canAddMore } = useComparisonStore();
  const isInComparison = isProductInComparison(product.id);
  const hasDiscount =
    product.sale_price && product.sale_price < product.regular_price;
  
  const [isNew, setIsNew] = useState(false);
  
  useEffect(() => {
    if (product?.createdAt) {
      const isProductNew = Date.now() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
      setIsNew(isProductNew);
    }
  }, [product?.createdAt]);

  useEffect(() => {
    if (isEvent && product?.ending_date) {
      const updateTimeLeft = (): boolean => {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;

        if (diff <= 0) {
          setTimeLeft("Expired");
          return false; 
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        
        let updateText;
        if (days > 1) {
          updateText = `${days}d ${hours}h left with this price.`;
        } else if (hours > 1) {
          updateText = `${hours}h ${minutes}m left with this price.`;
        } else {
          const seconds = Math.floor((diff / 1000) % 60);
          updateText = `${minutes}m ${seconds}s left with this price.`;
        }
        
        setTimeLeft(updateText);
        return true; 
      };


      if (updateTimeLeft()) {
        const endTime = new Date(product.ending_date).getTime();
        const now = Date.now();
        const diff = endTime - now;
        
        let intervalTime;
        if (diff > 24 * 60 * 60 * 1000) {
          intervalTime = 10 * 60 * 1000; 
        } else if (diff > 60 * 60 * 1000) {
          intervalTime = 60 * 1000; 
        } else {
          intervalTime = 10 * 1000;
        }
        
        const interval = setInterval(() => {
          if (!updateTimeLeft()) {
            clearInterval(interval);
          }
        }, intervalTime);
        
        return () => clearInterval(interval);
      }
    } else {
      setTimeLeft("");
    }
    return () => {};
  }, [isEvent, product?.ending_date]);

  return (
    <div className="relative bg-white rounded-xl p-4 group shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col justify-between">
      <div className="transition-transform duration-500 ease-in-out group-hover:-translate-y-2 relative">
        {isNew && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-semibold px-2 py-[2px] rounded-full z-10">
            NEW
          </span>
        )}

        {!isWishlist && (
          <button
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
            onClick={() =>
              isWishlisted
                ? removeFromWishlist(product.id, user, location, deviceInfo)
                : addToWishlist(
                    { ...product, quantity: 1, price: product.sale_price || product.regular_price },
                    user,
                    location,
                    deviceInfo
                  )
            }
          >
            <Heart
              size={16}
              fill={isWishlisted ? "red" : "transparent"}
              stroke={isWishlisted ? "red" : "#666"}
              className={`transition-colors duration-200 ${
                isWishlisted ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
            />
          </button>
        )}


        <Link href={`/product/${product?.slug}`} className="block">
          <div className="w-full h-[240px] bg-white flex items-center justify-center rounded-lg overflow-hidden">
            <img
              src={
                product?.images?.[0]?.url ||
                "https://images.unsplash.com/photo-1610513320995-1ad4bbf25e55?q=80&w=1470&auto=format&fit=crop"
              }
              alt={product?.title}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>

        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 mt-3 mb-1 hover:text-blue-600 line-clamp-1 transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 capitalize">
          {product.category || product.Shop?.name}
        </p>

        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-1 items-baseline">
            <span className="text-[15px] font-bold text-orange-600">
              ${product.sale_price || product.regular_price}
            </span>
            {hasDiscount && (
              <span className="text-xs line-through text-gray-400">
                ${product.regular_price}
              </span>
            )}
          </div>
          <div className="text-xs text-yellow-500 font-semibold flex items-center gap-1">
            {typeof product.ratings === "number" ? product.ratings : "4.5"} ★
          </div>
        </div>

        {isEvent && timeleft && (
          <div className="mt-2 flex items-center gap-1 text-xs text-orange-600 font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{timeleft}</span>
          </div>
        )}

        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap items-center">
            {product.colors.slice(0, 5).map((color: string, idx: number) => {
              const colorCode = getColorCode(color);
              const colorName = getColorDisplayName(color);
              return (
                <div key={`color-${idx}-${color}`} className="relative">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300 hover:border-gray-500 transition-all duration-200 cursor-pointer hover:scale-110 shadow-sm group"
                    style={{ backgroundColor: colorCode }}
                    onMouseEnter={(e) => {
                     
                      const tooltip = document.createElement('div');
                      tooltip.className = 'fixed bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-[9999] pointer-events-none';
                      tooltip.textContent = colorName;
                      tooltip.id = `tooltip-${idx}`;
                      document.body.appendChild(tooltip);
                      
                      const rect = e.currentTarget.getBoundingClientRect();
                      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
                      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
                    }}
                    onMouseLeave={() => {
                     
                      const tooltip = document.getElementById(`tooltip-${idx}`);
                      if (tooltip) {
                        tooltip.remove();
                      }
                    }}
                  />
                </div>
              );
            })}
            {product.colors.length > 5 && (
              <span className="text-xs text-gray-500 font-medium ml-1">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="relative mt-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 ease-in-out z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const cartProduct = { ...product, quantity: 1, price: product.sale_price || product.regular_price };
              addToCart(cartProduct, user, location, deviceInfo);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-4 rounded-full transition w-[70%] flex items-center justify-center relative overflow-hidden group/addtocart"
          >
            <span className="group-hover/addtocart:opacity-0 transition-opacity duration-300">
              Add to cart
            </span>
            <ShoppingCart
              size={20}
              className="absolute opacity-0 group-hover/addtocart:opacity-100 transition-opacity duration-300"
            />
          </button>

          <div className="flex gap-2">
            <button
              className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition"
              onClick={() => setOpen(true)}
            >
              <Eye size={18} className="text-gray-600" />
            </button>
            <button 
              onClick={() => {
                if (isInComparison) {
                  removeProduct(product.id);
                } else if (canAddMore()) {
                  addProduct({
                    id: product.id,
                    title: product.title,
                    slug: product.slug,
                    sale_price: product.sale_price || product.regular_price,
                    regular_price: product.regular_price,
                    images: product.images || [],
                    Shop: product.Shop || { id: '', name: '', avatar: null },
                    ratings: product.ratings || 0,
                    stock: product.stock || 0,
                    category: product.category || '',
                    tags: product.tags || [],
                    specifications: product.specifications || {},
                    customProperties: product.customProperties || {},
                    addedAt: Date.now(),
                    lastViewed: Date.now(),
                    source
                  }, source);
                }
              }}
              disabled={!canAddMore() && !isInComparison}
              className={`p-2 rounded-full transition ${
                isInComparison 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : canAddMore() 
                    ? 'bg-gray-100 hover:bg-blue-100 text-gray-600' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={isInComparison ? 'Remove from comparison' : canAddMore() ? 'Add to comparison' : 'Comparison limit reached (4 max)'}
            >
              <BarChart3 size={18} />
            </button>
          </div>
        </div>
      </div>

      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
    </div>
  );
};

export default ProductCard;
