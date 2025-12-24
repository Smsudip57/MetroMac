"use client";
import { useAppDispatch } from "@/lib/hooks";
import { toggleSidebarCollapse } from "@/redux/features/sidebarSlice";

export default function SidebarCollapseButton() {
  const dispatch = useAppDispatch();
  return (
    <button
      className="mr-2 p-2 hover:bg-bg_shade transition-all duration-200 rounded-lg text-text"
      aria-label="Toggle sidebar collapse"
      onClick={() => dispatch(toggleSidebarCollapse())}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-panel-left"
      >
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M9 3v18"></path>
      </svg>
    </button>
  );
}
