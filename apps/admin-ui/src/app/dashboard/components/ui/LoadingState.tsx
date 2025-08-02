import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC<{
  message?: string;
  size?: "sm" | "md" | "lg";
}> = ({ message = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center gap-3 p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  );
};

export const LoadingCard: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = "Loading data...", className = "" }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
    >
      <LoadingState message={message} size="md" />
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
