import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { ResourceAdminPanel } from "@/components/ResourceAdminPanel";

const ResourceAdminDashboard = () => {
  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-background via-background to-primary/10">
      <Header />

      <div className="p-6 space-y-6">
        <ResourceAdminPanel />
      </div>

      <BottomNav />
    </div>
  );
};

export default ResourceAdminDashboard;
