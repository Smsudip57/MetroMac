// Workbox precaching manifest - injected by next-pwa
const PRECACHE_MANIFEST = self.__WB_MANIFEST || [];

// Listen for push events
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);

  if (!event.data) {
    console.log('[SW] No push data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Push notification data:', data);

    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/header-logo.png',
      badge: data.badge || '/favicon.ico',
      data: data.data || {},
      tag: data.data?.taskId || 'notification',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Open',
        },
        {
          action: 'close',
          title: 'Close',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'MetroMac', options)
    );
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
    
    // Fallback: show notification with raw data
    event.waitUntil(
      self.registration.showNotification('MetroMac Notification', {
        body: event.data.text ? event.data.text() : 'New notification',
        icon: '/header-logo.png',
      })
    );
  }
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);
  event.notification.close();

  const taskId = event.notification.data?.taskId;
  const url = taskId ? `/dashboard/tasks/view?id=${taskId}` : '/dashboard';

  event.waitUntil(
    clients
      .matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url === url && 'focus' in client) {
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
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification);
});
