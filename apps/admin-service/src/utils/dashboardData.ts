import prisma from "@packages/libs/prisma";
import fetch from "node-fetch";
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  format,
  startOfDay,
  endOfDay,
} from "date-fns";
import os from "os";

// Example service URLs (update as needed)
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || "http://localhost:4002";
const USER_SERVICE = process.env.USER_SERVICE_URL || "http://localhost:4001";

// Static country coordinates for demo (should use a real geocoding service in production)
const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  USA: { lat: 37.7749, lng: -122.4194 },
  Egypt: { lat: 30.0444, lng: 31.2357 },
  UK: { lat: 51.5074, lng: -0.1278 },
  Germany: { lat: 52.52, lng: 13.405 },
  Canada: { lat: 45.4215, lng: -75.6997 },
};

export async function fetchRevenueData() {
  // Aggregate monthly revenue for the last 6 months
  const now = new Date();
  const months = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(now, 5 - i);
    return {
      label: format(date, "MMM"),
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  });

  const data = await Promise.all(
    months.map(async (m) => {
      const orders = await prisma.orders.findMany({
        where: {
          createdAt: {
            gte: m.start,
            lte: m.end,
          },
          status: "Paid",
        },
        select: { total: true },
      });
      const total = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      return { x: m.label, y: total };
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

export async function fetchDeviceUsage() {
  // Aggregate device usage from userAnalytics
  const analytics = await prisma.userAnalytics.findMany({
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

export async function fetchWorldActivity() {
  // Aggregate user and seller geolocation activity
  const userAnalytics = await prisma.userAnalytics.findMany({
    select: { country: true },
  });
  const sellers = await prisma.sellers.findMany({ select: { country: true } });
  const countryMap: Record<string, { users: number; sellers: number }> = {};
  for (const a of userAnalytics) {
    if (!a.country) continue;
    const c = a.country.trim();
    if (!countryMap[c]) countryMap[c] = { users: 0, sellers: 0 };
    countryMap[c].users++;
  }
  for (const s of sellers) {
    if (!s.country) continue;
    const c = s.country.trim();
    if (!countryMap[c]) countryMap[c] = { users: 0, sellers: 0 };
    countryMap[c].sellers++;
  }
  // Map to coordinates (demo: only countries in COUNTRY_COORDS)
  return Object.entries(countryMap)
    .filter(([country]) => COUNTRY_COORDS[country])
    .map(([country, counts]) => ({
      lat: COUNTRY_COORDS[country].lat,
      lng: COUNTRY_COORDS[country].lng,
      users: counts.users,
      sellers: counts.sellers,
      country,
    }));
}

export async function fetchSystemStats() {
  // Aggregate user, seller, order counts, uptime, latency
  const [totalUsers, activeSellers, ordersToday] = await Promise.all([
    prisma.users.count(),
    prisma.sellers.count(),
    prisma.orders.count({
      where: {
        createdAt: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
      },
    }),
  ]);
  // TODO: Replace with real uptime and latency monitoring
  const uptime = 99.98;
  const apiLatency = 120;
  return {
    totalUsers,
    activeSellers,
    ordersToday,
    uptime,
    apiLatency,
  };
}

export async function fetchResourceMonitor() {
  // System resource stats
  const cpuLoad = os.loadavg()[0]; // 1-minute load average
  const cpuCount = os.cpus().length;
  const cpu = Math.min(100, Math.round((cpuLoad / cpuCount) * 100));
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memory = Math.round(((totalMem - freeMem) / totalMem) * 100);
  // Disk usage: Node.js does not provide this natively, so mock for now
  const disk = 55; // TODO: Replace with real disk usage
  // Kafka health/lag: mock for now
  const kafkaHealth = "healthy";
  const kafkaLag = 3;
  return {
    cpu,
    memory,
    disk,
    kafkaHealth,
    kafkaLag,
  };
}
