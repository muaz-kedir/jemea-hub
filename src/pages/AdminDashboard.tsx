import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { UserManagement } from "@/components/UserManagement";
import { Link } from "react-router-dom";
import { 
  Library, 
  GraduationCap, 
  Award, 
  Users, 
  Shield, 
  TrendingUp, 
  Activity,
  BookOpen,
  UserCheck,
  Settings,
  BarChart3,
  Clock,
  Bell,
  ArrowRight,
  Calendar,
  FileText
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const AdminDashboard = () => {
  const { userProfile, getAllUsers } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    librarians: 0,
    tutors: 0,
    trainers: 0,
    students: 0,
  });

  const [sectorStats, setSectorStats] = useState({
    library: { total: 0, recent: null as any },
    tutorials: { total: 0, next: null as any },
    trainings: { total: 0, upcoming: null as any },
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const users = await getAllUsers();
        setStats({
          totalUsers: users.length,
          librarians: users.filter(u => u.role === "librarian").length,
          tutors: users.filter(u => u.role === "tutor").length,
          trainers: users.filter(u => u.role === "trainer").length,
          students: users.filter(u => u.role === "student").length,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };
    loadStats();
  }, [getAllUsers]);

  useEffect(() => {
    const loadSectorStats = async () => {
      try {
        // Fetch library resources
        const librarySnapshot = await getDocs(collection(db, "library_resources"));
        const libraryDocs = librarySnapshot.docs;
        
        // Fetch tutorial sessions
        const tutorialsSnapshot = await getDocs(collection(db, "tutorial_sessions"));
        const tutorialDocs = tutorialsSnapshot.docs;
        
        // Fetch trainings
        const trainingsSnapshot = await getDocs(collection(db, "trainings"));
        const trainingDocs = trainingsSnapshot.docs;

        setSectorStats({
          library: {
            total: libraryDocs.length,
            recent: libraryDocs.length > 0 ? libraryDocs[0].data() : null,
          },
          tutorials: {
            total: tutorialDocs.length,
            next: tutorialDocs.length > 0 ? tutorialDocs[0].data() : null,
          },
          trainings: {
            total: trainingDocs.length,
            upcoming: trainingDocs.length > 0 ? trainingDocs[0].data() : null,
          },
        });
      } catch (error) {
        console.error("Error loading sector stats:", error);
      }
    };
    loadSectorStats();
  }, []);

  const sectorDashboards = [
    { 
      title: "Library Dashboard", 
      icon: Library, 
      path: "/admin/library", 
      color: "bg-blue-500",
      description: "Manage books and resources",
      stats: {
        total: sectorStats.library.total,
        label: "Total Resources",
        recent: sectorStats.library.recent?.title || "No recent uploads"
      }
    },
    { 
      title: "Tutorial Dashboard", 
      icon: GraduationCap, 
      path: "/admin/tutorial", 
      color: "bg-green-500",
      description: "Oversee tutoring sessions",
      stats: {
        total: sectorStats.tutorials.total,
        label: "Total Sessions",
        recent: sectorStats.tutorials.next?.title || "No upcoming sessions"
      }
    },
    { 
      title: "Training Dashboard", 
      icon: Award, 
      path: "/admin/training", 
      color: "bg-purple-500",
      description: "Monitor training programs",
      stats: {
        total: sectorStats.trainings.total,
        label: "Active Programs",
        recent: sectorStats.trainings.upcoming?.title || "No upcoming trainings"
      }
    },
  ];

  const quickStats = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      trend: "+12%"
    },
    {
      title: "Active Staff",
      value: stats.librarians + stats.tutors + stats.trainers,
      icon: UserCheck,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      trend: "+8%"
    },
    {
      title: "Students",
      value: stats.students,
      icon: BookOpen,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      trend: "+15%"
    },
    {
      title: "System Health",
      value: "98%",
      icon: Activity,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      trend: "+2%"
    },
  ];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-background via-background to-secondary/20">
      <Header />
      
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
              <p className="text-white/90 text-sm">
                Welcome back, {userProfile?.firstName || "Admin"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm text-white/80">
            <Clock className="w-4 h-4" />
            <span>Last login: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="p-4 border-0 shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {stat.trend}
                      </div>
                    </div>
                    <p className="text-2xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="p-6 border-0 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/profile"
                  className="p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-all text-center"
                >
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">My Profile</p>
                </Link>
                <button
                  onClick={() => document.querySelector('[value="users"]')?.click()}
                  className="p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-all text-center"
                >
                  <UserCheck className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Manage Users</p>
                </button>
                <button className="p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-all text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Analytics</p>
                </button>
                <button className="p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-all text-center">
                  <Settings className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Settings</p>
                </button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 border-0 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">System Status</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">All systems operational</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Just now</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Database synced</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Backup completed</span>
                  </div>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Dashboards Tab */}
          <TabsContent value="dashboards" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Sector Dashboards</h2>
              <p className="text-sm text-muted-foreground">Access and manage all sub-sector dashboards from one place</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {sectorDashboards.map((dashboard) => {
                const Icon = dashboard.icon;
                return (
                  <Card key={dashboard.path} className="p-6 border-0 shadow-md hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 ${dashboard.color} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1">{dashboard.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{dashboard.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <p className="text-2xl font-bold text-primary">{dashboard.stats.total}</p>
                            <p className="text-xs text-muted-foreground">{dashboard.stats.label}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Recent Activity</p>
                      <p className="text-sm font-medium truncate">{dashboard.stats.recent}</p>
                    </div>
                    <Link to={dashboard.path}>
                      <Button className="w-full" size="lg">
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminDashboard;
