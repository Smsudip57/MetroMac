"use client";

import React from "react";
import { ControlledPopover } from "@/components/ui/popover";
import ContainerWrapper from "@/components/reuseable/wrapper/ContainerWrapper";

type MenuItem = {
  label: string;
  action: string;
  onClick?: (itemId: string | number) => void | Promise<void>;
};

type MenuModalProps = {
  itemId: string | number;
  triggerRef: React.RefObject<HTMLElement>;
  anchorRect?: DOMRect | null;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?:
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
  menu: MenuItem[];
  /**
   * Optional callback called when a menu item is selected.
   * Only called if the menu item doesn't have its own onClick
   */
  onNavigate?: (action: string, itemId: string | number) => void;
  /** Optional loading state */
  isLoading?: boolean;
};

export default function MenuModal({
  itemId,
  triggerRef,
  anchorRect,
  open,
  onOpenChange,
  onNavigate,
  menu,
  placement = "bottom-right",
  isLoading = false,
}: MenuModalProps) {
  const [activeAction, setActiveAction] = React.useState<string | null>(null);

  const handleSelect = async (item: MenuItem) => {
    setActiveAction(item.action);
    try {
      // If item has its own onClick handler, use that
      if (item.onClick) {
        await item.onClick(itemId);
      } else if (onNavigate) {
        // Otherwise use the parent's onNavigate callback
        onNavigate(item.action, itemId);
      }
    } finally {
      setActiveAction(null);
      onOpenChange?.(false);
    }
  };

  return (
    <ControlledPopover
      open={open}
      onOpenChange={onOpenChange}
      anchorRef={triggerRef}
      anchorRect={anchorRect}
      placement={placement}
      className="!p-0 !z-[50] w-max"
    >
      <ContainerWrapper
        className="!p-2 min-w-[200px] shadow-primary"
        style={{ boxShadow: "0 10px 30px #6157ff24" }}
      >
        <div className="flex flex-col">
          {menu.map(({ label, action }, idx, arr) => {
            const isActive = activeAction === action;
            return (
              <button
                key={action}
                type="button"
                onClick={() => handleSelect(menu.find(m => m.action === action)!)}
                disabled={isLoading || isActive}
                className={`w-full text-left px-3 py-2 text-text transition-colors flex items-center gap-2 ${idx < arr.length - 1 ? "border-b border-border" : ""
                  } rounded-sm hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? "bg-primary/5" : ""
                  }`}
              >
                {isActive && (
                  <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                )}
                {label}
              </button>
            );
          })}
        </div>
      </ContainerWrapper>
    </ControlledPopover>
  );
}
