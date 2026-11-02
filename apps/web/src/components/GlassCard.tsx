import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  strong?: boolean;
}

export function GlassCard({ children, strong = false, className = "", ...rest }: GlassCardProps) {
  return (
    <div className={`${strong ? "glass-strong" : "glass"} rounded-ios-lg ${className}`} {...rest}>
      {children}
    </div>
  );
}
