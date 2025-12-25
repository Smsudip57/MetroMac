// Workbox precaching manifest - injected by next-pwa
// @ts-expect-error - __WB_MANIFEST is injected by Workbox at runtime
const PRECACHE_MANIFEST = self.__WB_MANIFEST || [];

// Get iOS version from user agent
function getIOSVersion() {
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

const iosVersion = getIOSVersion();
const supportsIOSPush = iosVersion !== null && iosVersion >= 16;

// Listen for push events (supported on iOS 16+ and Android)
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received:", event);
  console.log(
    "[SW] iOS Version:",
    iosVersion,
    "Supports Push:",
    supportsIOSPush
  );

  if (!event.data) {
    console.log("[SW] No push data");
    return;
  }

  try {
    const data = event.data.json();
    console.log("[SW] Push notification data:", data);

    const options = {
      body: data.body || "New notification",
      icon: data.icon || "/header-logo.png",
      badge: data.badge || "/favicon.ico",
      data: data.data || {},
      tag: data.data?.taskId || "notification",
      requireInteraction: false,
      actions: [
        {
          action: "open",
          title: "Open",
        },
        {
          action: "close",
          title: "Close",
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || "MetroMac", options)
    );
  } catch (error) {
    console.error("[SW] Error parsing push data:", error);

    // Fallback: show notification with raw data
    event.waitUntil(
      self.registration.showNotification("MetroMac Notification", {
        body: event.data.text ? event.data.text() : "New notification",
        icon: "/header-logo.png",
      })
    );
  }
});

// Listen for notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification);
  event.notification.close();

  const taskId = event.notification.data?.taskId;
  const url = taskId ? `/dashboard/tasks/view?id=${taskId}` : "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if app is already open
      for (let client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      // If not open, open it
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Listen for notification close
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification);
});
