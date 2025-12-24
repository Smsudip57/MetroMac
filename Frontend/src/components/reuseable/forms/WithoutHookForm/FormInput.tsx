import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import FieldWrapper, {
  FieldLabel,
  fieldContainerStyles,
} from "@/components/reuseable/forms/WithHookForm/FieldWrapper";

interface FormInputProps {
  name: string;
  label?: string;
  className?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  isTextArea?: boolean;
  rows?: number;
  value: any;
  onChange: (value: any) => void;
  error?: {
    message?: string;
  };
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  className,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  isTextArea = false,
  rows = 4,
  value,
  onChange,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FieldWrapper>
      <FieldLabel htmlFor={name} required={required} error={error?.message}>
        {label}
      </FieldLabel>

      <div className="relative">
        {isTextArea ? (
          <Textarea
            id={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(fieldContainerStyles, "resize-none", className)}
          />
        ) : (
          <>
            <Input
              type={
                type === "password"
                  ? showPassword
                    ? "text"
                    : "password"
                  : type
              }
              id={name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                fieldContainerStyles,
                type === "password" && "pr-10",
                className
              )}
            />
            {type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text hover:text-primary cursor-pointer transition-colors"
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
        {error && <p className="text-warning text-xs mt-1">{error.message}</p>}
      </div>
    </FieldWrapper>
  );
};

export default FormInput;
