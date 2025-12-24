/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import {
  fieldContainerStyles,
  contentContainerStyles,
  FieldLabel,
} from "./FieldWrapper";

interface FormSelectHFProps {
  name: string;
  label: string;
  options: { value: string; label: React.ReactNode | string }[];
  placeholder?: string;
  defaultValue?: string;
  defaultOption?: { value: string; label: React.ReactNode | string };
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  onSearch?: (value: string) => void;
  triggerClassName?: string;
  labelClassName?: string;
}

const FormSelectHF: React.FC<FormSelectHFProps> = ({
  name,
  label,
  options,
  placeholder,
  defaultValue,
  defaultOption,
  onChange,
  required = false,
  disabled = false,
  searchable = false,
  onSearch,
  triggerClassName,
  labelClassName,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch?.(value);
  };

  useEffect(() => {
    if (open && searchable && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open, searchable]);

  // Combine default option with other options if it exists and isn't already in the list
  const allOptions = useMemo(() => {
    if (!defaultOption) return options;
    const optionExists = options.some(
      (opt) => opt.value === defaultOption.value
    );
    return optionExists ? options : [defaultOption, ...options];
  }, [defaultOption, options]);

  return (
    <div className="w-full space-y-1">
      {label && (
        <FieldLabel
          htmlFor={name}
          required={required}
          error={error}
          className={labelClassName}
        >
          {label}
        </FieldLabel>
      )}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultOption?.value || defaultValue}
        render={({ field }) => (
          <div>
            <Select
              open={open}
              onOpenChange={setOpen}
              onValueChange={(value: any) => {
                field.onChange(value);
                onChange?.(value);
                setOpen(false);
                setInputValue("");
              }}
              value={field.value}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  fieldContainerStyles,
                  triggerClassName,
                  error
                    ? "border-warning focus:ring-warning"
                    : "border-light-stroke-beta",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {field.value ? (
                  <SelectValue className="text-light-alpha">
                    {
                      allOptions.find((option) => option.value === field.value)
                        ?.label
                    }
                  </SelectValue>
                ) : (
                  <p className="!text-text_highlight/80">{placeholder}</p>
                )}
              </SelectTrigger>
              <SelectContent className={contentContainerStyles}>
                {searchable && (
                  <div
                    className=" px-2 py-1 border-b"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={inputRef}
                      className="w-full outline-none"
                      placeholder="Search..."
                      value={inputValue}
                      onChange={handleSearchChange}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                {allOptions?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="w-full flex items-center px-2 py-1.5 md:text-sm text-xs cursor-pointer text-text !rounded-lg hover:bg-primary/10 transition-colors font-normal"
                    style={{ transition: "background 0.15s" }}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-warning md:text-sm text-xs mt-1">
                {Array.isArray(error) &&
                  !error?.[0]?.toLowerCase().includes("required") &&
                  !error?.[0]?.toLowerCase().includes("null") &&
                  error?.[0]}
                {!Array.isArray(error) && error?.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default FormSelectHF;
