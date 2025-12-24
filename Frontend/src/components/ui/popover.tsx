"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "!z-[10000050] bg-white w-72 rounded-md bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };

type Placement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

type ControlledPopoverProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  anchorRef?: React.RefObject<HTMLElement>;
  anchorRect?: DOMRect | null;
  placement?: Placement;
  sideOffset?: number;
  className?: string;
  children?: React.ReactNode;
} & Omit<
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
  "ref"
>;

/**
 * ControlledPopover
 * - `anchorRef` or `anchorRect` must be provided from the outside trigger element.
 * - `placement` controls where the popover will appear relative to the anchor.
 * - This component is controlled (you pass `open` and `onOpenChange`).
 */
export function ControlledPopover({
  open,
  onOpenChange,
  anchorRef,
  anchorRect = null,
  placement = "bottom",
  sideOffset = 8,
  className,
  children,
  ...props
}: ControlledPopoverProps) {
  const contentRef = React.useRef<HTMLElement | null>(null);
  const [coords, setCoords] = React.useState<{
    left: number;
    top: number;
  } | null>(null);

  const getAnchorRect = React.useCallback((): DOMRect | null => {
    // Prefer a live ref (so the popover follows the trigger during scroll/resize).
    if (anchorRef?.current) return anchorRef.current.getBoundingClientRect();
    if (anchorRect) return anchorRect;
    return null;
  }, [anchorRef, anchorRect]);

  // compute position whenever open or anchor changes or content size changes
  React.useLayoutEffect(() => {
    if (!open) return setCoords(null);

    const calculatePosition = () => {
      const anchor = getAnchorRect();
      if (!anchor) return null;

      const content = contentRef.current;
      if (!content) return null; // Wait for content to mount

      const contentRect = content.getBoundingClientRect();

      let left = 0;
      let top = 0;

      switch (placement) {
        case "top":
          left = anchor.left + anchor.width / 2 - contentRect.width / 2;
          top = anchor.top - contentRect.height - sideOffset;
          break;
        case "bottom":
          left = anchor.left + anchor.width / 2 - contentRect.width / 2;
          top = anchor.bottom + sideOffset;
          break;
        case "left":
          left = anchor.left - contentRect.width - sideOffset;
          top = anchor.top + anchor.height / 2 - contentRect.height / 2;
          break;
        case "right":
          left = anchor.right + sideOffset;
          top = anchor.top + anchor.height / 2 - contentRect.height / 2;
          break;
        case "top-left":
          left = anchor.left;
          top = anchor.top - contentRect.height - sideOffset;
          break;
        case "top-right":
          left = anchor.right - contentRect.width;
          top = anchor.top - contentRect.height - sideOffset;
          break;
        case "bottom-left":
          left = anchor.left;
          top = anchor.bottom + sideOffset;
          break;
        case "bottom-right":
          left = anchor.right - contentRect.width;
          top = anchor.bottom + sideOffset;
          break;
        default:
          left = anchor.left + anchor.width / 2 - contentRect.width / 2;
          top = anchor.bottom + sideOffset;
      }

      // clamp to viewport
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const clampedLeft = Math.max(
        8,
        Math.min(left, winW - contentRect.width - 8)
      );
      const clampedTop = Math.max(
        8,
        Math.min(top, winH - contentRect.height - 8)
      );

      return { left: clampedLeft, top: clampedTop };
    };

    // Initial position calculation with retry if content not ready
    const setInitialPosition = () => {
      const coords = calculatePosition();
      if (coords) {
        setCoords(coords);
      } else {
        // Retry after content mounts
        setTimeout(setInitialPosition, 0);
      }
    };

    setInitialPosition();

    // recompute on resize/scroll while open
    const onUpdate = () => {
      const coords = calculatePosition();
      if (coords) {
        setCoords(coords);
      }
    };

    window.addEventListener("resize", onUpdate);
    window.addEventListener("scroll", onUpdate, true);
    return () => {
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("scroll", onUpdate, true);
    };
  }, [open, getAnchorRect, placement, sideOffset, children]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={contentRef as any}
          sideOffset={0}
          className={cn(
            "!z-[10000050] bg-white w-72 rounded-md bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className
          )}
          style={
            coords
              ? { position: "fixed", left: coords.left, top: coords.top }
              : { visibility: "hidden" }
          }
          {...props}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
