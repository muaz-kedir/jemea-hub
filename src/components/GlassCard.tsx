import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover = false }: GlassCardProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-3xl p-6 transition-smooth",
        hover && "hover:scale-[1.02] hover:shadow-glow cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};
