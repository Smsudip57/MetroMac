"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Create context
interface PushNotificationContextType {
  isSupported: boolean;
  isSubscribed: boolean;
  loading: boolean;
  error: string | null;
  subscribe: () => Promise<any>;
  unsubscribe: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
}

const PushNotificationContext = createContext<
  PushNotificationContextType | undefined
>(undefined);

// Provider component
interface PushNotificationProviderProps {
  children: ReactNode;
}

export const PushNotificationProvider: React.FC<
  PushNotificationProviderProps
> = ({ children }) => {
  const pushNotifications = usePushNotifications();

  return (
    <PushNotificationContext.Provider value={pushNotifications}>
      {children}
    </PushNotificationContext.Provider>
  );
};

// Hook to use the context
export const usePushNotificationContext = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error(
      "usePushNotificationContext must be used within PushNotificationProvider"
    );
  }
  return context;
};
