import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(false);
  const { signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signUp(email, password, role);
      toast.success("Account created successfully!");
      navigate("/home");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to sign up";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <div className="max-w-md mx-auto animate-slide-up">
        <h1 className="text-3xl font-bold mb-6">Signup</h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Full name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              className="h-12 rounded-2xl bg-secondary border-0"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Min 8 characters"
              className="h-12 rounded-2xl bg-secondary border-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm">Select Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger className="h-12 rounded-2xl bg-secondary border-0">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="tutor">Tutor</SelectItem>
                <SelectItem value="trainer">Trainer</SelectItem>
                <SelectItem value="librarian">Librarian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            By signing up you agree to our{" "}
            <span className="text-primary">Terms and Conditions</span>
          </p>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-full navy-bg hover:opacity-90 text-white" 
            size="lg"
            disabled={loading}
          >
            {loading ? "Creating account..." : "sign up"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Signup;
