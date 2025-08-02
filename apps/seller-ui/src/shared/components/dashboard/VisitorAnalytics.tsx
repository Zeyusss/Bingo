"use client";
import { Users, MapPin, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { useVisitorAnalytics } from "../../../hooks/useDashboardData";

interface VisitorData {
  country: string;
  state: string;
  visitors: number;
  percentage: number;
}

export default function VisitorAnalytics() {
  const { data, isLoading, error } = useVisitorAnalytics();

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-red-600">Visitor Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            Failed to load visitor data
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVisitors = data?.reduce((sum: number, item: VisitorData) => sum + item.visitors, 0) || 0;
  const topCountry = data?.[0];
  const topState = data?.find((item: VisitorData) => item.state && item.state !== "Unknown") || data?.[0];

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Visitor Analytics
            </CardTitle>
            <p className="text-sm text-gray-600">
              Where your visitors come from • Total: {totalVisitors.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">+12.5%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Top Country */}
          {topCountry && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Top Country</span>
                </div>
                <span className="text-sm font-medium text-blue-700">
                  {topCountry.percentage}%
                </span>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {topCountry.country}
              </div>
              <div className="text-sm text-blue-600">
                {topCountry.visitors.toLocaleString()} visitors
              </div>
            </div>
          )}

          {/* Top State */}
          {topState && topState.state && topState.state !== "Unknown" && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Top State</span>
                </div>
                <span className="text-sm font-medium text-green-700">
                  {topState.percentage}%
                </span>
              </div>
              <div className="text-lg font-bold text-green-900">
                {topState.state}, {topState.country}
              </div>
              <div className="text-sm text-green-600">
                {topState.visitors.toLocaleString()} visitors
              </div>
            </div>
          )}

          {/* Visitor List */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">All Locations</h4>
            {data?.slice(0, 5).map((item: VisitorData, index: number) => (
              <motion.div
                key={`${item.country}-${item.state}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.state && item.state !== "Unknown" 
                        ? `${item.state}, ${item.country}`
                        : item.country
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.visitors.toLocaleString()} visitors
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {item.percentage}%
                  </div>
                  <div className="text-sm text-gray-500">
                    of total
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 