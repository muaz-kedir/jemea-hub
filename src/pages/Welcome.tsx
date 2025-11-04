import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen navy-bg flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="text-center space-y-6 mb-12">
        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <GraduationCap className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Welcome</h1>
        <p className="text-white/80 text-lg leading-relaxed max-w-sm mx-auto">
          LEARN DEEPLY WITH<br />
          TEACH-ME where learning<br />
          meets excellence through our<br />
          comprehensive academic and<br />
          Islamic education resources
        </p>
      </div>

      <Button
        onClick={() => navigate("/role-select")}
        className="w-full max-w-xs h-12 rounded-full bg-white text-[hsl(var(--navy))] hover:bg-white/90 font-semibold"
      >
        create here your profile
      </Button>

      <div className="absolute bottom-20 w-full h-20 bg-white/5 rounded-t-full"></div>
    </div>
  );
};

export default Welcome;
