import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole, canAccessAdminRoute } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  adminRoute?: "library" | "tutorial" | "training" | "resources";
}

export const ProtectedRoute = ({ children, allowedRoles, adminRoute }: ProtectedRouteProps) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle admin route protection
  if (adminRoute && userProfile) {
    const routePath = `/admin/${adminRoute}`;
    if (!canAccessAdminRoute(userProfile.role, routePath)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Handle general role-based protection
  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
