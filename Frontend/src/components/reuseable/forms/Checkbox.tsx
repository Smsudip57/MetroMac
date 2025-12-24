import React from "react";

interface CheckboxProps {
  label: string;
  isChecked: boolean;
  onToggle: () => void;
  labelClassName?: string;
  variant?: "boxed" | "rounded";
  isLoading?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  isChecked,
  onToggle,
  labelClassName,
  variant,
  isLoading = false,
}) => {
  // Choose border radius based on variant
  const boxRadius = variant === "rounded" ? "rounded-full" : "rounded";

  return (
    <div className="inline-flex items-center cursor-pointer" onClick={onToggle}>
      <span className="mr-2 flex items-center justify-center">
        {isLoading ? (
          <span className="w-4 h-4 rounded-full border border-border flex items-center justify-center">
            <span
              className="w-3 h-3 block animate-spin rounded-full bg-gradient-to-tr from-primary to-secondary"
              style={{
                maskImage:
                  "conic-gradient(from 0deg, transparent 10%, black 100%)",
              }}
            />
          </span>
        ) : isChecked ? (
          <span
            className={`w-4 h-4 ${boxRadius} flex items-center justify-center bg-gradient-to-r from-primary to-secondary`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.55018 15.15L18.0252 6.675C18.2252 6.475 18.4585 6.375 18.7252 6.375C18.9918 6.375 19.2252 6.475 19.4252 6.675C19.6252 6.875 19.7252 7.11267 19.7252 7.388C19.7252 7.66333 19.6252 7.90067 19.4252 8.1L10.2502 17.3C10.0502 17.5 9.81685 17.6 9.55018 17.6C9.28351 17.6 9.05018 17.5 8.85018 17.3L4.55018 13C4.35018 12.8 4.25418 12.5627 4.26218 12.288C4.27018 12.0133 4.37451 11.7757 4.57518 11.575C4.77585 11.3743 5.01351 11.2743 5.28818 11.275C5.56285 11.2757 5.80018 11.3757 6.00018 11.575L9.55018 15.15Z"
                fill="white"
              />
            </svg>
          </span>
        ) : (
          <span
            className={`w-4 h-4 border ${boxRadius} border-[#BABFC4] bg-white`}
          />
        )}
      </span>
      <span className={`text-[#4E555B] text-base ${labelClassName}`}>
        {label}
      </span>
    </div>
  );
};

export default Checkbox;
