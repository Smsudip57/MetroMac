import React from "react";

type LeadIconProps = {
  width?: number | string;
  height?: number | string;
  fill?: string;
  className?: string;
};

export default function LeadIcon({
  width = 24,
  height = 20,
  fill = "currentColor",
  className = "",
}: LeadIconProps) {
  const clipPathId = React.useId();
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 17 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath={"url(#clip0_" + clipPathId + ")"}>
        <path
          d="M8.5 10C11.1828 10 13.3571 7.76172 13.3571 5C13.3571 2.23828 11.1828 0 8.5 0C5.81719 0 3.64286 2.23828 3.64286 5C3.64286 7.76172 5.81719 10 8.5 10ZM12.1353 11.2734L10.3214 18.75L9.10714 13.4375L10.3214 11.25H6.67857L7.89286 13.4375L6.67857 18.75L4.86473 11.2734C2.15915 11.4063 0 13.6836 0 16.5V18.125C0 19.1602 0.815848 20 1.82143 20H15.1786C16.1842 20 17 19.1602 17 18.125V16.5C17 13.6836 14.8408 11.4063 12.1353 11.2734Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id={"clip0_" + clipPathId}>
          <rect width="17" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
