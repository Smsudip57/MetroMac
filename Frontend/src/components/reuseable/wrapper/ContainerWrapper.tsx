import React from "react";

export default function ContainerWrapper({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`space-y-6 bg-bg p-4 xl:p-6 rounded-lg overflow-hidden border-border border ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
