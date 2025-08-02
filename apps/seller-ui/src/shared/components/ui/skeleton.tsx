import { cn } from "../../../utils/cn"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-100 dark:bg-gray-800",
        className
      )}
      {...props}
    />
  );
}
