import { Button } from "@/components/ui/button";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, getAdminDashboardRoute } from "@/contexts/AuthContext";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  // Get the appropriate dashboard for the user's role
  const getDashboardLink = () => {
    if (!userProfile) return "/landing";
    
    const adminRoles = ["super_admin", "library_admin", "tutorial_admin", "training_admin"];
    if (adminRoles.includes(userProfile.role)) {
      return getAdminDashboardRoute(userProfile.role);
    }
    
    return "/landing";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-red-500/10">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-2">
          You don't have permission to access this page.
        </p>
        {userProfile && (
          <p className="text-sm text-muted-foreground mb-6">
            Your current role: <span className="font-semibold text-primary">{userProfile.role.replace("_", " ")}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Link to={getDashboardLink()}>
            <Button className="gap-2 w-full">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
