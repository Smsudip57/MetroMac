import React from "react";

type PauseIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
  color?: string;
  className?: string;
};

export default function PauseIcon({
  size = 20,
  color = "currentColor",
  className,
  ...props
}: PauseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M5 2C4.46957 2 3.96086 2.21071 3.58579 2.58579C3.21071 2.96086 3 3.46957 3 4V16C3 16.5304 3.21071 17.0391 3.58579 17.4142C3.96086 17.7893 4.46957 18 5 18H7C7.53043 18 8.03914 17.7893 8.41421 17.4142C8.78929 17.0391 9 16.5304 9 16V4C9 3.46957 8.78929 2.96086 8.41421 2.58579C8.03914 2.21071 7.53043 2 7 2H5ZM13 2C12.4696 2 11.9609 2.21071 11.5858 2.58579C11.2107 2.96086 11 3.46957 11 4V16C11 16.5304 11.2107 17.0391 11.5858 17.4142C11.9609 17.7893 12.4696 18 13 18H15C15.5304 18 16.0391 17.7893 16.4142 17.4142C16.7893 17.0391 17 16.5304 17 16V4C17 3.46957 16.7893 2.96086 16.4142 2.58579C16.0391 2.21071 15.5304 2 15 2H13Z"
        fill={color}
      />
    </svg>
  );
}
