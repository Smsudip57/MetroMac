import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { fieldContainerStyles, FieldLabel } from "./FieldWrapper";

interface FormInputHFProps {
  name: string;
  label: string;
  className?: string;
  type?:
    | "text"
    | "password"
    | "number"
    | "textarea"
    | "email"
    | "color"
    | "time";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

const FormInputHF: React.FC<FormInputHFProps> = ({
  name,
  label,
  className,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  min,
  max,
  step = 1,
}) => {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="w-full">
          <FieldLabel htmlFor={name} required={required} error={error}>
            {label}
          </FieldLabel>
          <div className="relative mt-1">
            {type === "textarea" ? (
              <Textarea
                {...field}
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={cn(
                  " !pt-3",
                  fieldContainerStyles,
                  error && "border-warning focus-visible:ring-warning",
                  className
                )}
              />
            ) : type === "number" ? (
              <Input
                {...field}
                type="number"
                id={name}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  fieldContainerStyles,
                  error && "border-warning focus-visible:ring-warning",
                  className
                )}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? "" : Number(e.target.value);
                  if (
                    value === "" ||
                    ((!min || value >= min) && (!max || value <= max))
                  ) {
                    field.onChange(value);
                  }
                }}
              />
            ) : type === "color" ? (
              <div className="flex items-center gap-2">
                <Input
                  {...field}
                  type="color"
                  id={name}
                  disabled={disabled}
                  className={cn(
                    "w-16 p-1 cursor-pointer",
                    fieldContainerStyles,
                    error && "border-warning focus-visible:ring-warning",
                    className
                  )}
                />
                <Input
                  {...field}
                  type="text"
                  placeholder={placeholder || "#3B82F6"}
                  disabled={disabled}
                  className={cn(
                    "flex-1",
                    fieldContainerStyles,
                    error && "border-warning focus-visible:ring-warning",
                    className
                  )}
                />
              </div>
            ) : (
              <>
                <Input
                  {...field}
                  type={
                    type === "password"
                      ? showPassword
                        ? "text"
                        : "password"
                      : type === "time"
                      ? "time"
                      : type
                  }
                  id={name}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={cn(
                    fieldContainerStyles,
                    error && "border-warning focus-visible:ring-warning",
                    type === "password" && "pr-10",
                    className
                  )}
                />
                {type === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[22px] -translate-y-1/2 text-light-alpha hover:text-light-warning cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                )}
              </>
            )}
            {error && (
              <p className="text-warning text-xs mt-1">
                {Array.isArray(error) &&
                  !error?.[0]?.toLowerCase().includes("required") &&
                  error?.[0]}
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
};

export default FormInputHF;
