"use client";

import { TbMenu3 } from "react-icons/tb";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  toggleSidebarOpen,
  setSidebarOpen,
} from "@/redux/features/sidebarSlice";
import Sidebar from "./Sidebar";

const MobileSidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);
  const toggleSidebar = () => dispatch(toggleSidebarOpen());
  const closeSidebar = () => dispatch(setSidebarOpen(false));

  return (
    <>
      {/* Mobile Menu Button */}
      <div>
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center ml-4 sm+:ml-6 size-8 sm+:size-9 bg-primary hover:bg-primary/90 p-1.5 text-white rounded-lg xl:hidden transition-colors duration-200"
        >
          <TbMenu3 className="size-6 sm+:size-8" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div onClick={closeSidebar} className="fixed inset-0 z-50 xl:hidden" />
      )}

      {/* Mobile Sidebar Drawer */}
      <Sidebar
        className={`transform transition-transform duration-300 xl:hidden ml-4 z-[999999] ${
          isSidebarOpen ? "-translate-x-[10%]" : "-translate-x-[120%]"
        }`}
      />
    </>
  );
};

export default MobileSidebar;
