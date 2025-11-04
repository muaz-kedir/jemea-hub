import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen navy-bg flex flex-col items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-lg">
          <GraduationCap className="w-16 h-16 text-[hsl(var(--navy))]" />
        </div>
        <h1 className="text-white text-3xl font-bold tracking-wider">TEACH-ME</h1>
      </div>
      <div className="absolute bottom-20 flex gap-2">
        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
        <div className="w-8 h-2 bg-white rounded-full"></div>
        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
      </div>
    </div>
  );
};

export default Splash;
