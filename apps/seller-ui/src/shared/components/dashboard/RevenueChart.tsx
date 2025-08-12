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

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-orange-600" />
              Revenue Trends
            </CardTitle>
            <CardDescription>
              Last 6 months • Total: ${totalRevenue.toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveLine
            data={data || []}
            margin={{ top: 30, right: 30, bottom: 60, left: 80 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: 0,
              max: "auto",
              stacked: false,
              reverse: false,
            }}
            yFormat=" >-$,.0f"
            curve="monotoneX"
            lineWidth={3}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: 0,
              legend: "Month",
              legendOffset: 40,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 12,
              tickRotation: 0,
              legend: "Revenue",
              legendOffset: -60,
              legendPosition: "middle",
              format: " >-$,.0f",
            }}
            pointSize={10}
            pointColor={{ from: "color" }}
            pointBorderWidth={3}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            enableArea={true}
            areaBaselineValue={0}
            areaOpacity={0.15}
            useMesh={true}
            enableSlices="x"
            colors={["#3b82f6"]}
            theme={{
              background: "transparent",
              axis: {
                domain: {
                  line: {
                    stroke: "transparent",
                  },
                },
                ticks: {
                  line: {
                    stroke: "transparent",
                  },
                  text: {
                    fontSize: 13,
                    fill: "#6b7280",
                    fontWeight: 500,
                  },
                },
                legend: {
                  text: {
                    fontSize: 14,
                    fill: "#374151",
                    fontWeight: 600,
                  },
                },
              },
              grid: {
                line: {
                  stroke: "#f1f5f9",
                  strokeWidth: 1,
                  strokeDasharray: "2 4",
                },
              },
              crosshair: {
                line: {
                  stroke: "#3b82f6",
                  strokeWidth: 1,
                  strokeOpacity: 0.5,
                  strokeDasharray: "6 6",
                },
              },
              tooltip: {
                container: {
                  background: "#ffffff",
                  color: "#1f2937",
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 12,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  border: "1px solid #e2e8f0",
                  padding: "12px 16px",
                },
              },
            }}
            sliceTooltip={({ slice }) => {
              return (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                  <div className="text-sm font-semibold text-gray-900 mb-2">
                    {slice.points[0].data.xFormatted}
                  </div>
                  {slice.points.map((point) => (
                    <div key={point.id} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: point.seriesColor }}
                      />
                      <span className="text-sm text-gray-600">Revenue:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${point.data.yFormatted}
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
