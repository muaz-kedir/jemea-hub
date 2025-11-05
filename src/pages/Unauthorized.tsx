import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <ShieldAlert className="w-20 h-20 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="navy-bg hover:opacity-90 text-white"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
