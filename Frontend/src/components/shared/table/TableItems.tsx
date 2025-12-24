import React from "react";
import Image from "next/image";

export function TableSerial({
  currentPage,
  pageSize,
  index,
  className,
}: {
  className?: string;
  currentPage: number;
  pageSize: number;
  index: number;
}) {
  if (currentPage && pageSize && index) {
    return (
      <div className={`font-medium ${className}`}>
        {(currentPage - 1) * pageSize + index}
      </div>
    );
  }
  return <div></div>;
}

export function TableSingleItem({
  value,
  onClick,
  className,
}: {
  value: string | number;
  onClick: () => void;
  className?: string;
}) {
  return (
    <span className={`font-medium ${className}`} onClick={onClick}>
      {value}
    </span>
  );
}
export function TableDoubleHoriZontalItems({
  title,
  subtitle,
  className,
  TitleClassName,
  subtitleClassName,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  TitleClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-3 min-w-fit ${className}`}>
      <div className="grid">
        <div
          className={`font-medium truncate text-text_highlight ${TitleClassName}`}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className={`text-sm text-text truncate max-w-xs ${subtitleClassName}`}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
export function TableDoubleHoriZontalItemsWithImage({
  img,
  title,
  subtitle,
  className,
  ImageClassName,
  TitleClassName,
  subtitleClassName,
}: {
  img: string | File | null | undefined;
  title: string;
  subtitle?: string;
  className?: string;
  ImageClassName?: string;
  TitleClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-3 min-w-fit ${className}`}>
      {img && typeof img === "string" && (
        <Image
          src={img}
          alt={title}
          width={40}
          height={40}
          className={`w-10 h-10 rounded-xl object-cover border border-border bg-bg_shade flex-shrink-0 ${ImageClassName}`}
          style={{ minWidth: 40, minHeight: 40 }}
          unoptimized
        />
      )}
      <div className="grid">
        <div
          className={`font-medium truncate text-text_highlight ${TitleClassName}`}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className={`text-sm text-text truncate max-w-xs ${subtitleClassName}`}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function TableStatus({
  statusName,
  backgroundColor,
  textColor,
  className,
}: {
  statusName: string;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}) {
  const defaultStatusColors: any = {
    draft: { bg: "bg-gray-100", text: "text-gray-600" },
    sent: { bg: "bg-blue-100", text: "text-blue-600" },
    viewed: { bg: "bg-purple-100", text: "text-purple-600" },
    accepted: { bg: "bg-green-100", text: "text-green-600" },
    rejected: { bg: "bg-red-100", text: "text-red-600" },
    expired: { bg: "bg-orange-100", text: "text-orange-600" },
  };

  const hasCustomColors = backgroundColor || textColor;
  const statusNameLower = statusName?.toLowerCase() || "draft";
  const defaultColors =
    defaultStatusColors[statusNameLower] || defaultStatusColors.draft;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
        hasCustomColors ? "" : `${defaultColors.bg} ${defaultColors.text}`
      } ${className}`}
      style={
        hasCustomColors
          ? {
              backgroundColor: backgroundColor || "#f3f4f6",
              color: textColor || "#374151",
            }
          : {}
      }
    >
      {statusName}
    </span>
  );
}

export function TableColorDisplay({
  backgroundColor,
  textColor,
  showText = true,
  size = "small",
}: {
  backgroundColor?: string;
  textColor?: string;
  showText?: boolean;
  size?: "small" | "medium";
}) {
  const sizeClasses = {
    small: "w-3 h-3",
    medium: "w-6 h-6",
  };

  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
  };

  if (!backgroundColor && !textColor) {
    return (
      <span className={`text-neutral/60 ${textSizeClasses[size]}`}>
        No color set
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {backgroundColor && (
        <div
          className={`${sizeClasses[size]} rounded border border-border`}
          style={{ backgroundColor }}
          title={backgroundColor}
        />
      )}
      {showText && (backgroundColor || textColor) && (
        <span className={`text-text font-mono ${textSizeClasses[size]}`}>
          {backgroundColor || textColor}
        </span>
      )}
    </div>
  );
}
