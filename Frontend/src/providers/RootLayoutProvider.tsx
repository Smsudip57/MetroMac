"use client";
import Loader from "@/components/reuseable/Shared/Loader";
import { useGetGeneralSettingsQuery } from "@/redux/api/settings/generalsettings/generalSettingsApi";
import { ReactNode } from "react";
import { PushNotificationProvider } from "./PushNotificationProvider";

interface RootLayoutProviderProps {
  children: ReactNode;
}

export const RootLayoutProvider = ({
  children,
}: RootLayoutProviderProps): JSX.Element => {
  const { isLoading: settingsLoading } = useGetGeneralSettingsQuery({});

  if (settingsLoading) {
    return <Loader />;
  }

  return <PushNotificationProvider>{children}</PushNotificationProvider>;
};
