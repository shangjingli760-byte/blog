import React from "react";
import { cn } from "@/lib/utils";

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "card" | "navbar" | "strong";
  blur?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  as?: "div" | "section" | "article" | "header" | "nav";
}

const blurMap = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

const variantMap = {
  default: "bg-white/5 border-white/10",
  card: "bg-white/3 border-white/8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
  navbar: "bg-white/2 border-b border-white/10",
  strong: "bg-white/10 border-white/20",
};

export function GlassContainer({
  children,
  className,
  variant = "default",
  blur = "md",
  glow = false,
  as: Component = "div",
}: GlassContainerProps) {
  return (
    <Component
      className={cn(
        "relative rounded-lg border transition-all duration-300",
        blurMap[blur],
        variantMap[variant],
        glow && "hover:shadow-[0_0_30px_rgba(162,89,255,0.3)]",
        className
      )}
    >
      {children}
    </Component>
  );
}
