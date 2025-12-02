import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, BookOpen, Award, GraduationCap, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications, NotificationType, Notification } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case "library":
      return <BookOpen className="w-5 h-5" />;
    case "training":
      return <Award className="w-5 h-5" />;
    case "tutorial":
      return <GraduationCap className="w-5 h-5" />;
    default:
      return <Settings className="w-5 h-5" />;
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

const getTypeBorderColor = (type: NotificationType) => {
  switch (type) {
    case "library":
      return "border-l-blue-500";
    case "training":
      return "border-l-purple-500";
    case "tutorial":
      return "border-l-green-500";
    default:
      return "border-l-slate-500";
  }
};

export const NotificationToast = () => {
  const navigate = useNavigate();
  const { latestNotification, clearLatest, markAsRead } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (latestNotification) {
      setIsVisible(true);
      setIsExiting(false);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [latestNotification]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      clearLatest();
    }, 300);
  };

  const handleClick = async () => {
    if (!latestNotification) return;
    
    await markAsRead(latestNotification.id);
    handleDismiss();
    
    // Navigate to the related page
    if (latestNotification.link) {
      navigate(latestNotification.link);
    } else {
      switch (latestNotification.type) {
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

  if (!isVisible || !latestNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto max-w-sm w-full",
          "transform transition-all duration-300 ease-out",
          isExiting
            ? "translate-x-full opacity-0"
            : "translate-x-0 opacity-100 animate-in slide-in-from-right-full"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border-l-4 shadow-2xl shadow-black/30",
            "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
            "border border-slate-700/50",
            getTypeBorderColor(latestNotification.type)
          )}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-slate-700/50 overflow-hidden">
            <div 
              className={cn(
                "h-full bg-gradient-to-r animate-shrink-width",
                getTypeGradient(latestNotification.type)
              )}
              style={{ animationDuration: "5s" }}
            />
          </div>

          <div className="p-4">
            <div className="flex gap-3">
              {/* Icon */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg",
                getTypeGradient(latestNotification.type)
              )}>
                {getTypeIcon(latestNotification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                    latestNotification.type === "library" && "bg-blue-500/20 text-blue-400",
                    latestNotification.type === "training" && "bg-purple-500/20 text-purple-400",
                    latestNotification.type === "tutorial" && "bg-green-500/20 text-green-400",
                    latestNotification.type === "system" && "bg-slate-500/20 text-slate-400"
                  )}>
                    {latestNotification.type}
                  </span>
                  <span className="text-[10px] text-slate-500">Just now</span>
                </div>
                <h4 className="text-sm font-semibold text-white truncate">
                  {latestNotification.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {latestNotification.message}
                </p>
                
                {/* View Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 group"
                  onClick={handleClick}
                >
                  View details
                  <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-slate-700/50"
                onClick={handleDismiss}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
