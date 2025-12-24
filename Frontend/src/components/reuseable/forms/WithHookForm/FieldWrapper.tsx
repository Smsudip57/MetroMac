import React from "react";
import { cn } from "@/lib/utils";

// Universal field/trigger container styles (for inputs, selects, date pickers, etc.)
export const fieldContainerStyles =
  "h-10 px-4 py-[18px] bg-transparent border !border-border rounded-xl placeholder:text-text_highlight/80 text-text font-medium md:text-sm text-xs focus:!border-primary ring-offset-transparent focus-visible:ring-0 focus-visible:ring-offset-0";

// Universal content/popover container styles (for dropdowns, date picker popups, etc.)
export const contentContainerStyles =
  "bg-bg border border-border rounded-xl shadow-lg z-[999999999]";

// Universal label styles
export const labelStyles =
  "text-text_highlight md:text-[14px] text-xs mb-1.5 flex items-center font-medium";

// Label component with required indicator
export function FieldLabel({
  htmlFor,
  children,
  required = false,
  className,
  error,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  error?: any;
}) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={htmlFor} className={cn(labelStyles, className)}>
        {children}
        {required && (
          <span className="text-warning ml-1 text-xl leading-none h-3.5">
            *
          </span>
        )}
      </label>
      {Array.isArray(error) &&
        (error?.[0]?.toLowerCase().includes("required") ||
          error?.[0]?.toLowerCase().includes("null")) && (
          <p className="text-xs text-warning mr-2">Required</p>
        )}
    </div>
  );
}

export default function FieldWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-2 w-full", className)}>{children}</div>;
}
