import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import { Skeleton } from './Skeleton';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
  icon,
  isLoading,
  className,
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendVariant = () => {
    switch (trend?.direction) {
      case 'up':
        return 'success';
      case 'down':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card className={cn('hover:shadow-lg transition-all duration-200', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon && (
            <div className="text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="flex items-center justify-between">
            {description && (
              <p className="text-xs text-gray-500 flex-1">
                {description}
              </p>
            )}
            {trend && (
              <Badge
                variant={getTrendVariant()}
                size="sm"
                className="ml-2 flex items-center gap-1"
              >
                {getTrendIcon()}
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
