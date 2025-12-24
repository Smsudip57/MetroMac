import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";

import Link from "next/link";
import {
  getSidebarItemBaseClass,
  SIDEBAR_ITEM_INACTIVE_CLASS,
  getSidebarItemActiveClass,
} from "./SidebarItem";

type props = {
  icon: React.ReactNode;
  title: string;
  menuItems: {
    icon: React.ReactNode;
    title: string;
    link: string;
  }[];
  closeSidebar?: () => void;
  collapsed?: boolean;
};

export const SidebarItemWithAccordion = ({
  icon,
  title,
  menuItems,
  closeSidebar,
  collapsed = false,
}: props) => {
  const pathname = usePathname();

  const isActive = (link: string) => pathname === link;
  const isAnyMenuActive = menuItems.some((item) => isActive(item.link));

  return (
    <Accordion type="multiple" className="w-full ">
      <AccordionItem value={title}>
        <AccordionTrigger
          className={`${getSidebarItemBaseClass(
            collapsed
          )} ${
            isAnyMenuActive
              ? getSidebarItemActiveClass(collapsed)
              : SIDEBAR_ITEM_INACTIVE_CLASS
          } ${collapsed ? "justify-center px-0" : ""}`}
          style={!collapsed ? {} : {maxWidth:"max-content"}}
        >
          <div
            className={`flex gap-2 items-center ${
              collapsed ? "justify-center w-max mx-auto" : ""
            }`}
          >
            <span className="opacity-70">{icon}</span>
            {!collapsed && <div className="ml-1 truncate">{title}</div>}
          </div>
          {!collapsed && <ChevronDownIcon className={`size-[18px]`} />}
        </AccordionTrigger>
        {!collapsed && (
          <AccordionContent className="!-mb-4 pb-0 ">
            <div className="border-l border-border ml-6">
              {menuItems?.map((item) => (
                <Link
                  key={item.title}
                  href={item.link}
                  onClick={closeSidebar}
                  className={`hover:bg-bg_shade hover:rounded-lg my-1 !px-5 !py-[5px] !text-sm  flex items-center transition-all duration-200 ml-2 !pl-4 ${getSidebarItemBaseClass(
                    false
                  )} ${
                    isActive(item.link)
                      ? "bg-primary/10 text-primary !rounded-lg "
                      : "text-text rounded-none hover:rounded-lg"
                  }`}
                >
                  <p className="truncate">{item.title}</p>
                </Link>
              ))}
            </div>
          </AccordionContent>
        )}
      </AccordionItem>
    </Accordion>
  );
};
