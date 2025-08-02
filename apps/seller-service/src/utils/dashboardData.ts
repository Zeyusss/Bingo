import prisma from "@packages/libs/prisma";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
} from "date-fns";

const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  USA: { lat: 37.7749, lng: -122.4194 },
  Egypt: { lat: 30.0444, lng: 31.2357 },
  UK: { lat: 51.5074, lng: -0.1278 },
  Germany: { lat: 52.52, lng: 13.405 },
  Canada: { lat: 45.4215, lng: -75.6997 },
};

export async function fetchShopRevenueData(
  sellerId: string,
  period: "7d" | "30d" | "90d" = "30d"
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

  const data = await Promise.all(
    dataPoints.map(async (d) => {
      const orders = await prisma.orders.findMany({
        where: {
          createdAt: {
            gte: d.start,
            lte: d.end,
          },
          status: "Paid",
          shop: {
            sellerId: sellerId,
          },
        },
        select: { total: true },
      });
      const total = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      return { x: d.label, y: total };
    })
  );

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

  const analytics = await prisma.shopAnalytics.findUnique({
    where: { shopId: shop.id },
  });

  const conversionRate = analytics?.totalVisitors
    ? Math.round((totalOrders / analytics.totalVisitors) * 100 * 100) / 100
    : 0;

  return {
    totalProducts,
    activeListings,
    ordersToday,
    totalRevenue: totalRevenue._sum.total || 0,
    conversionRate,
  };
}

export async function fetchShopRecentOrders(
  sellerId: string,
  limit: number = 5
) {
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

  const orders = await prisma.orders.findMany({
    where: { shopId: shop.id },
    select: { userId: true },
  });

  const userIds = [...new Set(orders.map((o) => o.userId))];

  if (userIds.length === 0) {
    return [
      { id: "Phone", label: "Phone", value: 0 },
      { id: "Tablet", label: "Tablet", value: 0 },
      { id: "Computer", label: "Computer", value: 0 },
    ];
  }

  const analytics = await prisma.userAnalytics.findMany({
    where: { userId: { in: userIds } },
    select: { device: true },
  });

  const counts = { Phone: 0, Tablet: 0, Computer: 0 };
  for (const a of analytics) {
    if (!a.device) continue;
    if (/phone/i.test(a.device)) counts.Phone++;
    else if (/tablet/i.test(a.device)) counts.Tablet++;
    else if (/computer|desktop|laptop/i.test(a.device)) counts.Computer++;
  }

  const total = counts.Phone + counts.Tablet + counts.Computer;

  return [
    {
      id: "Phone",
      label: "Phone",
      value: total ? Math.round((counts.Phone / total) * 100) : 0,
    },
    {
      id: "Tablet",
      label: "Tablet",
      value: total ? Math.round((counts.Tablet / total) * 100) : 0,
    },
    {
      id: "Computer",
      label: "Computer",
      value: total ? Math.round((counts.Computer / total) * 100) : 0,
    },
  ];
}

export async function fetchShopWorldActivity(sellerId: string) {
  const shop = await prisma.shops.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!shop) return [];

  const orders = await prisma.orders.findMany({
    where: { shopId: shop.id },
    select: { userId: true },
  });

  const userIds = [...new Set(orders.map((o) => o.userId))];

  if (userIds.length === 0) return [];

  const userAnalytics = await prisma.userAnalytics.findMany({
    where: { userId: { in: userIds } },
    select: { country: true },
  });

  const countryMap: Record<string, number> = {};
  for (const a of userAnalytics) {
    if (!a.country) continue;
    const c = a.country.trim();
    countryMap[c] = (countryMap[c] || 0) + 1;
  }

  return Object.entries(countryMap)
    .filter(([country]) => COUNTRY_COORDS[country])
    .map(([country, orders]) => ({
      lat: COUNTRY_COORDS[country].lat,
      lng: COUNTRY_COORDS[country].lng,
      orders,
      country,
    }));
}

export async function fetchShopVisitorAnalytics(sellerId: string) {
  const shop = await prisma.shops.findUnique({
    where: { sellerId },
    select: { id: true },
  });

  if (!shop) return [];

  const orders = await prisma.orders.findMany({
    where: { shopId: shop.id },
    select: { userId: true },
  });

  const userIds = [...new Set(orders.map((o) => o.userId))];

  if (userIds.length === 0) return [];

  const userAnalytics = await prisma.userAnalytics.findMany({
    where: { userId: { in: userIds } },
    select: { country: true, city: true },
  });

  const locationMap: Record<
    string,
    { country: string; state: string; visitors: number }
  > = {};

  for (const a of userAnalytics) {
    const country = a.country?.trim() || "Unknown";
    const state = a.city?.trim() || "Unknown"; 
    const key = `${country}-${state}`;

    if (!locationMap[key]) {
      locationMap[key] = { country, state, visitors: 0 };
    }
    locationMap[key].visitors++;
  }

  const totalVisitors = Object.values(locationMap).reduce(
    (sum, loc) => sum + loc.visitors,
    0
  );

  return Object.values(locationMap)
    .map((location) => ({
      ...location,
      percentage:
        totalVisitors > 0
          ? Math.round((location.visitors / totalVisitors) * 100 * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10);
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
      0
    );
    const revenue = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
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
