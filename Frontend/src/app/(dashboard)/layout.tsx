"use client";
import DashboardHeader from "@/components/shared/dashboard-header/DashboardHeader";
import Sidebar from "@/components/shared/sidebar/Sidebar";
import MobileSidebar from "@/components/shared/sidebar/MobileSidebar";
import { useAppSelector } from "@/lib/hooks";
import { noGutterRoutes } from "@/constants/shared"
import { usePathname } from "next/navigation";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.sidebar.isSidebarCollapsed
  );
  const pathname = usePathname()
  return (
    <>
      {/* <div className="w-full flex bg-gradient-to-br from-primary/5 to-secondary/5"> */}
      <div className={`w-full flex ${noGutterRoutes.includes(pathname) ? "bg-bg" : "bg-bg_shade"}`}>
        {/* Sidebar */}
        <div className="flex-shrink-0 hidden xl:block">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div
          className={`flex-grow md:px-6 px-4 min-h-screen overflow-hidden ${isSidebarCollapsed ? "xl:ml-[4.5rem]" : "xl:ml-[16rem]"
            } relative transition-all duration-300`}
        >
          <div
            className={`fixed top-0.5 right-0 ${isSidebarCollapsed ? "xl:left-[4.5rem]" : "xl:left-[16rem]"
              } left-0 bg-white z-[999] flex items-center transition-all duration-300`}
          >
            <MobileSidebar />
            <DashboardHeader />
          </div>
          <div className="md:mt-24 mt-24 mb-8 w-full">{children}</div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
