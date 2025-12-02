import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, BookOpen, Award, GraduationCap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, NotificationType } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
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


export const NotificationBell = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    loading,
    isBellOpen,
    toggleBell,
    closeBell 
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeBell();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeBell]);

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    await markAsRead(notification.id);
    closeBell();
    
    // Navigate to the related page
    if (notification.link) {
      navigate(notification.link);
    } else {
      // Default routing based on type
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
        default:
          navigate("/notifications");
      }
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-xl hover:bg-slate-800/50 transition-all duration-200"
        onClick={toggleBell}
      >
        <Bell className={cn(
          "w-5 h-5 transition-all duration-200",
          isBellOpen && "text-primary"
        )} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-lg shadow-red-500/30">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isBellOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary h-7 px-2"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <ScrollArea className="max-h-[360px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-slate-500 mt-1">Updates will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/30">
                  {recentNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-slate-800/50 transition-all duration-200 group",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex gap-3">
                        {/* Type Icon */}
                        <div className={cn(
                          "flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg",
                          getTypeGradient(notification.type)
                        )}>
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              !notification.read && "text-white"
                            )}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] px-1.5 py-0 h-4 capitalize", getTypeColor(notification.type))}
                            >
                              {notification.type}
                            </Badge>
                            <span className="text-[10px] text-slate-500">
                              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-700/50 bg-slate-800/30">
                <Button
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground hover:text-primary h-8"
                  onClick={() => {
                    closeBell();
                    navigate("/notifications");
                  }}
                >
                  View all notifications
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
