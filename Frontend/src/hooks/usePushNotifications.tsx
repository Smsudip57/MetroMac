import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetPushConfigQuery,
  useSubscribeToPushMutation,
  useUnsubscribeFromPushMutation,
  useGetPushSubscriptionCountQuery,
} from "@/redux/api/push/pushApi";

/**
 * Hook to manage push notification subscriptions
 * Handles service worker registration and subscription management
 * Only subscribes after user is authenticated
 */
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth state from Redux
  const { user } = useSelector((state: any) => state.auth);
  const isAuthenticated = !!user;

  // RTK Query hooks
  const { data: configData, isLoading: isConfigLoading } =
    useGetPushConfigQuery(undefined, {
      skip: false,
    });
  const { data: subscriptionCountData, isLoading: isCountLoading } =
    useGetPushSubscriptionCountQuery(undefined, {
      skip: !isAuthenticated,
    });
  const [subscribeMutation] = useSubscribeToPushMutation();
  const [unsubscribeMutation] = useUnsubscribeFromPushMutation();

  // Register service worker
  const registerServiceWorker =
    async (): Promise<ServiceWorkerRegistration> => {
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
          setRegistration(reg);
          return reg;
        } catch (err) {
          console.error("Service Worker registration failed:", err);
          throw err;
        }
      }
      throw new Error("Service Worker not supported");
    };

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check browser support
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("Push notifications are not supported in this browser");
      }

      // Get VAPID public key from RTK Query
      if (!configData?.data?.publicKey) {
        throw new Error("Failed to fetch push config");
      }

      console.log("[Push] VAPID Public Key:", configData.data.publicKey);

      // Register service worker if not already registered
      let reg = registration;
      if (!reg) {
        console.log(
          "[Push] No registration found, registering service worker..."
        );
        reg = await registerServiceWorker();
      }

      console.log("[Push] Service Worker registered:", reg);

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(
        configData.data.publicKey
      ) as BufferSource;
      console.log("[Push] ApplicationServerKey:", applicationServerKey);

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log("[Push] Browser subscription successful:", subscription);

      // Send subscription to backend using RTK Query mutation
      await subscribeMutation(subscription.toJSON()).unwrap();

      console.log("[Push] Backend subscription saved");
      setIsSubscribed(true);
      return subscription;
    } catch (err: any) {
      console.error("Failed to subscribe to push notifications:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [registration, configData?.data?.publicKey, subscribeMutation]);

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      let reg = registration;
      if (!reg && "serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        reg = (regs[0] as ServiceWorkerRegistration) || null;
      }

      if (reg) {
        const subscription = await reg.pushManager.getSubscription();
        if (subscription) {
          // Notify backend to remove subscription using RTK Query mutation
          await unsubscribeMutation(subscription.endpoint).unwrap();

          // Unsubscribe from browser
          await subscription.unsubscribe();
          setIsSubscribed(false);
        }
      }
    } catch (err: any) {
      console.error("Failed to unsubscribe from push notifications:", err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check current subscription status
  const checkSubscriptionStatus = async (): Promise<void> => {
    try {
      let reg = registration;
      if (!reg && "serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        reg = (regs[0] as ServiceWorkerRegistration) || null;
        if (reg) {
          setRegistration(reg);
        }
      }

      if (reg) {
        const subscription = await reg.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (err) {
      console.error("Failed to check subscription status:", err);
    }
  };

  // Initialize on mount
  // Register Service Worker early (doesn't need auth)
  useEffect(() => {
    const initServiceWorker = async () => {
      try {
        // Check browser support
        const supported =
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window;
        setIsSupported(supported);

        if (supported) {
          // Register service worker silently (no auth needed)
          if ("serviceWorker" in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            if (regs.length > 0) {
              setRegistration(regs[0]);
            } else {
              await registerServiceWorker();
            }
          }
        }
      } catch (err) {
        console.error("Failed to initialize service worker:", err);
      }
    };

    initServiceWorker();
  }, []);

  // Subscribe after user logs in
  useEffect(() => {
    const subscribeAfterLogin = async () => {
      console.log("[Push] subscribeAfterLogin triggered", {
        isAuthenticated,
        permission: Notification.permission,
      });

      if (!isAuthenticated) {
        console.log("[Push] User not authenticated, skipping");
        return; // Don't subscribe if not logged in
      }

      // Wait for subscription count query to finish loading
      if (isCountLoading) {
        console.log(
          "[Push] Waiting for subscription count query to complete..."
        );
        return;
      }

      try {
        // Check browser support
        const supported =
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window;

        if (!supported) {
          console.log("[Push] Browser does not support push notifications");
          return;
        }

        // Request notification permission if not already granted
        if (Notification.permission === "default") {
          console.log("[Push] Requesting notification permission...");
          const permissionResult = await Notification.requestPermission();
          console.log("[Push] Permission result:", permissionResult);
        } else {
          console.log("[Push] Current permission:", Notification.permission);
        }

        // Get or register service worker
        let reg = registration;
        if (!reg && "serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          reg = (regs[0] as ServiceWorkerRegistration) || null;
          if (reg) setRegistration(reg);
        }

        if (!reg) {
          console.log("[Push] Registering service worker...");
          reg = await registerServiceWorker();
        }

        // Check if already subscribed in the browser
        const existingSubscription = await reg.pushManager.getSubscription();
        const backendSubscriptions =
          subscriptionCountData?.data?.subscriptions || [];
        const backendEndpoints = backendSubscriptions.map(
          (sub: any) => sub.endpoint
        );

        console.log(
          "[Push] Current browser endpoint:",
          existingSubscription?.endpoint
        );
        console.log("[Push] Backend endpoints:", backendEndpoints);

        // Check if current browser endpoint exists in backend subscriptions
        const currentEndpointExists = existingSubscription
          ? backendEndpoints.includes(existingSubscription.endpoint)
          : false;

        if (existingSubscription && currentEndpointExists) {
          console.log(
            "[Push] Browser subscription exists and is synced with backend, skipping"
          );
          setIsSubscribed(true);
          return;
        }

        // If browser has subscription but it's not in backend, remove it and resubscribe
        if (existingSubscription && !currentEndpointExists) {
          console.log(
            "[Push] Browser subscription not found in backend, removing and resubscribing..."
          );
          try {
            await existingSubscription.unsubscribe();
            console.log("[Push] Old browser subscription removed");
          } catch (err) {
            console.warn("[Push] Error removing old subscription:", err);
          }
        }

        // Auto-subscribe if permission granted and either no subscription or current one not in backend
        console.log("[Push] Auto-subscribe conditions:", {
          permissionGranted: Notification.permission === "granted",
          shouldSubscribe: !existingSubscription || !currentEndpointExists,
          hasPublicKey: !!configData?.data?.publicKey,
        });

        if (
          Notification.permission === "granted" &&
          (!existingSubscription || !currentEndpointExists) &&
          configData?.data?.publicKey
        ) {
          try {
            console.log("[Push] Starting auto-subscription...");
            await subscribe();
            console.log("[Push] Auto-subscription successful");
          } catch (err: any) {
            console.error("[Push] Auto-subscribe failed:", err);
          }
        } else {
          console.log("[Push] Auto-subscribe skipped - conditions not met");
        }
      } catch (err: any) {
        console.error("Failed to setup push notifications after login:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    subscribeAfterLogin();
  }, [
    isAuthenticated,
    isCountLoading,
    configData?.data?.publicKey,
    registration,
    subscribe,
    subscriptionCountData?.data?.subscriptions,
  ]);

  return {
    isSupported,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
  };
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray as unknown as Uint8Array;
}
