import { Bell, Menu, User, BookOpen, Video, Award, Calendar, FileText, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const menuItems = [
    { icon: BookOpen, label: "Library", color: "bg-blue-500" },
    { icon: Video, label: "Tutorials", color: "bg-purple-500" },
    { icon: Award, label: "Training", color: "bg-green-500" },
    { icon: Calendar, label: "Schedule", color: "bg-orange-500" },
    { icon: FileText, label: "Resources", color: "bg-pink-500" },
    { icon: Users, label: "Community", color: "bg-cyan-500" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Navy Header */}
      <div className="navy-bg rounded-b-[60px] pb-8">
        <div className="container max-w-md mx-auto px-6 pt-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">
                  Assalamu Alaikum
                </p>
                <h2 className="text-white font-semibold">
                  {userProfile?.firstName || userProfile?.email?.split('@')[0] || 'Student'}
                </h2>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-2xl">
                <Bell className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10 rounded-2xl"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Bio Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 rounded-3xl">
            <h3 className="text-white font-semibold mb-2">Bio</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Dedicated student pursuing excellence in Islamic and academic studies. Passionate about learning and sharing knowledge with the community.
            </p>
          </Card>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container max-w-md mx-auto px-6 -mt-6">
        <div className="bg-background rounded-3xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold mb-4">Dashboard</h3>
          <div className="grid grid-cols-3 gap-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-secondary transition-smooth"
              >
                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5 rounded-3xl">
            <p className="text-sm text-muted-foreground mb-1">Courses</p>
            <p className="text-3xl font-bold">42</p>
          </Card>
          <Card className="p-5 rounded-3xl">
            <p className="text-sm text-muted-foreground mb-1">Progress</p>
            <p className="text-3xl font-bold">85%</p>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="container max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-around">
            <Button variant="ghost" size="icon" className="rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-2xl">
              <Video className="w-6 h-6" />
            </Button>
            <Button size="icon" className="w-14 h-14 rounded-full navy-bg -mt-8 shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-2xl">
              <Calendar className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-2xl">
              <User className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
