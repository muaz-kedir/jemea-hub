import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto animate-slide-up">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
        <p className="text-muted-foreground mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

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

          <Button 
            type="submit" 
            className="w-full h-12 rounded-full navy-bg hover:opacity-90 text-white" 
            size="lg"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
