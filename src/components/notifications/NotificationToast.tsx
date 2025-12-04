import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  BookOpen,
  Award,
  GraduationCap,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useNotifications,
  NotificationType,
} from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";
import { playNotificationSound } from "@/utils/notificationSound";

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
  const { latestNotification, clearLatest, openBell } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      clearLatest();
    }, 300);
  }, [clearLatest]);

  useEffect(() => {
    if (latestNotification) {
      console.log("[Toast] New notification received:", latestNotification.title);
      setIsVisible(true);
      setIsExiting(false);

      // Play notification sound
      try {
        playNotificationSound();
      } catch (e) {
        console.warn("[Toast] Could not play sound:", e);
      }

      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [latestNotification, handleDismiss]);

  const handleClick = () => {
    if (!latestNotification) return;
    handleDismiss();
    openBell();
  };

  const handleViewAll = () => {
    handleDismiss();
    navigate("/notifications");
  };

  if (!isVisible || !latestNotification) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none flex items-start justify-center sm:justify-end p-4 sm:p-6"
      style={{ zIndex: 99999 }}
    >
      <div
        className={cn(
          "pointer-events-auto w-full max-w-sm mt-0 sm:mt-0 sm:mr-0",
          "transform transition-all duration-300 ease-out",
          isExiting
            ? "translate-y-[-100%] sm:translate-y-0 sm:translate-x-full opacity-0"
            : "translate-y-0 translate-x-0 opacity-100 animate-in slide-in-from-top sm:slide-in-from-right"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border-l-4 shadow-2xl",
            "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
            "border border-slate-700/50",
            getTypeBorderColor(latestNotification.type)
          )}
          style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700/50 overflow-hidden">
            <div
              className={cn(
                "h-full bg-gradient-to-r",
                getTypeGradient(latestNotification.type)
              )}
              style={{
                animation: "shrink-width 6s linear forwards",
              }}
            />
          </div>

          <div className="p-4 pt-5">
            <div className="flex gap-3">
              {/* Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  getTypeGradient(latestNotification.type)
                )}
              >
                {getTypeIcon(latestNotification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      latestNotification.type === "library" &&
                        "bg-blue-500/20 text-blue-400",
                      latestNotification.type === "training" &&
                        "bg-purple-500/20 text-purple-400",
                      latestNotification.type === "tutorial" &&
                        "bg-green-500/20 text-green-400",
                      latestNotification.type === "system" &&
                        "bg-slate-500/20 text-slate-400"
                    )}
                  >
                    {latestNotification.type}
                  </span>
                  <span className="text-[10px] text-slate-500">Just now</span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  {latestNotification.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {latestNotification.message}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 px-3 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                    onClick={handleClick}
                  >
                    Open
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-slate-400 hover:text-white"
                    onClick={handleViewAll}
                  >
                    View all
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
