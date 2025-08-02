"use client";
import {
  Users,
  MapPin,
  TrendingUp,
  Globe,
  Building2,
  BarChart3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { useVisitorAnalytics } from "../../../hooks/useDashboardData";
import { Button } from "./ui/Button";

interface VisitorData {
  totalVisitors: number;
  topCountry: {
    country: string;
    visitors: number;
    states: number;
    cities: string[];
    percentage: number;
  } | null;
  topState: {
    country: string;
    state: string;
    visitors: number;
    cities: string[];
    percentage: number;
  } | null;
  countries: Array<{
    country: string;
    visitors: number;
    states: number;
    cities: string[];
    percentage: number;
  }>;
  locations: Array<{
    country: string;
    state: string;
    visitors: number;
    cities: string[];
    percentage: number;
  }>;
}

export default function VisitorAnalytics() {
  const { data, isLoading, error, refetch } = useVisitorAnalytics();

  if (isLoading) {
    return (
      <Card className="h-full bg-white border border-gray-200">
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
      <Card className="h-full bg-white border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Users className="h-5 w-5" />
                Visitor Analytics
              </CardTitle>
              <CardDescription>Failed to load visitor data</CardDescription>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-gray-500">Unable to load visitor data</p>
              <p className="text-sm text-gray-400">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }


  const isVisitorData = (data: any): data is VisitorData => {
    return (
      data &&
      typeof data === "object" &&
      typeof data.totalVisitors === "number" &&
      Array.isArray(data.countries) &&
      Array.isArray(data.locations)
    );
  };


  const visitorData: VisitorData = isVisitorData(data)
    ? data
    : {
        totalVisitors: 0,
        topCountry: null,
        topState: null,
        countries: [],
        locations: [],
      };

  const { totalVisitors, topCountry, topState, countries, locations } =
    visitorData;


  const getCityCount = (cities: string[] | undefined) => {
    if (!cities || !Array.isArray(cities)) return 0;
    return cities.length;
  };


  if (totalVisitors === 0) {
    return (
      <Card className="h-full bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-700" />
                Visitor Analytics
              </CardTitle>
              <p className="text-sm text-gray-600">
                No visitors yet • Start promoting your shop to see analytics
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">No data</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No visitors yet</p>
              <p className="text-sm">
                Share your shop link to start tracking visitors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-700" />
              Visitor Analytics
            </CardTitle>
            <p className="text-sm text-gray-600">
              Real visitor insights • Total: {totalVisitors.toLocaleString()}{" "}
              visitors
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topCountry && (
              <motion.div
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">
                      Top Country
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {topCountry.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">of total</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {topCountry.country}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {topCountry.visitors.toLocaleString()} visitors
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{topCountry.states} states</span>
                  <span>{getCityCount(topCountry.cities)} cities</span>
                </div>
              </motion.div>
            )}
            {topState && topState.state && topState.state !== "Unknown" && (
              <motion.div
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">
                      Top State
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {topState.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">of total</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {topState.state}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {topState.visitors.toLocaleString()} visitors
                </div>
                <div className="text-xs text-gray-500">{topState.country}</div>
              </motion.div>
            )}
          </div>

          {countries && countries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-600" />
                <h4 className="font-semibold text-gray-900">
                  Countries by Visitors
                </h4>
              </div>
              {countries.map((country, index) => (
                <motion.div
                  key={country.country}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {country.country}
                      </div>
                      <div className="text-sm text-gray-500">
                        {country.visitors.toLocaleString()} visitors •{" "}
                        {getCityCount(country.cities)} cities
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {country.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">of total</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {locations && locations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <h4 className="font-semibold text-gray-900">
                  Top Cities & States
                </h4>
              </div>
              {locations.slice(0, 5).map((location, index) => (
                <motion.div
                  key={`${location.country}-${location.state}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {location.state}
                      </div>
                      <div className="text-sm text-gray-500">
                        {location.country} •{" "}
                        {location.visitors.toLocaleString()} visitors
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {location.percentage}%
                    </div>
                    <div className="text-xs text-gray-500">of total</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
