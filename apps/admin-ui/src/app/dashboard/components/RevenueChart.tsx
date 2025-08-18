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
import { DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./ui/Button";

const RevenueChart: React.FC = () => {
  const { data, isLoading, error, refetch } = useRevenueData();

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
          <Skeleton className="h-64 w-full" />
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
              <CardTitle className="flex items-center gap-2 text-red-600 font-Poppins">
                <DollarSign className="h-5 w-5" />
                Revenue Chart
              </CardTitle>
              <CardDescription className="font-Roboto">Failed to load revenue data</CardDescription>
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
              <p className="text-gray-500">Unable to load chart data</p>
              <p className="text-sm text-gray-400">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRevenue = Array.isArray(data) && data[0]?.data
    ? data[0].data.reduce((sum: number, point: any) => sum + point.y, 0)
    : 0;
  const currentMonth = Array.isArray(data) && data[0]?.data
    ? data[0].data[data[0].data.length - 1]?.y || 0
    : 0;
  const previousMonth = Array.isArray(data) && data[0]?.data
    ? data[0].data[data[0].data.length - 2]?.y || 0
    : 0;
  const growth =
    previousMonth > 0
      ? ((currentMonth - previousMonth) / previousMonth) * 100
      : 0;

 
  const formatMonth = (monthStr: string) => {
    if (!monthStr) return "";
    const months = {
      "01": "Jan",
      "02": "Feb",
      "03": "Mar",
      "04": "Apr",
      "05": "May",
      "06": "Jun",
      "07": "Jul",
      "08": "Aug",
      "09": "Sep",
      "10": "Oct",
      "11": "Nov",
      "12": "Dec",
    };

   
    if (monthStr.includes("-")) {
      const parts = monthStr.split("-");
      if (parts.length >= 2) {
        const month = parts[1];
        return months[month as keyof typeof months] || monthStr;
      }
    }

 
    const month = monthStr.substring(0, 3).toLowerCase();
    const monthMap: { [key: string]: string } = {
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec",
    };

    return monthMap[month] || monthStr;
  };

 
  const processedData = Array.isArray(data) 
    ? data.map((series: any) => ({
        ...series,
        data: series.data.map((point: any) => ({
          ...point,
          x: formatMonth(point.x),
        })),
      }))
    : [];

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 font-Poppins">
              <DollarSign className="h-5 w-5 text-red-600" />
              Revenue Trends
            </CardTitle>
            <CardDescription className="font-Roboto">
              Last 6 months • Total: ${totalRevenue.toLocaleString()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveLine
            data={processedData}
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
            }}
            pointSize={10}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            colors={["#10b981"]}
            lineWidth={3}
            enableArea={true}
            areaOpacity={0.1}
            theme={{
              axis: {
                domain: {
                  line: {
                    stroke: "#d1d5db",
                  },
                },
                legend: {
                  text: {
                    fill: "#6b7280",
                    fontSize: 12,
                  },
                },
                ticks: {
                  line: {
                    stroke: "#d1d5db",
                    strokeWidth: 1,
                  },
                  text: {
                    fill: "#6b7280",
                    fontSize: 11,
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
                  borderRadius: 6,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
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
