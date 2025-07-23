import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Skeleton } from './ui/Skeleton';
import { useResourceMonitor } from '../hooks/useDashboardData';
import { Cpu, HardDrive, Database, Activity } from 'lucide-react';

const healthColor = {
  healthy: "bg-green-500",
  warning: "bg-yellow-500",
  critical: "bg-red-600",
};

const ResourceMonitor: React.FC = () => {
  const { data: resources, isLoading, error } = useResourceMonitor();

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
          <div className="grid grid-cols-2 gap-4">
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
          <CardTitle className="text-red-600">Resource Monitor</CardTitle>
          <CardDescription>Failed to load resource data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-gray-500">
            Unable to load resource data
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resources) {
    return null;
  }
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              System Resources
            </CardTitle>
            <CardDescription>
              Real-time system performance
            </CardDescription>
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
              <span className="text-sm font-semibold text-gray-900">{resources.cpu}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${resources.cpu}%` }}
              />
            </div>
          </div>

          {/* Memory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Memory</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{resources.memory}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
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
              <span className="text-sm font-semibold text-gray-900">{resources.disk}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${resources.disk}%` }}
              />
            </div>
          </div>

          {/* Kafka Health */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Kafka Health</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    healthColor[resources.kafkaHealth as keyof typeof healthColor]
                  }`}
                />
                <span className="text-sm font-semibold text-gray-900 capitalize">
                  {resources.kafkaHealth}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Lag: {resources.kafkaLag}ms
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceMonitor;
