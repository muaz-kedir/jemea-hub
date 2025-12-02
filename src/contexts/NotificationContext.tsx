import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  where
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

export type NotificationType = "library" | "training" | "tutorial" | "system";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  link?: string;
  metadata?: {
    itemId?: string;
    action?: string;
    adminName?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  latestNotification: Notification | null;
  clearLatest: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const [previousIds, setPreviousIds] = useState<Set<string>>(new Set());


  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query notifications - both global and user-specific
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications: Notification[] = [];
      const currentIds = new Set<string>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        currentIds.add(doc.id);
        
        newNotifications.push({
          id: doc.id,
          title: data.title || "New Update",
          message: data.message || "",
          type: data.type || "system",
          read: data.readBy?.includes(user.uid) || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          link: data.link,
          metadata: data.metadata,
        });
      });

      // Check for new notifications (real-time updates)
      if (previousIds.size > 0) {
        const newIds = [...currentIds].filter(id => !previousIds.has(id));
        if (newIds.length > 0) {
          const newest = newNotifications.find(n => n.id === newIds[0]);
          if (newest) {
            setLatestNotification(newest);
          }
        }
      }

      setPreviousIds(currentIds);
      setNotifications(newNotifications);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const notificationRef = doc(db, "notifications", id);
      const notification = notifications.find(n => n.id === id);
      
      if (notification && !notification.read) {
        // Add user to readBy array
        await updateDoc(notificationRef, {
          readBy: [...(notification.metadata?.readBy || []), user.uid]
        });
        
        // Optimistic update
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }, [user, notifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    const unreadNotifications = notifications.filter(n => !n.read);
    
    try {
      await Promise.all(
        unreadNotifications.map(n => 
          updateDoc(doc(db, "notifications", n.id), {
            readBy: [...(n.metadata?.readBy || []), user.uid]
          })
        )
      );
      
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }, [user, notifications]);

  const clearLatest = useCallback(() => {
    setLatestNotification(null);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        latestNotification,
        clearLatest,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
