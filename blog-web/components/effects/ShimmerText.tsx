import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
}

export function ShimmerText({
  children,
  className,
  as: Component = "span",
}: ShimmerTextProps) {
  return (
    <Component
      className={cn(
        "shimmer-text inline-block",
        className
      )}
    >
      {children}
    </Component>
  );
}
