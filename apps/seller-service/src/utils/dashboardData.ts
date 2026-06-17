import prisma from "@packages/libs/prisma";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  USA: { lat: 37.7749, lng: -122.4194 },
  Egypt: { lat: 30.0444, lng: 31.2357 },
  UK: { lat: 51.5074, lng: -0.1278 },
  Germany: { lat: 52.52, lng: 13.405 },
  Canada: { lat: 45.4215, lng: -75.6997 },
  France: { lat: 48.8566, lng: 2.3522 },
  Italy: { lat: 41.9028, lng: 12.4964 },
  Spain: { lat: 40.4168, lng: -3.7038 },
  Netherlands: { lat: 52.3676, lng: 4.9041 },
  Belgium: { lat: 50.8503, lng: 4.3517 },
  Switzerland: { lat: 46.9479, lng: 7.4474 },
  Austria: { lat: 48.2082, lng: 16.3738 },
  Sweden: { lat: 59.3293, lng: 18.0686 },
  Norway: { lat: 59.9139, lng: 10.7522 },
  Denmark: { lat: 55.6761, lng: 12.5683 },
  Finland: { lat: 60.1699, lng: 24.9384 },
  Poland: { lat: 52.2297, lng: 21.0122 },
  Czech: { lat: 50.0755, lng: 14.4378 },
  Hungary: { lat: 47.4979, lng: 19.0402 },
  Romania: { lat: 44.4268, lng: 26.1025 },
  Bulgaria: { lat: 42.6977, lng: 23.3219 },
  Greece: { lat: 37.9838, lng: 23.7275 },
  Portugal: { lat: 38.7223, lng: -9.1393 },
  Ireland: { lat: 53.3498, lng: -6.2603 },
  Australia: { lat: -33.8688, lng: 151.2093 },
  NewZealand: { lat: -41.2866, lng: 174.7756 },
  Japan: { lat: 35.6762, lng: 139.6503 },
  SouthKorea: { lat: 37.5665, lng: 126.978 },
  China: { lat: 39.9042, lng: 116.4074 },
  India: { lat: 28.6139, lng: 77.209 },
  Brazil: { lat: -23.5505, lng: -46.6333 },
  Argentina: { lat: -34.6118, lng: -58.396 },
  Chile: { lat: -33.4489, lng: -70.6693 },
  Mexico: { lat: 19.4326, lng: -99.1332 },
  Colombia: { lat: 4.711, lng: -74.0721 },
  Peru: { lat: -12.0464, lng: -77.0428 },
  Venezuela: { lat: 10.4806, lng: -66.9036 },
  SouthAfrica: { lat: -26.2041, lng: 28.0473 },
  Nigeria: { lat: 9.082, lng: 8.6753 },
  Kenya: { lat: -1.2921, lng: 36.8219 },
  Morocco: { lat: 31.7917, lng: -7.0926 },
  Algeria: { lat: 36.7538, lng: 3.0588 },
  Tunisia: { lat: 36.8065, lng: 10.1815 },
  Turkey: { lat: 39.9334, lng: 32.8597 },
  Israel: { lat: 31.7683, lng: 35.2137 },
  SaudiArabia: { lat: 24.7136, lng: 46.6753 },
  UAE: { lat: 25.2048, lng: 55.2708 },
  Qatar: { lat: 25.2854, lng: 51.531 },
  Kuwait: { lat: 29.3759, lng: 47.9774 },
  Bahrain: { lat: 26.0667, lng: 50.5577 },
  Oman: { lat: 23.588, lng: 58.3829 },
  Jordan: { lat: 31.9454, lng: 35.9284 },
  Lebanon: { lat: 33.8935, lng: 35.5016 },
  Syria: { lat: 33.5138, lng: 36.2765 },
  Iraq: { lat: 33.3152, lng: 44.3661 },
  Iran: { lat: 35.6892, lng: 51.389 },
  Pakistan: { lat: 33.6844, lng: 73.0479 },
  Bangladesh: { lat: 23.8103, lng: 90.4125 },
  SriLanka: { lat: 6.9271, lng: 79.8612 },
  Nepal: { lat: 27.7172, lng: 85.324 },
  Bhutan: { lat: 27.4716, lng: 89.6386 },
  Myanmar: { lat: 16.8661, lng: 96.1951 },
  Thailand: { lat: 13.7563, lng: 100.5018 },
  Vietnam: { lat: 21.0285, lng: 105.8542 },
  Cambodia: { lat: 11.5564, lng: 104.9282 },
  Laos: { lat: 17.9757, lng: 102.6331 },
  Malaysia: { lat: 3.139, lng: 101.6869 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  Indonesia: { lat: -6.2088, lng: 106.8456 },
  Philippines: { lat: 14.5995, lng: 120.9842 },
  Taiwan: { lat: 25.033, lng: 121.5654 },
  HongKong: { lat: 22.3193, lng: 114.1694 },
  Macau: { lat: 22.1987, lng: 113.5439 },
  Mongolia: { lat: 47.8864, lng: 106.9057 },
  Kazakhstan: { lat: 51.1694, lng: 71.4491 },
  Uzbekistan: { lat: 41.2995, lng: 69.2401 },
  Kyrgyzstan: { lat: 42.8746, lng: 74.5698 },
  Tajikistan: { lat: 38.5358, lng: 68.7791 },
  Turkmenistan: { lat: 37.9601, lng: 58.3261 },
  Azerbaijan: { lat: 40.4093, lng: 49.8671 },
  Georgia: { lat: 41.7151, lng: 44.8271 },
  Armenia: { lat: 40.1872, lng: 44.5152 },
  Ukraine: { lat: 50.4501, lng: 30.5234 },
  Belarus: { lat: 53.9045, lng: 27.5615 },
  Lithuania: { lat: 54.6872, lng: 25.2797 },
  Latvia: { lat: 56.9496, lng: 24.1052 },
  Estonia: { lat: 59.4369, lng: 24.7536 },
  Russia: { lat: 55.7558, lng: 37.6176 },
  Iceland: { lat: 64.9631, lng: -19.0208 },
  Malta: { lat: 35.9375, lng: 14.3754 },
  Cyprus: { lat: 35.1264, lng: 33.4299 },
  Croatia: { lat: 45.815, lng: 15.9819 },
  Slovenia: { lat: 46.0569, lng: 14.5058 },
  Slovakia: { lat: 48.1486, lng: 17.1077 },
  Serbia: { lat: 44.7866, lng: 20.4489 },
  Bosnia: { lat: 43.8564, lng: 18.4131 },
  Montenegro: { lat: 42.4304, lng: 19.2594 },
  Albania: { lat: 41.3275, lng: 19.8187 },
  NorthMacedonia: { lat: 42.0027, lng: 21.4262 },
  Kosovo: { lat: 42.6629, lng: 21.1655 },
  Moldova: { lat: 47.0105, lng: 28.8638 },
  Luxembourg: { lat: 49.6116, lng: 6.1319 },
  Liechtenstein: { lat: 47.166, lng: 9.5554 },
  Monaco: { lat: 43.7384, lng: 7.4246 },
  Andorra: { lat: 42.5063, lng: 1.5218 },
  SanMarino: { lat: 43.9424, lng: 12.4578 },
  Vatican: { lat: 41.9029, lng: 12.4534 },
};

