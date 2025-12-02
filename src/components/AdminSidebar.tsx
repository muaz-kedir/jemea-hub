import { Link, useLocation } from "react-router-dom";
import { useAuth, UserRole, canAccessAdminRoute } from "@/contexts/AuthContext";
import { 
  Library, 
  GraduationCap, 
  Award, 
  Shield, 
  Home,
  LogOut,
  User,
  FileText
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notifications";

interface SidebarItem {
  title: string;
  icon: React.ElementType;
  path: string;
  allowedRoles: UserRole[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Super Admin Dashboard",
    icon: Shield,
    path: "/admin-dashboard",
    allowedRoles: ["super_admin"],
  },
  {
    title: "Library Dashboard",
    icon: Library,
    path: "/admin/library",
    allowedRoles: ["library_admin", "super_admin"],
  },
  {
    title: "Tutorial Dashboard",
    icon: GraduationCap,
    path: "/admin/tutorial",
    allowedRoles: ["tutorial_admin", "super_admin"],
  },
  {
    title: "Training Dashboard",
    icon: Award,
    path: "/admin/training",
    allowedRoles: ["training_admin", "super_admin"],
  },
  {
    title: "Resource Management",
    icon: FileText,
    path: "/admin/resources",
    allowedRoles: ["super_admin"],
  },
];

export const AdminSidebar = () => {
  const { userProfile, signOut } = useAuth();
  const location = useLocation();
  const currentRole = userProfile?.role || "student";

  // Filter sidebar items based on user role
  const visibleItems = sidebarItems.filter(item => 
    item.allowedRoles.includes(currentRole as UserRole)
  );

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "bg-red-500";
      case "library_admin":
        return "bg-blue-500";
      case "tutorial_admin":
        return "bg-green-500";
      case "training_admin":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "library_admin":
        return "Library Admin";
      case "tutorial_admin":
        return "Tutorial Admin";
      case "training_admin":
        return "Training Admin";
      default:
        return role;
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-white",
            getRoleBadgeColor(currentRole as UserRole)
          )}>
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {userProfile?.firstName || "Admin"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {getRoleDisplayName(currentRole as UserRole)}
            </p>
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Link
          to="/landing"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-3 h-auto text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => signOut()}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};
