import { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Navy curved top section */}
      <div className="absolute top-0 left-0 right-0 h-64 navy-bg rounded-b-[60px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 mt-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-[hsl(var(--navy))]" />
          </div>
          <span className="text-white text-sm font-medium tracking-wider">TEACH-ME</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative pt-48 px-6">
        {children}
      </div>
    </div>
  );
};