export async function fetchShopRevenueData(
  sellerId: string,
  period: "7d" | "30d" | "90d" = "30d",
) {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const now = new Date();
  const dataPoints = Array.from({ length: days }).map((_, i) => {
    const date = subDays(now, days - 1 - i);
    return {
      label: format(date, "MMM dd"),
      start: startOfDay(date),
      end: endOfDay(date),
    };
  });

  const startDate = dataPoints[0].start;
  const endDate = dataPoints[dataPoints.length - 1].end;

  const orders = await prisma.orders.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: "Paid",
      shop: { sellerId },
    },
    select: { total: true, createdAt: true },
  });

  const revenueByLabel = new Map(dataPoints.map((d) => [d.label, 0]));
  for (const order of orders) {
    const point = dataPoints.find(
      (d) => order.createdAt >= d.start && order.createdAt <= d.end,
    );
    if (point) {
      revenueByLabel.set(
        point.label,
        (revenueByLabel.get(point.label) || 0) + (order.total || 0),
      );
    }
  }

  const data = dataPoints.map((d) => ({
    x: d.label,
    y: revenueByLabel.get(d.label) || 0,
  }));

  return [
    {
      id: "revenue",
      color: "hsl(190, 80%, 60%)",
      data,
    },
  ];
}

export async function fetchShopStats(sellerId: string) {
  const shop = await prisma.shops.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!shop) {
    return {
      totalProducts: 0,
      activeListings: 0,
      ordersToday: 0,
      totalRevenue: 0,
      conversionRate: 0,
    };
  }

  const [
    totalProducts,
    activeListings,
    ordersToday,
    totalRevenue,
    totalVisitors,
    totalOrders,
  ] = await Promise.all([
    prisma.products.count({
      where: { shopId: shop.id, isDeleted: false },
    }),
    prisma.products.count({
      where: {
        shopId: shop.id,
        isDeleted: false,
        stock: { gt: 0 },
      },
    }),
    prisma.orders.count({
      where: {
        shopId: shop.id,
        createdAt: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
      },
    }),
    prisma.orders.aggregate({
      where: {
        shopId: shop.id,
        status: "Paid",
      },
      _sum: { total: true },
    }),
    prisma.shopAnalytics.findUnique({
      where: { shopId: shop.id },
      select: { totalVisitors: true },
    }),
    prisma.orders.count({
      where: {
        shopId: shop.id,
        status: "Paid",
      },
    }),
  ]);

  let conversionRate = 0;
  if (totalVisitors?.totalVisitors && totalOrders) {
    const rawConversionRate = (totalOrders / totalVisitors.totalVisitors) * 100;
    conversionRate = Math.round(Math.min(rawConversionRate, 100));
  }

  const shopWithRating = await prisma.shops.findUnique({
    where: { id: shop.id },
    select: { ratings: true },
  });

  return {
    totalProducts,
    activeListings,
    ordersToday,
    totalRevenue: totalRevenue._sum.total || 0,
    conversionRate,
    averageRating: shopWithRating?.ratings || 0,
  };
}

