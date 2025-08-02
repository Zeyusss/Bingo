"use client";
import React from "react";
import { Card, CardContent } from "./ui/Card";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package 
} from "lucide-react";

interface QuickStatsProps {
  className?: string;
}

export default function QuickStats({ className = "" }: QuickStatsProps) {
  const stats = [
    {
      title: "Today's Sales",
      value: "$1,247",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Pending Orders",
      value: "23",
      change: "+3",
      trend: "up",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Customers",
      value: "1,432",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Low Stock Items",
      value: "7",
      change: "-2",
      trend: "down",
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
        const trendColor = stat.trend === "up" ? "text-green-600" : "text-red-600";
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-inter">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1 font-inter">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendIcon className={`h-4 w-4 ${trendColor} mr-1`} />
                    <span className={`text-sm font-medium ${trendColor} font-inter`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1 font-inter">
                      vs yesterday
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
