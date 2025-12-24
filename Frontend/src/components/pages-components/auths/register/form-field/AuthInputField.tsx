"use client";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";

type AuthInputFieldsProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
};

const AuthInputField = ({
  label,
  type,
  placeholder,
  name,
  required,
  disabled = false,
  className,

  iconBefore,
}: AuthInputFieldsProps) => {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <div className="relative w-full">
          {label && (
            <label htmlFor={name} className="text_highlight-alpha font-medium">
              {label}{" "}
              {required && (
                <span className="text_highlight-warning-red ml-1">*</span>
              )}
            </label>
          )}
          <div className="relative w-full pt-2">
            <input
              type={
                type === "password"
                  ? showPassword
                    ? "text"
                    : "password"
                  : type
              }
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                `w-full ${iconBefore ? "pl-8" : "pl-4"} 
                                ${type === "password" ? "pr-8" : "pr-4"}
                                py-2.5 rounded-lg bg-transparent border border-[#CCCCCC] text_highlight-alpha placeholder-dark-beta focus:outline-none focus:border-dark-emerald-light `,
                className
              )}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <FiEyeOff size={18} className="text_highlight-alpha" />
                ) : (
                  <FiEye size={18} className="text_highlight-alpha" />
                )}
              </button>
            )}
            {iconBefore && (
              <button
                type="button"
                className="absolute left-2.5 top-1/2 -translate-y-1/2"
              >
                {iconBefore}
              </button>
            )}
            {error && (
              <p className="text_highlight-warning-red text-sm mt-1">
                {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
};

export default AuthInputField;
