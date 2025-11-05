import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Book, Users, TrendingUp, FileText } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const LibraryDashboard = () => {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />
      
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Library Dashboard</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard icon={Book} title="Total Books" value="2,458" />
          <StatCard icon={Users} title="Active Borrowers" value="342" />
          <StatCard icon={TrendingUp} title="Books Issued" value="156" />
          <StatCard icon={FileText} title="Pending Returns" value="23" />
        </div>

        <div className="space-y-4">
          <div className="bg-secondary rounded-2xl p-4">
            <h3 className="font-semibold mb-2">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Library management features coming soon...</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default LibraryDashboard;
