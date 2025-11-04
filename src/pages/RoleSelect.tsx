import { AuthLayout } from "@/components/AuthLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RoleSelect = () => {
  const navigate = useNavigate();

  const roles = [
    {
      icon: User,
      title: "Student",
      description: "Access tutorials, library resources, and training sessions",
    },
    {
      icon: Users,
      title: "Mentor",
      description: "Guide students and create educational content",
    },
    {
      icon: Building2,
      title: "Company",
      description: "Partner with us to provide training opportunities",
    },
  ];

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto animate-slide-up">
        <h1 className="text-3xl font-bold mb-2">Sign in as</h1>
        <p className="text-muted-foreground mb-8">Choose your role to continue</p>

        <div className="space-y-4 mb-8">
          {roles.map((role, index) => (
            <Card
              key={index}
              className="p-6 rounded-3xl cursor-pointer hover:shadow-lg transition-smooth border-2 hover:border-primary"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 navy-bg rounded-2xl flex items-center justify-center flex-shrink-0">
                  <role.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{role.title}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => navigate("/dashboard")}
          className="w-full h-12 rounded-full navy-bg hover:opacity-90 text-white"
          size="lg"
        >
          SEND
        </Button>
      </div>
    </AuthLayout>
  );
};

export default RoleSelect;
