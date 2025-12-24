"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { X } from "lucide-react";

interface CustomSideWindowProps {
  // Core functionality
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;

  // Positioning & behavior
  side?: "right" | "left" | "top" | "bottom";
  initialWidth?: number | string;

  // Resizing
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;

  // Styling
  className?: string;

  // Optional features
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  closeButton?: boolean;
}

const CustomSideWindow: React.FC<CustomSideWindowProps> = ({
  open,
  onOpenChange,
  children,
  side = "right",
  initialWidth = 400,
  resizable = true,
  minWidth = 200,
  maxWidth = 800,
  className,
  title,
  description,
  closeButton = true,
}) => {
  const [currentWidth, setCurrentWidth] = useState<number>(
    typeof initialWidth === "number"
      ? initialWidth
      : parseInt(initialWidth as string)
  );
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!resizable) return;

      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = currentWidth;

      // Prevent text selection during resize
      document.body.style.userSelect = "none";
      document.body.style.cursor = side === "left" ? "e-resize" : "w-resize";
    },
    [resizable, currentWidth, side]
  );

  // Handle mouse move during resize
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      let newWidth = startWidthRef.current;

      // Calculate new width based on side
      if (side === "right") {
        newWidth = startWidthRef.current - deltaX;
      } else if (side === "left") {
        newWidth = startWidthRef.current + deltaX;
      }

      // Apply constraints
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setCurrentWidth(newWidth);
    },
    [isResizing, side, minWidth, maxWidth]
  );

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  // Add/remove global mouse event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Generate dynamic styles based on side and current width
  const getDynamicStyles = () => {
    const styles: React.CSSProperties = {};

    if (side === "left" || side === "right") {
      styles.width = `${currentWidth}px`;
      styles.maxWidth = `${maxWidth}px`;
      styles.minWidth = `${minWidth}px`;
    } else if (side === "top" || side === "bottom") {
      styles.height = `${currentWidth}px`;
      styles.maxHeight = `${maxWidth}px`;
      styles.minHeight = `${minWidth}px`;
    }

    return styles;
  };

  // Determine resize handle position and cursor
  const getResizeHandleClasses = () => {
    const baseClasses =
      "absolute bg-transparent hover:bg-primary/20 transition-colors duration-200";

    switch (side) {
      case "right":
        return `${baseClasses} left-0 top-0 w-1 h-full cursor-w-resize hover:w-2`;
      case "left":
        return `${baseClasses} right-0 top-0 w-1 h-full cursor-e-resize hover:w-2`;
      case "top":
        return `${baseClasses} bottom-0 left-0 h-1 w-full cursor-s-resize hover:h-2`;
      case "bottom":
        return `${baseClasses} top-0 left-0 h-1 w-full cursor-n-resize hover:h-2`;
      default:
        return baseClasses;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "flex flex-col overflow-hidden bg-bg",
          // Remove default width/height to use our custom sizing
          side === "left" && "w-auto sm:max-w-none",
          side === "right" && "w-auto sm:max-w-none",
          side === "top" && "h-auto",
          side === "bottom" && "h-auto",
          className
        )}
        style={getDynamicStyles()}
      >
        {/* Custom Close Button */}
        {closeButton && (
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        )}

        {/* Resize Handle */}
        {resizable && (
          <div
            ref={resizeRef}
            className={getResizeHandleClasses()}
            onMouseDown={handleMouseDown}
            style={{ zIndex: 1000 }}
          />
        )}

        {/* Header */}
        {(title || description) && (
          <SheetHeader className="pb-4">
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription className="text-text">{description}</SheetDescription>}
          </SheetHeader>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>

        {/* Resize indicator when resizing */}
        {isResizing && (
          <div className="absolute inset-0 bg-primary/5 pointer-events-none flex items-center justify-center">
            <div className="bg-white px-3 py-2 rounded-md shadow-lg text-sm font-medium">
              {side === "left" || side === "right"
                ? `Width: ${currentWidth}px`
                : `Height: ${currentWidth}px`}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CustomSideWindow;
