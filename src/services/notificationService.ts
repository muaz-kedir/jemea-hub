import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { NotificationType } from "@/contexts/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  sendEmail?: boolean;
  metadata?: {
    itemId?: string;
    action?: string;
    adminName?: string;
  };
}

interface NotificationResponse {
  success: boolean;
  notificationId?: string;
  emailsSent?: number;
  error?: string;
}

/**
 * Creates a notification directly in Firestore
 * This is the fallback method that always works
 */
const createNotificationDirect = async (
  params: CreateNotificationParams
): Promise<NotificationResponse> => {
  try {
    const notificationData = {
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link || null,
      metadata: params.metadata || {},
      readBy: [],
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, "notifications"),
      notificationData
    );
    console.log("[Notification] Created directly in Firestore:", docRef.id);

    return {
      success: true,
      notificationId: docRef.id,
      emailsSent: 0,
    };
  } catch (error) {
    console.error("[Notification] Direct creation failed:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * Creates a new notification in Firestore AND broadcasts via email to all users
 * Falls back to direct Firestore write if API is unavailable
 */
export const createNotification = async (
  params: CreateNotificationParams
): Promise<NotificationResponse> => {
  // Try API first (for email broadcasting)
  try {
    const response = await fetch(`${API_URL}/api/notify/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        sendEmail: params.sendEmail !== false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log(
          `[Notification] Created via API: ${data.notificationId}, Emails: ${data.emailsSent}`
        );
        return data;
      }
    }

    // API failed, fall back to direct Firestore
    console.warn("[Notification] API failed, using direct Firestore write");
    return createNotificationDirect(params);
  } catch (error) {
    // Network error, fall back to direct Firestore
    console.warn("[Notification] API unreachable, using direct Firestore write");
    return createNotificationDirect(params);
  }
};

/**
 * Helper functions for specific notification types
 */

// Library notifications
export const notifyNewBook = async (bookTitle: string, adminName?: string) => {
  return createNotification({
    title: "📚 New Book Added",
    message: `"${bookTitle}" has been added to the digital library.`,
    type: "library",
    link: "/digital-library",
    metadata: { action: "new_book", adminName },
  });
};

export const notifyBookUpdate = async (
  bookTitle: string,
  adminName?: string
) => {
  return createNotification({
    title: "📚 Book Updated",
    message: `"${bookTitle}" has been updated in the library.`,
    type: "library",
    link: "/digital-library",
    metadata: { action: "update_book", adminName },
  });
};

// Training notifications
export const notifyNewTraining = async (
  trainingTitle: string,
  adminName?: string
) => {
  return createNotification({
    title: "🎓 New Training Program",
    message: `"${trainingTitle}" is now available for registration.`,
    type: "training",
    link: "/landing#trainings",
    metadata: { action: "new_training", adminName },
  });
};

export const notifyTrainingUpdate = async (
  trainingTitle: string,
  adminName?: string
) => {
  return createNotification({
    title: "🎓 Training Updated",
    message: `"${trainingTitle}" has been updated. Check for new details.`,
    type: "training",
    link: "/landing#trainings",
    metadata: { action: "update_training", adminName },
  });
};

// Tutorial notifications
export const notifyNewTutorial = async (
  tutorialTitle: string,
  adminName?: string
) => {
  return createNotification({
    title: "📖 New Tutorial Session",
    message: `"${tutorialTitle}" is now available for enrollment.`,
    type: "tutorial",
    link: "/landing#tutorials",
    metadata: { action: "new_tutorial", adminName },
  });
};

export const notifyTutorialUpdate = async (
  tutorialTitle: string,
  adminName?: string
) => {
  return createNotification({
    title: "📖 Tutorial Updated",
    message: `"${tutorialTitle}" has been updated with new information.`,
    type: "tutorial",
    link: "/landing#tutorials",
    metadata: { action: "update_tutorial", adminName },
  });
};

// System notifications
export const notifySystemAnnouncement = async (
  title: string,
  message: string
) => {
  return createNotification({
    title: `🔔 ${title}`,
    message,
    type: "system",
    metadata: { action: "announcement" },
  });
};
