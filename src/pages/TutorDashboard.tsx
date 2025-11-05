import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Users, BookOpen, Calendar, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const TutorDashboard = () => {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />
      
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Tutor Dashboard</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard icon={Users} title="My Students" value="45" />
          <StatCard icon={BookOpen} title="Active Courses" value="6" />
          <StatCard icon={Calendar} title="Sessions" value="12" />
          <StatCard icon={CheckCircle} title="Completed" value="89%" />
        </div>

        <div className="space-y-4">
          <div className="bg-secondary rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Upcoming Sessions</h3>
            <p className="text-sm text-muted-foreground">Tutorial management features coming soon...</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TutorDashboard;
