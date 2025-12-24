"use client";
import SearchField from "@/components/reuseable/Shared/SearchField";
import { useAppSelector } from "@/lib/hooks";
import { Search, Package } from "lucide-react";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { toggleTheme } from "@/redux/features/themeSlice";
import UserPopover from "./UserPopover";
import Notification from "./Notifications";
import SidebarCollapseButton from "./SidebarCollapseButton";
import { useInstallApp } from "@/hooks/useInstallApp";

const DashboardHeader: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  // Redux theme logic
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.mode === "dark");
  // Theme is initialized in ThemeInitializer component in root layout

  // PWA install
  const { isInstallable, isInstalled, install } = useInstallApp();

  // Log install state changes
  React.useEffect(() => {
    console.log("[DASHBOARD-HEADER] Install state updated:", {
      isInstallable,
      isInstalled,
    });
  }, [isInstallable, isInstalled]);

  return (
    <header className="bg-white dark:bg-bg shadow-sm w-full flex items-center px-8 lg:h-16 md:h-[60px]">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex flex-row justify-start items-center gap-4">
          {/* Sidebar collapse/expand button for desktop */}
          <div className="hidden xl:block -ml-4">
            <SidebarCollapseButton />
          </div>
          {/* Search Bar */}
          <SearchField />

          <div className="md:hidden flex items-center justify-center">
            <Search className="cursor-pointer text-neutral hover:text-primary hover:bg-bg_shade transition-all duration-200 size-6 p-1 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-5 justify-end">
          {/* Install App Button (Mobile/PWA) */}
          {!isInstalled && (
            <button
              onClick={install}
              className="relative p-2 rounded-lg bg-primary hover:bg-primary/90 transition-all duration-200 w-9 h-9 flex items-center justify-center border-none focus:outline-none"
              title="Install MetroMac App"
              aria-label="Install app"
            >
              <Package className="w-5 h-5 text-white" />
            </button>
          )}
          {/* Theme toggle button */}
          {/* <button
            onClick={() => dispatch(toggleTheme())}
            className="relative p-2 rounded-lg bg-bg_shade hover:bg-bg_shade/80 transition-all duration-200 w-9 h-9 flex items-center justify-center border-none focus:outline-none"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-yellow-400"
              >
                <g clipPath="url(#clip0_43_18)">
                  <path
                    d="M22 12H23M12 2V1M12 23V22M20 20L19 19M20 4L19 5M4 20L5 19M4 4L5 5M1 12H2M12 18C13.5913 18 15.1174 17.3679 16.2426 16.2426C17.3679 15.1174 18 13.5913 18 12C18 10.4087 17.3679 8.88258 16.2426 7.75736C15.1174 6.63214 13.5913 6 12 6C10.4087 6 8.88258 6.63214 7.75736 7.75736C6.63214 8.88258 6 10.4087 6 12C6 13.5913 6.63214 15.1174 7.75736 16.2426C8.88258 17.3679 10.4087 18 12 18Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_43_18">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-700 dark:text-gray-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                />
              </svg>
            )}
          </button> */}
          {/* <Notification /> */}
          <UserPopover user={user} />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
