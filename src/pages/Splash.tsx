import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HumsjLogo } from "@/components/HumsjLogo";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/landing");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen navy-bg flex flex-col items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="w-40 h-40 bg-white rounded-3xl flex items-center justify-center shadow-lg p-6">
          <HumsjLogo size={140} />
        </div>
        <div className="text-center">
          <h1 className="text-white text-3xl font-bold tracking-wider mb-2">HUMSJ</h1>
          <p className="text-white/80 text-sm">Haramaya University Muslim Students Jema'a</p>
        </div>
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
