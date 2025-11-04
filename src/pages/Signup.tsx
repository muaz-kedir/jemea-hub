import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const Signup = () => {
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

        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Full name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              className="h-12 rounded-2xl bg-secondary border-0"
            />
          </div>

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
              placeholder="Min 8 characters"
              className="h-12 rounded-2xl bg-secondary border-0"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            By signing up you agree to our{" "}
            <span className="text-primary">Terms and Conditions</span>
          </p>

          <Button className="w-full h-12 rounded-full navy-bg hover:opacity-90 text-white" size="lg">
            sign up
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
