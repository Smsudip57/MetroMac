"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";

type SearchFieldProps = {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  iconSize?: number;
  autoFocus?: boolean;
  disabled?: boolean;
};

const defaultFormClass =
  "relative 2xl:w-[400px] xl:w-[320px] lg:w-[280px] w-[240px] hidden md:block group pr-4";
const defaultInputClass =
  "w-full h-9 pl-4 pr-12 border border-none bg-bg_shade rounded-lg text-sm font-normal text-text_highlight placeholder:text-text focus:outline-none";
const defaultIconClass =
  "absolute cursor-pointer right-6 top-1/2 transform -translate-y-1/2 text-text hover:text-primary hover:bg-bg_shade transition-all duration-200 p-1 rounded-md group-hover:text-primary";

export default function SearchField({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  placeholder = "Search",
  className = "",
  inputClassName = "",
  iconClassName = "",
  iconSize = 24,
  autoFocus = false,
  disabled = false,
}: SearchFieldProps) {
  return (
    <form
      className={`${defaultFormClass} ${className}`}
      onSubmit={onSubmit}
      autoComplete="off"
    >
      <Input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`${defaultInputClass} ${inputClassName}`}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      <Search
        className={`${defaultIconClass} ${iconClassName}`}
        size={iconSize}
      />
    </form>
  );
}
