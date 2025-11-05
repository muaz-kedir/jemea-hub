import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Link } from "react-router-dom";
import { Library, GraduationCap, Award, Users } from "lucide-react";

const AdminDashboard = () => {
  const dashboards = [
    { title: "Library", icon: Library, path: "/library-dashboard", color: "bg-blue-500" },
    { title: "Tutoring", icon: GraduationCap, path: "/tutor-dashboard", color: "bg-green-500" },
    { title: "Training", icon: Award, path: "/trainer-dashboard", color: "bg-purple-500" },
    { title: "Students", icon: Users, path: "/dashboard", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Header />
      
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Super Admin</h1>
        <p className="text-muted-foreground mb-6">Access all dashboards</p>
        
        <div className="grid grid-cols-2 gap-4">
          {dashboards.map((dashboard) => {
            const Icon = dashboard.icon;
            return (
              <Link
                key={dashboard.path}
                to={dashboard.path}
                className="bg-secondary rounded-2xl p-6 hover:bg-secondary/80 transition-all"
              >
                <div className={`w-12 h-12 ${dashboard.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold">{dashboard.title}</h3>
                <p className="text-sm text-muted-foreground">View dashboard</p>
              </Link>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminDashboard;
