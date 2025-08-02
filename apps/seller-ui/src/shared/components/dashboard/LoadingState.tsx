import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <Loader2
          className={`${sizeClasses[size]} animate-spin text-blue-600 mx-auto mb-3`}
        />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export const LoadingCard: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <LoadingState message={message} />
    </div>
  );
};

export const LoadingGrid: React.FC<{
  columns?: number;
  rows?: number;
  message?: string;
}> = ({ columns = 3, rows = 2, message = "Loading dashboard data..." }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <LoadingState message={message} size="lg" />
      </div>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-4`}
      >
        {Array.from({ length: columns * rows }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
