import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import FieldWrapper, { FieldLabel, fieldContainerStyles } from "../WithHookForm/FieldWrapper";

interface FormSelectProps {
  // name: string;
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  onSearch?: (value: string) => void;
  triggerClassName?: string;
  labelClassName?: string;
  optionsClassName?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  // name,
  label,
  options,
  value,
  placeholder,
  defaultValue,
  onChange,
  required = false,
  disabled = false,
  searchable = false,
  onSearch,
  triggerClassName,
  labelClassName,
  optionsClassName,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(defaultValue || "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch?.(value);
  };

  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange?.(newValue);
    setOpen(false);
    setInputValue("");
  };

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (open && searchable && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open, searchable]);

  return (
    <FieldWrapper>
      {label && (
        <FieldLabel required={required}>
          {label}
        </FieldLabel>
      )}
      <Select
        open={open}
        onOpenChange={setOpen}
        onValueChange={handleValueChange}
        value={selectedValue}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            fieldContainerStyles,
            "border-border focus:border-primary",
            disabled && "opacity-50 cursor-not-allowed",
            triggerClassName
          )}
        >
          {selectedValue ? (
            <SelectValue
              placeholder={placeholder}
              className="text-text"
            />
          ) : (
            <SelectValue
              placeholder={placeholder}
              className="text-text_highlight/60"
            />
          )}
        </SelectTrigger>
        <SelectContent className="bg-bg border border-border rounded-lg shadow-lg z-[999999999] ">
          {searchable && (
            <div
              className="px-2 py-1 border-b border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                className="w-full outline-none bg-transparent text-text placeholder:text-text_highlight/60 md:text-sm text-xs"
                placeholder="Search..."
                value={inputValue}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={cn(
                "cursor-pointer text-text font-medium hover:bg-primary/10 md:text-sm text-xs rounded-lg px-2",
                optionsClassName
              )}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
};

export default FormSelect;
