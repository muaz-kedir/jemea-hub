import { GlassCard } from "./GlassCard";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: "primary" | "secondary" | "accent";
}

export const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) => {
  const colorClasses = {
    primary: "from-primary to-primary/80",
    secondary: "from-secondary to-secondary/80",
    accent: "from-accent to-accent/80",
  };

  return (
    <GlassCard hover className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-10`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <span className="text-sm text-accent font-semibold">{trend}</span>
          )}
        </div>
        <h3 className="text-sm text-muted-foreground mb-1">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </GlassCard>
  );
};
