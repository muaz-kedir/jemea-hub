import { Home, Library, GraduationCap, Award, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Home;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", active: true },
  { icon: Library, label: "Library" },
  { icon: GraduationCap, label: "Tutorial" },
  { icon: Award, label: "Training" },
  { icon: User, label: "Profile" },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-t-3xl border-t border-glass-border p-4">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={cn(
                "flex flex-col items-center gap-1 transition-smooth p-2 rounded-2xl",
                item.active && "bg-accent"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-smooth",
                  item.active ? "text-white" : "text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
