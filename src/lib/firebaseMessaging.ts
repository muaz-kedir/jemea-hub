import { app } from "@/lib/firebase";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  Messaging,
  MessagePayload,
} from "firebase/messaging";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BNTBtfTD-W75MBXAZPbhaavVOv-52pTE2Mdwr9hUQJwi_qyshM-96YTfm2Cauqz3ldMfmc2WN7W9UhAmrmSnD8A";
const SERVICE_WORKER_PATH = "/firebase-messaging-sw.js";

let messagingPromise: Promise<Messaging | null> | null = null;
let serviceWorkerPromise: Promise<ServiceWorkerRegistration | null> | null = null;

async function ensureServiceWorker() {
  if (serviceWorkerPromise) {
    return serviceWorkerPromise;
  }

  serviceWorkerPromise = (async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);

      // Wait for the service worker to be active before returning
      await navigator.serviceWorker.ready;

      return registration;
    } catch (error) {
      console.error("Failed to register Firebase messaging service worker", error);
      return null;
    }
  })();

  return serviceWorkerPromise;
}

async function ensureMessaging() {
  if (messagingPromise) {
    return messagingPromise;
  }

  messagingPromise = (async () => {
    if (typeof window === "undefined") {
      return null;
    }

    const supported = await isSupported().catch(() => false);

    if (!supported) {
      return null;
    }

    await ensureServiceWorker();

    return getMessaging(app);
  })();

  return messagingPromise;
}

export async function notificationsSupported() {
  if (typeof window === "undefined") {
    return false;
  }

  if (!("Notification" in window)) {
    return false;
  }

  const messagingSupported = await isSupported().catch(() => false);
  return messagingSupported;
}

export async function requestPermissionAndToken() {
  if (typeof window === "undefined") {
    throw new Error("Notifications are only available in the browser");
  }

  if (!("Notification" in window)) {
    throw new Error("Notifications are not supported on this device");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission not granted");
  }

  return getFcmToken();
}

export async function getFcmToken() {
  const messaging = await ensureMessaging();

  if (!messaging) {
    throw new Error("Firebase Messaging is not supported in this browser");
  }

  const registration = await ensureServiceWorker();

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration ?? undefined,
  }).catch((error) => {
    console.error("Error retrieving FCM token", error);
    throw error;
  });

  if (!token) {
    throw new Error("No FCM token returned");
  }

  return token;
}

export async function listenForForegroundMessages(
  callback: (payload: MessagePayload) => void,
) {
  const messaging = await ensureMessaging();

  if (!messaging) {
    console.warn("Firebase Messaging is not supported; foreground notifications disabled.");
    return () => {};
  }

  const unsubscribe = onMessage(messaging, callback);

  return unsubscribe;
}
