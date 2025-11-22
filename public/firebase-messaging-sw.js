importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDJD-k8qakS0a8iGjBG71dQMBpoA3XjJNA",
  authDomain: "humsj-academic-sector.firebaseapp.com",
  projectId: "humsj-academic-sector",
  storageBucket: "humsj-academic-sector.firebasestorage.app",
  messagingSenderId: "103611783382",
  appId: "1:103611783382:web:ea102209ae16f724125177",
  measurementId: "G-XY2D5219GF"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, image } = payload.notification || {};

  const notificationTitle = title || "New Notification";
  const notificationOptions = {
    body: body || "You have a new update.",
    icon: image || "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.link || "/notifications";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
