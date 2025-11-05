import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Users, Award, TrendingUp, Calendar } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const TrainerDashboard = () => {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />
      
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Training Dashboard</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard icon={Users} title="Trainees" value="78" />
          <StatCard icon={Award} title="Programs" value="8" />
          <StatCard icon={TrendingUp} title="Completion" value="92%" />
          <StatCard icon={Calendar} title="Sessions" value="24" />
        </div>

        <div className="space-y-4">
          <div className="bg-secondary rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Training Programs</h3>
            <p className="text-sm text-muted-foreground">Training management features coming soon...</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TrainerDashboard;
