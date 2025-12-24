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
          className="flex items-center justify-center mr-4 lg:size-16  md:size-[60px] sm:size-14 size-12 bg-light-emerald-base p-1.5 text-white rounded-xl xl:hidden lg:mt-6 mt-4"
        >
          <TbMenu3 className="md:size-10 sm:size-8 size-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div onClick={closeSidebar} className="fixed inset-0 z-50 xl:hidden" />
      )}

      {/* Mobile Sidebar Drawer */}
      <Sidebar
        className={`transform transition-transform duration-300 xl:hidden  z-[999999] ${
          isSidebarOpen ? "-translate-x-[10%]" : "-translate-x-[120%]"
        }`}
      />
    </>
  );
};

export default MobileSidebar;
