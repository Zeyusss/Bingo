import React from "react";
import { ResponsiveLine } from "@nivo/line";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { useRevenueData } from "../../../hooks/useDashboardData";
import { TrendingUp, DollarSign } from "lucide-react";

const RevenueChart: React.FC = () => {
  const { data, isLoading, error } = useRevenueData();

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
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-red-600">Revenue Chart</CardTitle>
          <CardDescription>Failed to load revenue data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            Unable to load chart data
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue =
    data?.[0]?.data?.reduce(
      (sum: number, point: any) => sum + (point.y || 0),
      0
    ) || 0;
  const currentMonth = data?.[0]?.data?.[data[0].data.length - 1]?.y || 0;
  const previousMonth = data?.[0]?.data?.[data[0].data.length - 2]?.y || 0;
  const growth =
    previousMonth > 0
      ? ((currentMonth - previousMonth) / previousMonth) * 100
      : 0;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Revenue Trends
            </CardTitle>
            <CardDescription>
              Last 6 months • Total: ${totalRevenue.toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">
              {growth > 0 ? "+" : ""}
              {growth.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveLine
            data={data || []}
            margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: "auto",
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-$,.0f"
            curve="cardinal"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Month",
              legendOffset: 36,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Revenue ($)",
              legendOffset: -50,
              legendPosition: "middle",
              format: " >-$,.0f",
            }}
            pointSize={8}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            enableArea={true}
            areaOpacity={0.1}
            useMesh={true}
            colors={["#10b981"]}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fontSize: 12,
                    fill: "#6b7280",
                  },
                },
                legend: {
                  text: {
                    fontSize: 12,
                    fill: "#374151",
                    fontWeight: 500,
                  },
                },
              },
              grid: {
                line: {
                  stroke: "#f3f4f6",
                  strokeWidth: 1,
                },
              },
              tooltip: {
                container: {
                  background: "#ffffff",
                  color: "#374151",
                  fontSize: 12,
                  borderRadius: 8,
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  border: "1px solid #e5e7eb",
                },
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
