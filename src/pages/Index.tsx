import { Header } from "@/components/Header";
import { GlassCard } from "@/components/GlassCard";
import { StatCard } from "@/components/StatCard";
import { QuickAction } from "@/components/QuickAction";
import { BottomNav } from "@/components/BottomNav";
import { BookOpen, Users, Calendar, TrendingUp, Upload, BookMarked, Video, Award } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen gradient-hero pb-24">
      <div className="container max-w-md mx-auto px-4 py-6">
        <Header />

        {/* Balance Card */}
        <GlassCard className="mb-6 animate-slide-up">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">Academic Progress</p>
            <h1 className="text-5xl font-bold mb-4">85%</h1>
            <div className="flex justify-around text-sm">
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="font-semibold">42 Courses</p>
              </div>
              <div className="w-px bg-glass-border" />
              <div>
                <p className="text-muted-foreground">In Progress</p>
                <p className="font-semibold">8 Courses</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <QuickAction icon={Upload} label="Upload" variant="primary" />
          <QuickAction icon={BookMarked} label="Library" variant="secondary" />
          <QuickAction icon={Video} label="Tutorial" variant="accent" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            title="Total Resources"
            value="1,247"
            icon={BookOpen}
            trend="+12%"
            color="primary"
          />
          <StatCard
            title="Active Tutorials"
            value="24"
            icon={Users}
            trend="+5%"
            color="secondary"
          />
          <StatCard
            title="Trainings"
            value="16"
            icon={Calendar}
            color="accent"
          />
          <StatCard
            title="Certificates"
            value="8"
            icon={Award}
            trend="+2"
            color="primary"
          />
        </div>

        {/* Recent Activity */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <button className="text-sm text-accent font-semibold">See More</button>
          </div>
          
          <div className="space-y-4">
            {[
              {
                title: "Islamic Studies - Chapter 5",
                subtitle: "Jun 28 • 00:01 AM",
                value: "Completed",
                color: "text-accent",
              },
              {
                title: "Mathematics Tutorial",
                subtitle: "Jun 28 • 00:01 AM",
                value: "In Progress",
                color: "text-secondary",
              },
              {
                title: "English Language Course",
                subtitle: "Jun 27 • 11:45 PM",
                value: "Completed",
                color: "text-accent",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <span className={`text-sm font-semibold ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