export async function fetchShopRecentOrders(sellerId: string, limit = 5) {
  const shop = await prisma.shops.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!shop) return [];

  const orders = await prisma.orders.findMany({
    where: {
      shopId: shop.id,
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true },
      },
      items: true,
    },
  });

  return orders.map((order) => ({
    id: order.id,
    customerName: order.user?.name || "Anonymous",
    total: order.total || 0,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item: any) => ({
      name: `Product ${item.productId}`,
      quantity: item.quantity,
      price: item.price,
    })),
  }));
}

export async function fetchShopWorldActivity(sellerId: string) {
  const shop = await prisma.shops.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!shop) return [];

  const shopAnalytics = await prisma.shopAnalytics.findUnique({
    where: { shopId: shop.id },
  });

  if (!shopAnalytics || !shopAnalytics.countryStats) {
    return [];
  }

  const ordersData = await prisma.orders.findMany({
    where: {
      shopId: shop.id,
      status: "Paid",
      shippingAddressSnapshot: { not: null },
    },
    select: {
      id: true,
      shippingAddressSnapshot: true,
    },
  });

  const countryOrdersMap: Record<string, number> = {};
  const countryCitiesMap: Record<string, Set<string>> = {};

  ordersData.forEach((order) => {
    try {
      const shippingAddress = order.shippingAddressSnapshot as any;
      if (shippingAddress && typeof shippingAddress === "object") {
        const country = shippingAddress.country;
        const city = shippingAddress.city;

        if (country) {
          countryOrdersMap[country] = (countryOrdersMap[country] || 0) + 1;

          if (!countryCitiesMap[country]) {
            countryCitiesMap[country] = new Set();
          }
          if (city) {
            countryCitiesMap[country].add(city);
          }
        }
      }
    } catch (error) {
      console.warn("Invalid shipping address data for order:", order.id);
    }
  });

  const worldActivity = Object.entries(
    shopAnalytics.countryStats as Record<string, number>,
  )
    .filter(([country]) => COUNTRY_COORDS[country])
    .map(([country, visitors]) => {
      const countryOrders = countryOrdersMap[country] || 0;
      const cities = Array.from(countryCitiesMap[country] || new Set());

      return {
        lat: COUNTRY_COORDS[country].lat,
        lng: COUNTRY_COORDS[country].lng,
        orders: countryOrders,
        visitors: visitors,
        cities: cities,
        country,
        conversionRate:
          visitors > 0
            ? Math.round(
                Math.min((countryOrders / visitors) * 100, 100) * 100,
              ) / 100
            : 0,
      };
    })
    .sort((a, b) => b.visitors - a.visitors);

  return worldActivity;
}

