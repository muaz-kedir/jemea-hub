import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "accent";
}

export const QuickAction = ({ icon: Icon, label, onClick, variant = "primary" }: QuickActionProps) => {
  const variantClasses = {
    primary: "from-primary to-primary/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]",
    secondary: "from-secondary to-secondary/80 hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]",
    accent: "from-accent to-accent/80 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-smooth",
        "bg-gradient-to-br text-white",
        "hover:scale-105 active:scale-95",
        variantClasses[variant]
      )}
    >
      <Icon className="w-8 h-8" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
};
