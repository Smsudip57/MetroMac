"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaAngleDown } from "react-icons/fa6";

interface OptionType {
  value: string;
  label: string;
}

interface AuthSearchSelectProps {
  name: string;
  label?: string;
  options: OptionType[];
  placeholder?: string;
  defaultValue?: OptionType;
  onChange?: (value: OptionType) => void;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  onSearch?: (value: string) => void;
  errorMessage?: string;
}

const AuthSearchSelect: React.FC<AuthSearchSelectProps> = ({
  name,
  label,
  options,
  placeholder,
  defaultValue,
  onChange,
  required = false,
  disabled = false,
  searchable = false,
  onSearch,
  errorMessage,
}) => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const error = errors[name];
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [lastValidValue, setLastValidValue] = useState<OptionType | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Watch for changes in the form value
  const fieldValue = watch(name);

  // Initialize and update display value
  useEffect(() => {
    const currentValue = fieldValue || defaultValue;
    if (currentValue) {
      setDisplayValue(currentValue.label);
      setLastValidValue(currentValue);
    }
  }, [fieldValue, defaultValue]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setDisplayValue(value);
    onSearch?.(value);

    // Keep dropdown open when text changes (including when cleared)
    if (!open) {
      setOpen(true);
    }
  };

  // Handle trigger input focus
  const handleFocus = () => {
    if (!disabled) {
      setOpen(true);
      setInputValue(""); // Clear input when focusing to show all options
    }
  };

  // Handle trigger input blur
  const handleBlur = () => {
    setTimeout(() => {
      if (open) setOpen(false);

      // If input is empty or doesn't match any option, revert to last valid value
      if (!displayValue || !options.some((opt) => opt.label === displayValue)) {
        setDisplayValue(lastValidValue?.label || "");
        setInputValue("");
      }
    }, 200);
  };

  // Auto-focus on input when dropdown opens
  useEffect(() => {
    if (open && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, searchable]);

  const [dropUp, setDropUp] = useState(false);

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 260;

      if (spaceBelow < dropdownHeight) setDropUp(true);
      else setDropUp(false);
    }
  }, [open]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  // Filtered options based on search
  const filteredOptions = options?.filter((option) =>
    !inputValue
      ? true
      : option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Select an option
  const selectOption = (option: OptionType) => {
    onChange?.(option);
    setDisplayValue(option.label);
    setLastValidValue(option);
    setInputValue("");
    setOpen(false);
  };

  return (
    <div className="space-y-2 w-full">
      <label className="block text_highlight-alpha">
        {label}
        {required && <span className="text_highlight-warning-red ml-1">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <div ref={containerRef} className="relative">
            {/* Custom Select Trigger - Input when searchable */}
            {searchable ? (
              <div
                className={cn(
                  "text_highlight-alpha flex items-center w-full h-12 px-4 py-[18px] rounded-lg border font-normal bg-transparent",
                  error || errorMessage
                    ? "border-dark-warning-red focus:ring-dark-warning-red"
                    : open
                    ? "border-dark-emerald-light"
                    : "border-[#CCCCCC]",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full outline-none bg-transparent placeholder:text_highlight-beta text_highlight-alpha font-medium"
                  placeholder={placeholder || "Type to search..."}
                  value={displayValue}
                  onChange={handleSearchChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  disabled={disabled}
                />
                <FaAngleDown
                  className={cn(
                    "text-light-emerald-lighter flex-shrink-0",
                    open && "transform rotate-180"
                  )}
                  size={15}
                  onClick={() => !disabled && setOpen(!open)}
                />
              </div>
            ) : (
              <div
                className={cn(
                  "text_highlight-alpha flex justify-between items-center w-full h-12 px-4 py-[18px] rounded-lg border font-normal bg-transparent cursor-pointer",
                  error || errorMessage
                    ? "border-dark-warning-red focus:ring-dark-warning-red"
                    : " border-[#CCCCCC]",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !disabled && setOpen(!open)}
              >
                <div className="truncate">
                  {field.value?.label ||
                    defaultValue?.label ||
                    placeholder ||
                    "Select an option"}
                </div>
                <FaAngleDown
                  className={cn(
                    "text-light-emerald-lighter",
                    open && "transform rotate-180"
                  )}
                  size={15}
                />
              </div>
            )}

            {/* Custom Dropdown - Always show when open */}
            {open && (
              <div
                ref={dropdownRef}
                className={cn(
                  "absolute z-50 w-full mt-1 bg-dark-emerald-darker text_highlight-alpha border-dark-stroke-beta rounded-md max-h-72 overflow-auto",
                  dropUp ? "bottom-full mb-1" : "slide-in-from-bottom-full mt-1"
                )}
              >
                {/* Options List - Show all when input is empty */}
                <div>
                  {filteredOptions?.length > 0 ? (
                    filteredOptions?.map((option) => (
                      <div
                        key={option.value}
                        className="px-4 py-1.5 cursor-pointer hover:bg-dark-emerald-dark "
                        onClick={() => {
                          field.onChange(option);
                          selectOption(option);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {option.label}
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-center text_highlight-beta">
                      No options available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {(error || errorMessage) && (
              <p className="text_highlight-warning-red mt-1 text-sm">
                {error?.message?.toString() || errorMessage}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default AuthSearchSelect;
