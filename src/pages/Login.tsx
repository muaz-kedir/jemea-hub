import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Chrome, Facebook } from "lucide-react";
import { useAuth, getAdminDashboardRoute, UserRole } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await signIn(email, password);
      toast.success("Logged in successfully!");

      const roleDoc = await getDoc(doc(db, "user_roles", userCredential.user.uid));
      const role = (roleDoc.exists() ? roleDoc.data().role : "student") as UserRole;

      // Handle admin roles with dedicated dashboards
      const adminRoles: UserRole[] = ["super_admin", "library_admin", "tutorial_admin", "training_admin"];
      
      if (adminRoles.includes(role)) {
        const dashboardRoute = getAdminDashboardRoute(role);
        navigate(dashboardRoute, { replace: true });
      } else {
        // Handle other roles
        switch (role) {
          case "librarian":
            navigate("/library-dashboard", { replace: true });
            break;
          case "tutor":
            navigate("/tutor-dashboard", { replace: true });
            break;
          case "trainer":
            navigate("/trainer-dashboard", { replace: true });
            break;
          default:
            navigate("/landing", { replace: true });
            break;
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to log in";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto animate-slide-up">
        <h1 className="text-3xl font-bold mb-8">Login</h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className="h-12 rounded-2xl bg-secondary border-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter Password"
              className="h-12 rounded-2xl bg-secondary border-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-full navy-bg hover:opacity-90 text-white" 
            size="lg"
            disabled={loading}
          >
            {loading ? "Logging in..." : "log in"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Sign in with</p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
                <Chrome className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
                <Facebook className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
