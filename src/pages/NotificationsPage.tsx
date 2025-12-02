import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Bell, 
  BookOpen, 
  Award, 
  GraduationCap, 
  Settings, 
  Check, 
  CheckCheck,
  Filter,
  ArrowLeft,
  Search,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, NotificationType } from "@/contexts/NotificationContext";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case "library":
      return <BookOpen className="w-4 h-4" />;
    case "training":
      return <Award className="w-4 h-4" />;
    case "tutorial":
      return <GraduationCap className="w-4 h-4" />;
    default:
      return <Settings className="w-4 h-4" />;
  }
};

const getTypeGradient = (type: NotificationType) => {
  switch (type) {
    case "library":
      return "from-blue-500 to-indigo-600";
    case "training":
      return "from-purple-500 to-violet-600";
    case "tutorial":
      return "from-green-500 to-emerald-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

const getTypeColor = (type: NotificationType) => {
  switch (type) {
    case "library":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "training":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "tutorial":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};


const NotificationsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Handle URL parameters for highlighting specific notifications
  useEffect(() => {
    const notificationId = searchParams.get('id');
    const filterType = searchParams.get('type');
    
    if (notificationId) {
      setHighlightedId(notificationId);
      // Auto-scroll to the notification after a short delay
      setTimeout(() => {
        const element = document.getElementById(`notification-${notificationId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
    
    if (filterType && ['library', 'training', 'tutorial', 'system'].includes(filterType)) {
      setActiveTab(filterType as NotificationType);
    }
  }, [searchParams]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | NotificationType>("all");

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || notification.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    await markAsRead(notification.id);
    
    // Navigate to the related page
    if (notification.link) {
      navigate(notification.link);
    } else {
      switch (notification.type) {
        case "library":
          navigate("/digital-library");
          break;
        case "training":
          navigate("/landing#trainings");
          break;
        case "tutorial":
          navigate("/landing#tutorials");
          break;
      }
    }
  };

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = format(notification.createdAt, "yyyy-MM-dd");
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
    
    let label = format(notification.createdAt, "MMMM d, yyyy");
    if (date === today) label = "Today";
    else if (date === yesterday) label = "Yesterday";
    
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    library: notifications.filter(n => n.type === "library").length,
    training: notifications.filter(n => n.type === "training").length,
    tutorial: notifications.filter(n => n.type === "tutorial").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Stay updated with the latest from Library, Training & Tutorials
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="p-3 border-0 shadow-md bg-gradient-to-br from-slate-900/80 to-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.total}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 border-0 shadow-md bg-gradient-to-br from-slate-900/80 to-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.library}</p>
                <p className="text-[10px] text-muted-foreground">Library</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 border-0 shadow-md bg-gradient-to-br from-slate-900/80 to-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.training}</p>
                <p className="text-[10px] text-muted-foreground">Training</p>
              </div>
            </div>
          </Card>
          <Card className="p-3 border-0 shadow-md bg-gradient-to-br from-slate-900/80 to-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.tutorial}</p>
                <p className="text-[10px] text-muted-foreground">Tutorial</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700/50"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
          <TabsList className="bg-slate-900/50 border border-slate-700/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">
              All
              {stats.total > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                  {stats.total}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-blue-500/20">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Library
            </TabsTrigger>
            <TabsTrigger value="training" className="data-[state=active]:bg-purple-500/20">
              <Award className="w-3.5 h-3.5 mr-1" />
              Training
            </TabsTrigger>
            <TabsTrigger value="tutorial" className="data-[state=active]:bg-green-500/20">
              <GraduationCap className="w-3.5 h-3.5 mr-1" />
              Tutorial
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12 border-0 shadow-md bg-gradient-to-br from-slate-900/80 to-slate-800/50 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? "No notifications match your search" 
                : "You're all caught up! New updates will appear here."}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, items]) => (
              <div key={date}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  {date}
                </h3>
                <div className="space-y-2">
                  {items.map((notification) => (
                    <Card
                      key={notification.id}
                      id={`notification-${notification.id}`}
                      className={cn(
                        "p-4 border-0 shadow-md cursor-pointer transition-all duration-200",
                        "bg-gradient-to-br from-slate-900/80 to-slate-800/50",
                        "hover:from-slate-800/80 hover:to-slate-700/50 hover:scale-[1.01]",
                        !notification.read && "ring-1 ring-primary/30 bg-primary/5",
                        highlightedId === notification.id && "ring-2 ring-primary animate-pulse"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-4">
                        {/* Type Icon */}
                        <div className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                          getTypeGradient(notification.type)
                        )}>
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn(
                                  "font-semibold truncate",
                                  !notification.read && "text-white"
                                )}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                              </span>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Mark read
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] px-1.5 py-0 h-5 capitalize", getTypeColor(notification.type))}
                            >
                              {notification.type}
                            </Badge>
                            {notification.metadata?.action && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                {notification.metadata.action}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
