"use client";
import { Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { useWorldMapActivity } from "../../../hooks/useDashboardData";
import "leaflet/dist/leaflet.css";

export default function WorldMapActivity() {
  const { data, isLoading, error } = useWorldMapActivity();

  if (isLoading) {
    return (
      <div className="h-full">
        <motion.div
          className="bg-zinc-900 rounded-xl p-6 shadow-lg flex flex-col h-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-4">
            <Globe2 className="text-emerald-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">
              User & Seller Distribution
            </h2>
          </div>
          <div className="h-64 w-full rounded-lg overflow-hidden">
            <motion.div className="h-full w-full" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Failed to load world activity data
      </div>
    );
  }

  if (typeof window === "undefined") return null;
  const {
    MapContainer,
    TileLayer,
    CircleMarker,
    Tooltip,
  } = require("react-leaflet");

  return (
    <motion.div
      className="bg-zinc-900 rounded-xl p-6 shadow-lg flex flex-col h-full"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center mb-4">
        <Globe2 className="text-emerald-400 mr-2" />
        <h2 className="text-lg font-semibold text-white">
          User & Seller Distribution
        </h2>
      </div>
      <div className="h-64 w-full rounded-lg overflow-hidden">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%", background: "#18181b" }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {data?.map((loc: any, i: number) => (
            <CircleMarker
              key={i}
              center={[loc.lat, loc.lng]}
              radius={8 + Math.log(loc.users + loc.sellers)}
              pathOptions={{
                color: "#22d3ee",
                fillColor: "#22d3ee",
                fillOpacity: 0.5,
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -8]}
                opacity={1}
                permanent={false}
                className="bg-zinc-800 text-white rounded px-2 py-1"
              >
                <div className="font-bold">{loc.country}</div>
                <div>Users: {loc.users}</div>
                <div>Sellers: {loc.sellers}</div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </motion.div>
  );
}