export async function fetchShopVisitorAnalytics(sellerId: string) {
  const shop = await prisma.shops.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!shop) return [];

  const shopAnalytics = await prisma.shopAnalytics.findUnique({
    where: { shopId: shop.id },
  });

  if (!shopAnalytics) {
    return {
      totalVisitors: 0,
      topCountry: null,
      topState: null,
      countries: [],
      locations: [],
    };
  }

  const totalVisitors = shopAnalytics.totalVisitors || 0;
  const countryStats =
    (shopAnalytics.countryStats as Record<string, number>) || {};
  const cityStats = (shopAnalytics.cityStats as Record<string, number>) || {};

  const actualCountryTotal = Object.values(countryStats).reduce(
    (sum, count) => sum + count,
    0,
  );
  const actualCityTotal = Object.values(cityStats).reduce(
    (sum, count) => sum + count,
    0,
  );

  const countries = Object.entries(countryStats)
    .map(([country, visitors]) => ({
      country,
      visitors,
      states: 1,
      cities: Object.keys(cityStats),
      percentage:
        actualCountryTotal > 0
          ? Math.round((visitors / actualCountryTotal) * 100)
          : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors);

  const locations = Object.entries(cityStats)
    .map(([city, visitors]) => {
      return {
        country: "Unknown",
        state: city,
        visitors,
        cities: [city],
        percentage:
          actualCityTotal > 0
            ? Math.round((visitors / actualCityTotal) * 100)
            : 0,
      };
    })
    .sort((a, b) => b.visitors - a.visitors);

  if (Object.keys(countryStats).length > 0) {
    const country = Object.keys(countryStats)[0];
    locations.forEach((location) => {
      location.country = country;
    });
  }

  return {
    totalVisitors,
    topCountry: countries[0] || null,
    topState: locations[0] || null,
    countries: countries.slice(0, 5),
    locations: locations.slice(0, 10),
  };
}

export async function fetchShopDeviceUsage(sellerId: string) {
  const shop = await prisma.shops.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!shop) {
    return [
      { id: "Phone", label: "Phone", value: 0 },
      { id: "Tablet", label: "Tablet", value: 0 },
      { id: "Computer", label: "Computer", value: 0 },
    ];
  }

  const shopAnalytics = await prisma.shopAnalytics.findUnique({
    where: { shopId: shop.id },
  });

  if (!shopAnalytics || !shopAnalytics.deviceStats) {
    return [
      { id: "Phone", label: "Phone", value: 0 },
      { id: "Tablet", label: "Tablet", value: 0 },
      { id: "Computer", label: "Computer", value: 0 },
    ];
  }

  const deviceStats = shopAnalytics.deviceStats as Record<string, number>;
  const totalDevices = Object.values(deviceStats).reduce(
    (sum, count) => sum + count,
    0,
  );

  const deviceCategories = {
    Phone: 0,
    Tablet: 0,
    Computer: 0,
  };

  Object.entries(deviceStats).forEach(([device, count]) => {
    const deviceLower = device.toLowerCase();
    if (
      deviceLower.includes("phone") ||
      deviceLower.includes("mobile") ||
      deviceLower.includes("android") ||
      deviceLower.includes("iphone")
    ) {
      deviceCategories.Phone += count;
    } else if (deviceLower.includes("tablet") || deviceLower.includes("ipad")) {
      deviceCategories.Tablet += count;
    } else {
      deviceCategories.Computer += count;
    }
  });

  return [
    {
      id: "Phone",
      label: "Phone",
      value:
        totalDevices > 0
          ? Math.round((deviceCategories.Phone / totalDevices) * 100)
          : 0,
    },
    {
      id: "Tablet",
      label: "Tablet",
      value:
        totalDevices > 0
          ? Math.round((deviceCategories.Tablet / totalDevices) * 100)
          : 0,
    },
    {
      id: "Computer",
      label: "Computer",
      value:
        totalDevices > 0
          ? Math.round((deviceCategories.Computer / totalDevices) * 100)
          : 0,
    },
  ];
}

export async function fetchShopTopSellingProducts(sellerId: string) {
  const shop = await prisma.shops.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!shop) return [];

  const products = await prisma.products.findMany({
    where: { shopId: shop.id, isDeleted: false },
    select: {
      id: true,
      title: true,
      category: true,
      ratings: true,
      images: {
        select: { url: true },
        take: 1,
      },
    },
  });

  const productIds = products.map((p) => p.id);
  const orderItems = await prisma.order_items.findMany({
    where: { productId: { in: productIds } },
    select: {
      productId: true,
      quantity: true,
      price: true,
    },
  });

  const productSales = products.map((product) => {
    const items = orderItems.filter((item) => item.productId === product.id);
    const totalSold = items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    const revenue = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0,
    );

    return {
      id: product.id,
      name: product.title,
      totalSold,
      revenue,
      rating: product.ratings || 0,
      image: product.images[0]?.url,
      category: product.category,
    };
  });

  return productSales
    .filter((product) => product.totalSold > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}
