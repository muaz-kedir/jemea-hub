import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signUp(email, password);
      toast.success("Account created successfully!");
      navigate("/welcome");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <div className="max-w-md mx-auto animate-slide-up">
        <h1 className="text-3xl font-bold mb-6">Signup</h1>

        <Tabs defaultValue="student" className="mb-6">
          <TabsList className="grid w-full grid-cols-2 h-12 rounded-full bg-secondary">
            <TabsTrigger value="student" className="rounded-full">Student</TabsTrigger>
            <TabsTrigger value="company" className="rounded-full">Company</TabsTrigger>
          </TabsList>
        </Tabs>

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
