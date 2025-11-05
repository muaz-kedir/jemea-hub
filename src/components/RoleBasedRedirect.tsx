import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const RoleBasedRedirect = () => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userProfile) {
      switch (userProfile.role) {
        case "librarian":
          navigate("/library-dashboard", { replace: true });
          break;
        case "tutor":
          navigate("/tutor-dashboard", { replace: true });
          break;
        case "trainer":
          navigate("/trainer-dashboard", { replace: true });
          break;
        case "super_admin":
          navigate("/admin-dashboard", { replace: true });
          break;
        case "student":
        default:
          navigate("/dashboard", { replace: true });
          break;
      }
    }
  }, [userProfile, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};
