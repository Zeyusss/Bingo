import SellerProfile from "apps/user-ui/src/shared/modules/seller/seller-profile";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Metadata } from "next";
import React from "react";

async function fetchSellerDetails(shopId: string) {
  try {
    const response = await axiosInstance.get(
      `/seller/api/get-seller/${shopId}`
    );

    if (response.data?.shop) {
      return {
        shop: response.data.shop,
        followersCount: response.data.followersCount || 0,
        productsCount: response.data.productsCount || 0,
        eventsCount: response.data.eventsCount || 0,
      };
    }

    return {
      shop: null,
      followersCount: 0,
      productsCount: 0,
      eventsCount: 0,
      error: "Shop not found",
    };
  } catch (error) {
    console.error("Error fetching seller details:", error);
    return {
      shop: null,
      followersCount: 0,
      productsCount: 0,
      eventsCount: 0,
      error:
        error instanceof Error ? error.message : "Failed to fetch shop details",
    };
  }
}

// dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchSellerDetails(id);

  return {
    title: `${data?.shop?.name} | Bingo Marketplace`,
    description:
      data?.shop?.bio ||
      "Explore products and services from trusted sellers on Bingo.",
    openGraph: {
      title: `${data.shop?.name} | Bingo Marketplace`,
      description:
        data?.shop?.bio ||
        "Explore products and services from trusted sellers on Bingo.",
      type: "website",
      images: [
        {
          url: data?.shop?.avatar || "/default-shop.png",
          width: 800,
          height: 600,
          alt: data?.shop?.name || "Shop Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data?.shop?.name} | Bingo Marketplace`,
      description:
        data?.shop?.bio ||
        "Explore products and services from trusted sellers on Bingo.",
      images: [data?.shop?.avatar || "/default-shop.png"],
    },
  };
}

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const data = await fetchSellerDetails(params.id);

  if (!data?.shop) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Shop Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested shop could not be found or is currently unavailable.
          </p>
          {data?.error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded text-sm">
              Error: {data.error}
            </div>
          )}
          <div className="mt-6">
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SellerProfile
        shop={data.shop}
        followersCount={data.followersCount || 0}
        productsCount={data.productsCount || 0}
        eventsCount={data.eventsCount || 0}
      />
    </div>
  );
};

export default Page;
