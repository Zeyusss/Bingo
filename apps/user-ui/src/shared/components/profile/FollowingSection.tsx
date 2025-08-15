'use client';

import React, { useState } from 'react';
import { Star, Heart, Users, Store } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useRequireAuth from '../../../hooks/useRequiredAuth';
import { useRouter } from 'next/navigation';

interface Shop {
  id: string;
  name: string;
  category?: string[];
  avatar?: {
    url: string;
  };
  ratings?: number;
  reviews?: Array<{
    rating: number;
  }>;
  _count?: {
    products: number;
  };
  products?: Array<{
    ratings: number;
  }>;
}

interface ShopCardProps {
  shop: Shop;
  isFollowing: boolean;
  onToggleFollow: (shopId: string, isFollowing: boolean) => void;
  isLoading?: boolean;
  onShopClick: (shopId: string) => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, isFollowing, onToggleFollow, isLoading, onShopClick }) => {
  
  const getShopRating = (shop: Shop) => {
   
    if (shop.ratings && shop.ratings > 0) {
      return shop.ratings;
    }
    
   
    if (shop.reviews && shop.reviews.length > 0) {
      const totalRating = shop.reviews.reduce((sum, review) => sum + review.rating, 0);
      return totalRating / shop.reviews.length;
    }
    
    return 0;
  };

  const rating = getShopRating(shop);

  
  const formatCategories = (categories: string[] | string | undefined) => {
    if (!categories) return 'General Store';
    
    if (Array.isArray(categories)) {
      if (categories.length === 0) return 'General Store';
      if (categories.length === 1) return categories[0];
      if (categories.length === 2) return categories.join(' & ');
      return `${categories[0]} & ${categories.length - 1} more`;
    }
    
    return categories;
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 group cursor-pointer"
      onClick={() => onShopClick(shop.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
            {shop.avatar?.url ? (
              <img 
                src={shop.avatar.url} 
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate group-hover:text-blue-600 transition-colors">
              {shop.name}
            </h3>
            <div className="flex flex-wrap items-center gap-1 mb-2">
              {Array.isArray(shop.category) && shop.category.length > 0 ? (
                shop.category.slice(0, 2).map((cat, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {cat}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  {formatCategories(shop.category)}
                </span>
              )}
              {Array.isArray(shop.category) && shop.category.length > 2 && (
                <span className="text-xs text-gray-500 font-medium">
                  +{shop.category.length - 2} more
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {rating > 0 ? rating.toFixed(1) : 'No rating'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFollow(shop.id, isFollowing);
          }}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
            isFollowing
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            isFollowing ? 'Unfollow' : 'Follow'
          )}
        </button>
      </div>
    </div>
  );
};

const FollowingSection: React.FC = () => {
  const [followingPage, setFollowingPage] = useState(1);
  const [discoverPage, setDiscoverPage] = useState(1);
  const queryClient = useQueryClient();
  const { user } = useRequireAuth();
  const router = useRouter();

 
  const { data: followedShops, isLoading: loadingFollowed } = useQuery({
    queryKey: ['followed-shops', followingPage],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/user-followed-shops?page=${followingPage}&limit=6`);
      return response.data;
    }
  });


  const { data: discoverShops, isLoading: loadingDiscover } = useQuery({
    queryKey: ['discover-shops', discoverPage, user?.id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/product/api/get-filtered-shops?page=${discoverPage}&limit=6&notFollowed=true&userId=${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id
  });

 
  const followMutation = useMutation({
    mutationFn: async ({ shopId, action }: { shopId: string; action: 'follow' | 'unfollow' }) => {
      const response = await axiosInstance.post(`/api/${action}-shop`, { shopId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-shops'] });
      queryClient.invalidateQueries({ queryKey: ['discover-shops'] });
    }
  });

  const handleToggleFollow = (shopId: string, isFollowing: boolean) => {
    followMutation.mutate({
      shopId,
      action: isFollowing ? 'unfollow' : 'follow'
    });
  };

  const handleShopClick = (shopId: string) => {
    router.push(`/shop/${shopId}`);
  };

  return (
    <div className="space-y-8">
      {/* Shops I'm Following Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Shops I'm Following
          </h2>
          <span className="text-sm text-gray-500">
            {followedShops?.pagination?.total || 0} shops
          </span>
        </div>

        {loadingFollowed ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : followedShops?.shops?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followedShops.shops.map((shop: Shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  isFollowing={true}
                  onToggleFollow={handleToggleFollow}
                  isLoading={followMutation.isPending}
                  onShopClick={handleShopClick}
                />
              ))}
            </div>
            {followedShops.pagination?.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  {followingPage > 1 && (
                    <button
                      onClick={() => setFollowingPage(followingPage - 1)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  <span className="px-3 py-2 text-sm text-gray-600">
                    Page {followingPage} of {followedShops.pagination.totalPages}
                  </span>
                  {followingPage < followedShops.pagination.totalPages && (
                    <button
                      onClick={() => setFollowingPage(followingPage + 1)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">You're not following any shops yet</p>
            <p className="text-gray-400 text-sm">Discover amazing shops below and start following them!</p>
          </div>
        )}
      </div>

      {/* Discover Shops Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Discover Shops
          </h2>
          <span className="text-sm text-gray-500">
            Find new shops to follow
          </span>
        </div>

        {loadingDiscover ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : discoverShops?.shops?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discoverShops.shops.map((shop: Shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  isFollowing={false}
                  onToggleFollow={handleToggleFollow}
                  isLoading={followMutation.isPending}
                  onShopClick={handleShopClick}
                />
              ))}
            </div>
            {discoverShops.pagination?.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  {discoverPage > 1 && (
                    <button
                      onClick={() => setDiscoverPage(discoverPage - 1)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Previous
                    </button>
                  )}
                  <span className="px-3 py-2 text-sm text-gray-600">
                    Page {discoverPage} of {discoverShops.pagination.totalPages}
                  </span>
                  {discoverPage < discoverShops.pagination.totalPages && (
                    <button
                      onClick={() => setDiscoverPage(discoverPage + 1)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No more shops to discover</p>
            <p className="text-gray-400 text-sm">Check back later for new shops!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingSection;
