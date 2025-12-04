import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
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
    readBy?: string[];
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
  isBellOpen: boolean;
  openBell: () => void;
  closeBell: () => void;
  toggleBell: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestNotification, setLatestNotification] =
    useState<Notification | null>(null);
  const [isBellOpen, setIsBellOpen] = useState(false);

  // Use ref to track previous IDs to avoid stale closure issues
  const previousIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const openBell = useCallback(() => setIsBellOpen(true), []);
  const closeBell = useCallback(() => setIsBellOpen(false), []);
  const toggleBell = useCallback(() => setIsBellOpen((prev) => !prev), []);

  // Subscribe to real-time notifications
  useEffect(() => {
    console.log("[Notifications] Setting up listener...");
    setLoading(true);

    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("[Notifications] Received snapshot:", snapshot.size, "docs");
        
        const newNotifications: Notification[] = [];
        const currentIds = new Set<string>();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          currentIds.add(docSnap.id);

          const readBy = data.readBy || [];
          const isRead = user ? readBy.includes(user.uid) : false;

          newNotifications.push({
            id: docSnap.id,
            title: data.title || "New Update",
            message: data.message || "",
            type: data.type || "system",
            read: isRead,
            createdAt: data.createdAt?.toDate() || new Date(),
            link: data.link,
            metadata: {
              ...data.metadata,
              readBy,
            },
          });
        });

        // Check for NEW notifications (not on first load)
        if (!isFirstLoadRef.current && previousIdsRef.current.size > 0) {
          const newIds = [...currentIds].filter(
            (id) => !previousIdsRef.current.has(id)
          );
          
          console.log("[Notifications] New IDs detected:", newIds);
          
          if (newIds.length > 0) {
            const newest = newNotifications.find((n) => n.id === newIds[0]);
            if (newest) {
              console.log("[Notifications] Setting latest notification:", newest.title);
              setLatestNotification(newest);
            }
          }
        }

        isFirstLoadRef.current = false;
        previousIdsRef.current = currentIds;
        setNotifications(newNotifications);
        setLoading(false);
      },
      (error) => {
        console.error("[Notifications] Error:", error);
        setLoading(false);
      }
    );

    return () => {
      console.log("[Notifications] Cleaning up listener");
      unsubscribe();
    };
  }, [user?.uid]); // Only re-subscribe when user ID changes

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        const notificationRef = doc(db, "notifications", id);

        // Use arrayUnion to safely add user ID to readBy array
        await updateDoc(notificationRef, {
          readBy: arrayUnion(user.uid),
        });

        // Optimistic update
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const unreadNotifications = notifications.filter((n) => !n.read);

    try {
      await Promise.all(
        unreadNotifications.map((n) =>
          updateDoc(doc(db, "notifications", n.id), {
            readBy: arrayUnion(user.uid),
          })
        )
      );

      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        isBellOpen,
        openBell,
        closeBell,
        toggleBell,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
