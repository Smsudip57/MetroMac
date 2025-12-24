import Link from "next/link";
import { usePathname } from "next/navigation";

// Sidebar item class constants
export const getSidebarItemBaseClass = (collapsed: boolean) =>
  `${
    collapsed
      ? "!p-2 !py-2 w-max mx-auto flex items-center justify-center text-sm font-medium transition-all duration-200 hover:rounded-lg"
      : "px-4 !py-1.5 flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:rounded-lg"
  }`;
export const getSidebarItemActiveClass = (collapsed: boolean) =>
  `bg-primary/10 text-primary rounded-lg${
    !collapsed ? "" : ""
  }`;
export const SIDEBAR_ITEM_INACTIVE_CLASS =
  "text-text rounded-none hover:bg-bg_shade";

type SidebarItemProps = {
  icon: React.ReactNode;
  title: string;
  link: string;
  className?: string;
  showBorder?: boolean;
  closeSidebar?: () => void;
  collapsed?: boolean;
};

const SidebarItem = ({
  icon,
  title,
  link,
  className,
  showBorder = false,
  closeSidebar,
  collapsed = false,
}: SidebarItemProps) => {
  const isActive = usePathname().startsWith(link);
  return (
    <div className={showBorder ? "border-b border-bg_shade/10 pb-1.5" : ""}>
      <Link
        href={link}
        onClick={closeSidebar}
        className={`
          ${className ? className : ""}
          ${getSidebarItemBaseClass(collapsed)}
          ${
            isActive
              ? getSidebarItemActiveClass(collapsed)
              : SIDEBAR_ITEM_INACTIVE_CLASS
          }
          ${collapsed ? "justify-center px-0" : ""}
        `}
      >
        <span className="opacity-70">{icon}</span>
        {!collapsed && <span className="ml-1 truncate">{title}</span>}
      </Link>
    </div>
  );
};

export default SidebarItem;
