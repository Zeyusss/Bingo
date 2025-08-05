import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/Card";
import { Skeleton } from "./ui/Skeleton";
import { useResourceMonitor } from "../../../hooks/useDashboardData";
import {
  Cpu,
  HardDrive,
  Database,
  Activity,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/Button";

const healthColor = {
  healthy: "bg-green-500",
  warning: "bg-yellow-500",
  critical: "bg-red-600",
};

const ResourceMonitor: React.FC = () => {
  const { data: resources, isLoading, error, refetch } = useResourceMonitor();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-12" />
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Activity className="h-5 w-5" />
                Resource Monitor
              </CardTitle>
              <CardDescription>Failed to load resource data</CardDescription>
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
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-gray-500">Unable to load resource data</p>
              <p className="text-sm text-gray-400">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resources) {
    return null;
  }

  const getHealthStatus = (value: number) => {
    if (value < 70) return "healthy";
    if (value < 90) return "warning";
    return "critical";
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              System Resources
            </CardTitle>
            <CardDescription>Real-time system performance</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* CPU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">CPU</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {resources.cpu}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  healthColor[getHealthStatus(resources.cpu)]
                }`}
                style={{ width: `${resources.cpu}%` }}
              />
            </div>
          </div>

          {/* Memory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Memory
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {resources.memory}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  healthColor[getHealthStatus(resources.memory)]
                }`}
                style={{ width: `${resources.memory}%` }}
              />
            </div>
          </div>

          {/* Disk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Disk</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {resources.disk}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  healthColor[getHealthStatus(resources.disk)]
                }`}
                style={{ width: `${resources.disk}%` }}
              />
            </div>
          </div>

          {/* Kafka Health */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Kafka</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    healthColor[
                      resources.kafkaHealth as keyof typeof healthColor
                    ] || "bg-gray-400"
                  }`}
                />
                <span className="text-sm font-semibold text-gray-900">
                  {resources.kafkaHealth}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Lag: {resources.kafkaLag}ms
            </div>
          </div>
        </div>

        {/* System Status Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              System Status
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">
                Operational
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
            <div>
              CPU:{" "}
              {resources.cpu < 70
                ? "Normal"
                : resources.cpu < 90
                ? "Warning"
                : "Critical"}
            </div>
            <div>
              Memory:{" "}
              {resources.memory < 70
                ? "Normal"
                : resources.memory < 90
                ? "Warning"
                : "Critical"}
            </div>
            <div>
              Disk:{" "}
              {resources.disk < 70
                ? "Normal"
                : resources.disk < 90
                ? "Warning"
                : "Critical"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceMonitor;
