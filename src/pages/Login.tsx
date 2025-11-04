import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Chrome, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <AuthLayout>
      <div className="max-w-md mx-auto animate-slide-up">
        <h1 className="text-3xl font-bold mb-8">Login</h1>

        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className="h-12 rounded-2xl bg-secondary border-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter Password"
              className="h-12 rounded-2xl bg-secondary border-0"
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

          <Button className="w-full h-12 rounded-full navy-bg hover:opacity-90 text-white" size="lg">
            log in
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
