"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { 
  Clock, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  User,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface ActivityItem {
  id: number;
  type: 'order' | 'product' | 'payment' | 'customer' | 'alert' | 'success';
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
  bgColor: string;
}

export default function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      description: 'Order #1234 from John Doe - $89.99',
      time: '2 minutes ago',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Processed',
      description: 'Weekly payout of $1,245.67 processed',
      time: '1 hour ago',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 3,
      type: 'product',
      title: 'Product Updated',
      description: 'iPhone Case - Price updated to $24.99',
      time: '2 hours ago',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 4,
      type: 'customer',
      title: 'New Customer Registration',
      description: 'Sarah Wilson joined your shop',
      time: '3 hours ago',
      icon: User,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      id: 5,
      type: 'alert',
      title: 'Low Stock Alert',
      description: 'Wireless Headphones - Only 3 items left',
      time: '4 hours ago',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 6,
      type: 'success',
      title: 'Order Delivered',
      description: 'Order #1230 successfully delivered',
      time: '5 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-inter">
          <Clock className="h-5 w-5 text-gray-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className={`h-5 w-5 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 font-inter">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-inter">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium font-inter">
            View All Activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
