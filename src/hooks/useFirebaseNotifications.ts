import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  getFcmToken,
  listenForForegroundMessages,
  notificationsSupported,
  requestPermissionAndToken,
} from "@/lib/firebaseMessaging";
import type { MessagePayload } from "firebase/messaging";

type NotificationState = "idle" | "checking" | "requesting" | "active" | "error";

type NotificationMessage = {
  id: string;
  title: string;
  body?: string;
  receivedAt: Date;
  raw: MessagePayload;
};

const MAX_MESSAGE_HISTORY = 20;

function mapPayloadToMessage(payload: MessagePayload): NotificationMessage {
  const title = payload.notification?.title ?? "New Notification";
  const body = payload.notification?.body;
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title,
    body,
    receivedAt: new Date(),
    raw: payload,
  };
}

export function useFirebaseNotifications() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [state, setState] = useState<NotificationState>("idle");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  const listenersRegistered = useRef(false);

  const registerForegroundListener = useCallback(async () => {
    if (listenersRegistered.current) {
      return;
    }

    const unsubscribe = await listenForForegroundMessages((payload) => {
      const message = mapPayloadToMessage(payload);
      setMessages((prev) => [message, ...prev].slice(0, MAX_MESSAGE_HISTORY));

      toast({
        title: message.title,
        description: message.body,
      });
    });

    if (typeof unsubscribe === "function") {
      listenersRegistered.current = true;
    }
  }, []);

  const requestToken = useCallback(async () => {
    if (!navigator.onLine) {
      setState("error");
      setError("You are offline. Connect to the internet to enable notifications.");
      return null;
    }

    setState("requesting");
    setError(null);

    try {
      const fetchedToken = await requestPermissionAndToken();
      setToken(fetchedToken);
      setState("active");
      toast({
        title: "Notifications enabled",
        description: "You will receive updates as soon as they are posted.",
      });
      return fetchedToken;
    } catch (err) {
      console.error("Failed to obtain notification token", err);
      const message = err instanceof Error ? err.message : "Failed to enable notifications.";
      setError(message);
      setState("error");
      return null;
    }
  }, []);

  const refreshTokenIfNeeded = useCallback(async () => {
    if (!navigator.onLine) {
      return;
    }

    try {
      setState((prev) => (prev === "active" ? prev : "checking"));
      const fetchedToken = await getFcmToken();
      setToken(fetchedToken);
      setState("active");
    } catch (err) {
      // If we cannot refresh the token, attempt to request permission again.
      await requestToken();
    }
  }, [requestToken]);

  const retry = useCallback(async () => {
    if (supported === false) {
      return;
    }
    await requestToken();
  }, [requestToken, supported]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const isSupported = await notificationsSupported();
      if (!mounted) return;

      setSupported(isSupported);

      if (!isSupported) {
        setState("error");
        setError("Browser does not support push notifications.");
        return;
      }

      await registerForegroundListener();

      if (Notification.permission === "granted") {
        await refreshTokenIfNeeded();
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshTokenIfNeeded, registerForegroundListener]);

  useEffect(() => {
    const handleOnline = async () => {
      toast({
        title: "Back online",
        description: "Reconnecting notifications...",
      });
      if (Notification.permission === "granted") {
        await refreshTokenIfNeeded();
      } else {
        await requestToken();
      }
    };

    const handleOffline = () => {
      toast({
        title: "Offline",
        description: "Notifications will resume once you are connected.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshTokenIfNeeded, requestToken]);

  const status = useMemo(() => {
    if (supported === false) {
      return "Not supported";
    }
    switch (state) {
      case "idle":
        return "Pending setup";
      case "checking":
        return "Checking token";
      case "requesting":
        return "Requesting permission";
      case "active":
        return "Active";
      case "error":
        return error ?? "Error";
      default:
        return "Unknown";
    }
  }, [error, state, supported]);

  return {
    supported,
    status,
    state,
    token,
    error,
    messages,
    retry,
  };
}
