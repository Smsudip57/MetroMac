import React from "react";

interface AddIconProps {
  color?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function AddIcon({
  color = "currentColor",
  width = 24,
  height = 24,
  className = "",
}: AddIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-circle-plus ${className}`}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 12h8"></path>
      <path d="M12 8v8"></path>
    </svg>
  );
}
