import { Home, Library, GraduationCap, Award, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Library, label: "Library", path: "/library-dashboard" },
  { icon: GraduationCap, label: "Tutorial", path: "/tutor-dashboard" },
  { icon: Award, label: "Training", path: "/trainer-dashboard" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-t-3xl border-t border-glass-border p-4">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 transition-smooth p-2 rounded-2xl",
                isActive && "bg-accent"
              )}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-smooth",
                  isActive ? "text-white" : "text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
};
