"use client";
import { motion } from "framer-motion";
import { Users, Store, ShoppingCart, Activity, Timer } from "lucide-react";

export interface SystemStatsOverviewProps {
  stats: {
    totalUsers: number;
    activeSellers: number;
    ordersToday: number;
    uptime: number;
    apiLatency: number;
  };
}

const cards = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: <Users className="text-sky-400" size={28} />,
  },
  {
    key: "activeSellers",
    label: "Active Sellers",
    icon: <Store className="text-emerald-400" size={28} />,
  },
  {
    key: "ordersToday",
    label: "Orders Today",
    icon: <ShoppingCart className="text-pink-400" size={28} />,
  },
  {
    key: "uptime",
    label: "Uptime %",
    icon: <Activity className="text-green-400" size={28} />,
  },
  {
    key: "apiLatency",
    label: "API Latency (ms)",
    icon: <Timer className="text-yellow-400" size={28} />,
  },
];

export default function SystemStatsOverview({
  stats,
}: SystemStatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.key}
          className="bg-zinc-900 rounded-xl p-4 flex flex-col items-center shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          {card.icon}
          <div className="text-zinc-400 text-xs mt-2 mb-1">{card.label}</div>
          <motion.div
            className="text-2xl font-bold text-white"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
          >
            {stats[card.key as keyof typeof stats]}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
