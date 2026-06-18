import React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
  size?: "sm" | "md" | "lg";
}

export function GradientButton({
  children,
  className,
  asChild = false,
  size = "md",
  disabled,
  ...props
}: GradientButtonProps) {
  const Comp = asChild ? Slot : "button";

  const sizeClasses = {
    sm: "h-9 px-4 text-xs",
    md: "h-10 md:h-12 px-4 md:px-8 text-xs md:text-sm",
    lg: "h-12 md:h-14 px-6 md:px-10 text-sm md:text-base",
  };

  return (
    <Comp
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl",
        "bg-gradient-to-b from-primary/90 to-primary",
        "font-semibold text-primary-foreground",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_4px_rgba(0,0,0,0.15),0_12px_24px_rgba(0,0,0,0.15)]",
        "ring-1 ring-primary/20",
        "transition-transform duration-200",
        "hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Comp>
  );
}
