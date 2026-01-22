"use client";
import NextImage from "next/image";
import SidebarItem from "./SidebarItem";
import { SidebarItemWithAccordion } from "./SidebarItemWithAccordion";
import { useLogoutMutation } from "@/redux/api/authApi";
import { logout, setUser } from "@/redux/features/authSlice";
import { useGetMeQuery } from "@/redux/api/profile/profileApi";
import { useUnsubscribeFromPushMutation } from "@/redux/api/push/pushApi";
import { taskApi } from "@/redux/api/tasks/taskApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { useGetGeneralSettingsQuery } from "@/redux/api/settings/generalsettings/generalSettingsApi";

// import { useGetGeneralSettingQuery } from "@/redux/api/cmsApi";
import {
  LayoutDashboard,
  Users,
  FileText,
  UserPlus,
  Ticket,
  Building2,
  UserCheck,
  Calendar,
  Clock,
  Award,
  MapPin,
  FolderOpen,
  CheckSquare,
  Timer,
  BookOpen,
  Globe,
  Shield,
  Database,
  LogOut,
  ListTodo,
  Archive,
} from "lucide-react";

type SidebarProps = {
  className?: string;
};

const Sidebar = ({ className = "" }: SidebarProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const isSidebarCollapsed = useAppSelector(
    (state) => state.sidebar.isSidebarCollapsed,
  );

  const modules = useAppSelector((state) => state.auth.modules);

  const [logOutMutation] = useLogoutMutation();
  const [unsubscribeMutation] = useUnsubscribeFromPushMutation();
  const { data: settingsData } = useGetGeneralSettingsQuery(undefined);
  const { refetch: refetchMe } = useGetMeQuery({});
  const settings = settingsData?.data;

  // Helper function to check if user has permission for a module
  const hasPermission = (
    moduleName: string,
    action: string = "view",
  ): boolean => {
    const foundModule = modules.find(
      (m: any) => m.name.toLowerCase() === moduleName.toLowerCase(),
    );
    return foundModule ? foundModule.actions.includes(action) : false;
  };

  // Helper function to check if user has permission for any sub-module
  // const hasSubModulePermission = (parentName: string): boolean => {
  //   const parentModule = modules.find(
  //     (m:any) => m.name.toLowerCase() === parentName.toLowerCase()
  //   );
  //   if (!parentModule) return false;

  //   // Check if parent has children with view permission or parent itself has view permission
  //   return (
  //     parentModule.actions.includes("view") ||
  //     (parentModule.children && parentModule.children.length > 0)
  //   );
  // };

  const handleLogout = async () => {
    try {
      // Unsubscribe from push notifications before logging out
      if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          if (registrations.length > 0) {
            const registration = registrations[0];
            const subscription =
              await registration.pushManager.getSubscription();

            if (subscription) {
              const endpoint = subscription.endpoint;
              console.log("[Push] Unsubscribing from endpoint:", endpoint);

              // Notify backend to remove this specific subscription
              await unsubscribeMutation(endpoint).unwrap();
              console.log("[Push] Backend subscription removed");

              // Unsubscribe from browser
              await subscription.unsubscribe();
              console.log("[Push] Browser subscription removed");
            }
          }
        } catch (pushError) {
          console.warn("[Push] Error during push unsubscribe:", pushError);
          // Don't block logout if push unsubscribe fails
        }
      }

      // Proceed with regular logout
      await logOutMutation({}).unwrap();
      toast.success("Logged out successfully");

      dispatch(setUser(null));
      dispatch(logout());

      // Clear Tasks API cache
      dispatch(taskApi.util.resetApiState());

      // Refetch to clear the profile cache and trigger UserProvider redirect
      await refetchMe();

      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/");
      dispatch(setUser(null));
      dispatch(logout());
      dispatch(taskApi.util.resetApiState());
      // Still refetch even on error to clear cache
      await refetchMe();
    }
  };
  // const { data } = useGetGeneralSettingQuery(undefined);
  // const settingData = data?.data;

  // Sidebar sections and items as arrays
  // Types for sidebar items
  type MenuItem = {
    icon: React.ReactNode;
    title: string;
    link: string;
  };
  type SidebarItemType = {
    type: "item";
    icon: React.ReactNode;
    title: string;
    link: string;
  };
  type SidebarAccordionType = {
    type: "accordion";
    icon: React.ReactNode;
    title: string;
    menuItems: MenuItem[];
  };
  type SidebarSection = {
    label: string | null;
    items: (SidebarItemType | SidebarAccordionType)[];
  };

  const sidebarSections = [
    {
      label: null,
      items: [
        {
          type: "item",
          icon: <LayoutDashboard className="size-4" />,
          title: "Dashboard",
          link: "/dashboard",
        },
      ].filter((item) => hasPermission("Dashboard")),
    },
    {
      label: "MANAGEMENT",
      items: [
        {
          type: "item",
          icon: <Users className="size-4" />,
          title: "Users",
          link: "/users",
        },
        hasPermission("Tasks")
          ? {
              type: "accordion",
              icon: <ListTodo className="size-4" />,
              title: "Tasks",
              menuItems: [
                {
                  title: "All",
                  link: "/tasks",
                  icon: <CheckSquare className="size-4" />,
                },
                {
                  title: "Archived",
                  link: "/tasks/archived",
                  icon: <Archive className="size-4" />,
                },
              ],
            }
          : null,
      ].filter(
        (item) =>
          item && (item.type === "accordion" || hasPermission(item.title)),
      ),
    },
    {
      label: "SALES",
      items: [
        {
          type: "item",
          icon: <FileText className="size-4" />,
          title: "Invoice",
          link: "/sales/invoice",
        },
      ].filter((item) => hasPermission(item.title)),
    },
    {
      label: "ADMINISTRATION",
      items: [
        {
          type: "item",
          icon: <Shield className="size-4" />,
          title: "Settings",
          link: "/settings",
        },
      ].filter((item) => hasPermission(item.title)),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <div
      className={`fixed h-screen bg-bg border-r border-border top-0 transition-all duration-300 ${
        isSidebarCollapsed
          ? "w-[4.5rem] sm:w-[4.5rem]"
          : "sm:w-[16rem] w-[14.8rem]"
      } ${className}`}
    >
      <div className="flex flex-col h-full">
        <div className="w-full flex justify-center md:px-6 px-4 pt-6 mb-4">
          <Link href="/" className="flex items-center justify-center">
            {/* Show Icon when collapsed, Logo when expanded */}
            {isSidebarCollapsed ? (
              // Icon display (collapsed)
              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-primary/10">
                {settings?.company_icon ? (
                  <NextImage
                    src={settings.company_icon}
                    alt="Company Icon"
                    width={100000000000000000}
                    height={100000000000000000}
                    quality={100}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Fallback icon SVG
                  <svg
                    width={28}
                    height={28}
                    viewBox="0 0 82 82"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_954_56)">
                      <rect width={82} height={82} fill="transparent" />
                      <path
                        d="M80.4993 8.94446H69.1907L51.293 26.3677C48.6727 28.9025 45.1687 30.3178 41.5231 30.314C37.876 30.3188 34.3704 28.9034 31.7491 26.3677L13.8674 8.94446H2.54688L26.0968 31.8805C34.6271 40.1836 48.4469 40.1836 56.9692 31.8805L80.4993 8.94446ZM2.55086 72.7222H13.8196L31.789 55.2431C34.3999 52.7162 37.8936 51.3076 41.5271 51.3168C45.1704 51.3168 48.6702 52.7279 51.2651 55.2431L69.2345 72.7222H80.4993L56.9015 49.7582C48.4031 41.495 34.6391 41.495 26.1486 49.7582L2.55086 72.7222Z"
                        fill="#892CDC"
                      />
                      <path
                        d="M42.8883 6.62714C42.3456 6.17689 41.666 5.93091 40.9648 5.93091C40.2637 5.93091 39.5841 6.17689 39.0414 6.62714C36.3124 8.85663 30.6821 13.7258 22.1487 22.3807C13.6153 31.0355 8.81265 36.7477 6.61615 39.5138C6.17222 40.0642 5.92969 40.7535 5.92969 41.4646C5.92969 42.1757 6.17222 42.865 6.61615 43.4154C8.81265 46.1832 13.6136 51.8937 22.1487 60.5485C30.6821 69.2033 36.3141 74.0743 39.0414 76.3038C39.5841 76.754 40.2637 77 40.9648 77C41.666 77 42.3456 76.754 42.8883 76.3038C45.6173 74.0743 51.2476 69.2033 59.781 60.5485C68.3144 51.8937 73.117 46.1815 75.3135 43.4154C75.7575 42.865 76 42.1757 76 41.4646C76 40.7535 75.7575 40.0642 75.3135 39.5138C73.1153 36.7477 68.3161 31.0355 59.781 22.3807C51.2476 13.7258 45.6156 8.85663 42.8883 6.62714Z"
                        stroke="#892CDC"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_954_56">
                        <rect width={82} height={82} fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
              </div>
            ) : (
              // Logo display (expanded)
              <div className="flex items-center gap-2">
                {settings?.company_logo ? (
                  <NextImage
                    src={settings.company_logo}
                    alt="Company Logo"
                    width={100000000000000000}
                    height={100000000000000000}
                    quality={100}
                    className="h-10 w-auto"
                  />
                ) : (
                  // Fallback text with icon
                  <div className="font-bold text-primary flex items-center gap-2 text-xl">
                    <svg
                      width={32}
                      height={32}
                      viewBox="0 0 82 82"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_954_56)">
                        <rect width={82} height={82} fill="transparent" />
                        <path
                          d="M80.4993 8.94446H69.1907L51.293 26.3677C48.6727 28.9025 45.1687 30.3178 41.5231 30.314C37.876 30.3188 34.3704 28.9034 31.7491 26.3677L13.8674 8.94446H2.54688L26.0968 31.8805C34.6271 40.1836 48.4469 40.1836 56.9692 31.8805L80.4993 8.94446ZM2.55086 72.7222H13.8196L31.789 55.2431C34.3999 52.7162 37.8936 51.3076 41.5271 51.3168C45.1704 51.3168 48.6702 52.7279 51.2651 55.2431L69.2345 72.7222H80.4993L56.9015 49.7582C48.4031 41.495 34.6391 41.495 26.1486 49.7582L2.55086 72.7222Z"
                          fill="#892CDC"
                        />
                        <path
                          d="M42.8883 6.62714C42.3456 6.17689 41.666 5.93091 40.9648 5.93091C40.2637 5.93091 39.5841 6.17689 39.0414 6.62714C36.3124 8.85663 30.6821 13.7258 22.1487 22.3807C13.6153 31.0355 8.81265 36.7477 6.61615 39.5138C6.17222 40.0642 5.92969 40.7535 5.92969 41.4646C5.92969 42.1757 6.17222 42.865 6.61615 43.4154C8.81265 46.1832 13.6136 51.8937 22.1487 60.5485C30.6821 69.2033 36.3141 74.0743 39.0414 76.3038C39.5841 76.754 40.2637 77 40.9648 77C41.666 77 42.3456 76.754 42.8883 76.3038C45.6173 74.0743 51.2476 69.2033 59.781 60.5485C68.3144 51.8937 73.117 46.1815 75.3135 43.4154C75.7575 42.865 76 42.1757 76 41.4646C76 40.7535 75.7575 40.0642 75.3135 39.5138C73.1153 36.7477 68.3161 31.0355 59.781 22.3807C51.2476 13.7258 45.6156 8.85663 42.8883 6.62714Z"
                          stroke="#892CDC"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_954_56">
                          <rect width={82} height={82} fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    STech
                  </div>
                )}
              </div>
            )}
          </Link>
        </div>

        <div
          className={`flex-1 overflow-y-auto scrollbar-hide ${
            isSidebarCollapsed ? "px-2" : "md:px-6 px-4 pl-6"
          }`}
        >
          {sidebarSections.map((section, idx) => (
            <div
              key={section.label || `section-${idx}`}
              className="flex flex-col gap-1"
            >
              {section.label && !isSidebarCollapsed && (
                <div className="mt-4 mb-2">
                  <h3 className="text-xs text-gray-500 tracking-wider px-2">
                    {section.label}
                  </h3>
                </div>
              )}
              {isSidebarCollapsed && <span className="mb-1" />}
              {section.items.map((item: any) => {
                if (item.type === "item") {
                  // item is SidebarItemType
                  return (
                    <SidebarItem
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                      link={item.link}
                      // closeSidebar removed; use Redux for open/close if needed
                      collapsed={isSidebarCollapsed}
                    />
                  );
                } else if (item.type === "accordion") {
                  // item is SidebarAccordionType
                  const accordionItem = item as unknown as SidebarAccordionType;
                  return (
                    <SidebarItemWithAccordion
                      key={accordionItem.title}
                      icon={accordionItem.icon}
                      title={accordionItem.title}
                      // closeSidebar removed; use Redux for open/close if needed
                      menuItems={accordionItem.menuItems}
                      collapsed={isSidebarCollapsed}
                    />
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>

        <div
          className={`md:px-4 px-3 py-3 mt-auto ${
            isSidebarCollapsed ? "flex justify-center" : ""
          }`}
        >
          <button
            onClick={handleLogout}
            className={`bg-primary/10 border border-primary/20 text-primary rounded-lg py-2 text-xs font-semibold flex items-center gap-2 justify-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-200 ${
              isSidebarCollapsed ? "w-9 h-9 p-0 justify-center" : "w-full"
            }`}
            title="Logout"
          >
            <LogOut className="size-4" />
            {!isSidebarCollapsed && "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
