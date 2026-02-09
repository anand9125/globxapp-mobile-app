"use client";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "table" | "chart";
  lines?: number;
}

export function LoadingSkeleton({
  className = "",
  variant = "card",
  lines = 1,
}: LoadingSkeletonProps) {
  if (variant === "text") {
    return (
      <div className={`animate-pulse ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-bg-tertiary rounded mb-2"
            style={{ width: i === lines - 1 ? "60%" : "100%" }}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-bg-secondary border border-border rounded-2xl p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-bg-tertiary rounded w-1/3 mb-4" />
        <div className="h-4 bg-bg-tertiary rounded w-2/3" />
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-16 bg-bg-tertiary rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className={`bg-bg-secondary border border-border rounded-2xl p-6 h-[300px] animate-pulse ${className}`}>
        <div className="h-full bg-bg-tertiary rounded" />
      </div>
    );
  }

  return <div className={`bg-bg-tertiary rounded animate-pulse ${className}`} />;
}
