"use client";
import { cn } from "@/lib/utils";
import {
  fieldContainerStyles,
  contentContainerStyles,
  FieldLabel,
} from "./FieldWrapper";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaAngleDown } from "react-icons/fa6";

interface OptionType {
  value: string;
  label: string;
  image?: string;
}

interface SearchSelectHFProps {
  name: string;
  label?: string;
  labelClassName?: string;
  options?: OptionType[];
  placeholder?: string;
  triggerClassName?: string;
  defaultValue?: OptionType | OptionType[];
  value?: OptionType | OptionType[];
  onChange?: (value: OptionType | OptionType[]) => void;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  onSearch?: (value: string) => void;
  errorMessage?: string;
  // New props for auto data fetching
  onScrollLoadMore?: boolean;
  rtkQueryHook?: (params: any) => any;
  mapOption?: (item: any) => OptionType;
  limit?: number;
  defaultParams?: Record<string, any>;
  multiselect?: boolean;
}

const SearchSelectHF: React.FC<SearchSelectHFProps> = ({
  name,
  label,
  labelClassName,
  options: optionsProp,
  placeholder,
  triggerClassName,
  defaultValue,
  value,
  onChange,
  required = false,
  disabled = false,
  searchable = false,
  onSearch,
  errorMessage,
  onScrollLoadMore = false,
  rtkQueryHook,
  mapOption,
  limit = 10,
  defaultParams = {},
  multiselect = false,
}) => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext();
  const error = errors[name];

  const [open, setOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const [lastValidValue, setLastValidValue] = useState<
    OptionType | OptionType[] | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track last processed data to prevent re-processing the same data
  const lastProcessedDataRef = useRef<any>(null);

  // Track if a page request is in flight to prevent rapid page increments
  const pageInFlightRef = useRef<number | null>(null);

  // For auto data fetching
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<OptionType[]>(optionsProp || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Watch for changes in the form value
  const fieldValue = watch(name);

  // If using auto data fetching, run the RTK Query hook
  const rtkResult =
    onScrollLoadMore && rtkQueryHook
      ? rtkQueryHook({ ...defaultParams, search: searchTerm, limit, page })
      : null;

  // When using auto data fetching, update options from RTK Query
  useEffect(() => {
    if (onScrollLoadMore && rtkResult && rtkResult.data?.data) {
      // Early return: skip if this exact data object was already processed
      if (lastProcessedDataRef.current === rtkResult.data?.data) {
        return;
      }

      // Update the ref to track this data
      lastProcessedDataRef.current = rtkResult.data?.data;

      setIsLoading(rtkResult.isFetching || false);
      const dataArr = rtkResult.data?.data || [];
      const mapped = mapOption ? dataArr.map(mapOption) : dataArr;

      if (page === 1) {
        setOptions(mapped);
      } else {
        setOptions((prev) => [...prev, ...mapped]);
      }
      setHasMore(rtkResult.data?.pagination?.hasNext || false);

      // Clear the in-flight tracker when data arrives
      pageInFlightRef.current = null;
    }
  }, [rtkResult?.data, page, onScrollLoadMore, mapOption, searchTerm]);

  // Reset page/options on search term change (auto data fetching)
  useEffect(() => {
    if (onScrollLoadMore) {
      setPage(1);
      // Clear last processed data when search changes to allow fresh fetch
      lastProcessedDataRef.current = null;
    }
  }, [searchTerm, onScrollLoadMore]);

  // If not using auto data fetching, update options from prop
  useEffect(() => {
    if (!onScrollLoadMore && optionsProp) {
      setOptions(optionsProp);
    }
  }, [optionsProp, onScrollLoadMore]);

  // Initialize and update display value
  useEffect(() => {
    const currentValue = fieldValue || value || defaultValue;
    if (multiselect) {
      const arr = Array.isArray(currentValue) ? currentValue : [];
      setDisplayValue(arr.map((v) => v.label).join(", "));
      setLastValidValue(arr);
    } else if (currentValue) {
      setDisplayValue(currentValue.label);
      setLastValidValue(currentValue);
    }
  }, [fieldValue, value, defaultValue, multiselect]);

  // Handle search input change

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);
    if (onScrollLoadMore) {
      setSearchTerm(value);
      setPage(1);
    } else {
      onSearch?.(value);
    }
    // Keep dropdown open when text changes (including when cleared)
    if (!open) setOpen(true);
  };

  // Handle trigger input focus
  const handleFocus = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  // Handle trigger input blur
  const handleBlur = () => {
    setTimeout(() => {
      if (open) setOpen(false);

      // If input is empty or doesn't match any option, revert to last valid value
      if (!displayValue || !options.some((opt) => opt.label === displayValue)) {
        if (Array.isArray(lastValidValue)) {
          setDisplayValue(lastValidValue.map((v) => v.label).join(", "));
        } else {
          setDisplayValue(lastValidValue?.label || "");
        }
      }
    }, 200);
  };

  // Auto-focus on input when dropdown opens
  useEffect(() => {
    if (open && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, searchable]);

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

  // Select an option (single or multi)
  const selectOption = (option: OptionType) => {
    if (multiselect) {
      const arr = Array.isArray(fieldValue) ? [...fieldValue] : [];
      const exists = arr.find((v) => v.value === option.value);
      let newArr;
      if (exists) {
        newArr = arr.filter((v) => v.value !== option.value);
      } else {
        newArr = [...arr, option];
      }
      onChange?.(newArr);
      setDisplayValue(newArr.map((v) => v.label).join(", "));
      setLastValidValue(newArr);
      // Do NOT close dropdown
    } else {
      onChange?.(option);
      setDisplayValue(option.label);
      setLastValidValue(option);
      setOpen(false);
    }
  };

  // Handle scroll to load more data

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold
    if (onScrollLoadMore) {
      // Prevent multiple rapid page increments
      if (
        isNearBottom &&
        hasMore &&
        !isLoading &&
        pageInFlightRef.current === null
      ) {
        pageInFlightRef.current = page + 1;
        setPage((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <FieldLabel
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
        defaultValue={defaultValue}
        render={({ field }) => (
          <div ref={containerRef} className="relative">
            {/* Custom Select Trigger - Input when searchable */}
            {searchable ? (
              <div
                className={cn(
                  fieldContainerStyles,
                  "flex items-center",
                  error || errorMessage
                    ? "border-warning focus:ring-warning"
                    : "border-border",
                  disabled && "opacity-50 cursor-not-allowed",
                  triggerClassName,
                )}
              >
                {/* Show chips for multiselect, else image+label */}
                {multiselect ? (
                  <div className="flex flex-wrap gap-1 items-center min-h-[24px]">
                    {Array.isArray(field.value) && field.value.length > 0 ? (
                      field.value.map((opt: OptionType) => (
                        <span
                          key={opt.value}
                          className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs flex items-center"
                        >
                          {opt.image && (
                            <Image
                              src={opt.image}
                              width={16}
                              height={16}
                              alt={opt.label}
                              className="inline-block mr-1"
                            />
                          )}
                          {opt.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-text_highlight/80">
                        {placeholder || "Type to search..."}
                      </span>
                    )}
                  </div>
                ) : (
                  field.value?.image &&
                  field.value.label && (
                    <Image
                      src={field.value.image || ""}
                      width={22}
                      height={20}
                      alt={field.value.label}
                      className="inline-block mr-2"
                    />
                  )
                )}
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full outline-none bg-transparent placeholder:text-text_highlight/80 text-text font-medium"
                  placeholder={placeholder || "Type to search..."}
                  value={displayValue}
                  onChange={handleSearchChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  disabled={disabled}
                />
                <FaAngleDown
                  className={cn(
                    "text-text flex-shrink-0",
                    open && "transform rotate-180",
                  )}
                  size={15}
                  onClick={() => !disabled && setOpen(!open)}
                />
              </div>
            ) : (
              <div
                className={cn(
                  fieldContainerStyles,
                  "justify-between cursor-pointer",
                  error || errorMessage
                    ? "border-warning focus:ring-warning"
                    : "border-border",
                  disabled && "opacity-50 cursor-not-allowed",
                  triggerClassName,
                )}
                onClick={() => !disabled && setOpen(!open)}
              >
                <div className="truncate flex items-center">
                  {multiselect ? (
                    Array.isArray(field.value) && field.value.length > 0 ? (
                      field.value.map((opt: OptionType) => (
                        <span
                          key={opt.value}
                          className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs flex items-center mr-1"
                        >
                          {opt.image && (
                            <Image
                              src={opt.image}
                              width={16}
                              height={16}
                              alt={opt.label}
                              className="inline-block mr-1"
                            />
                          )}
                          {opt.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-text_highlight/80">
                        {placeholder || "Select an option"}
                      </span>
                    )
                  ) : (
                    field.value?.image && (
                      <Image
                        src={field.value.image || ""}
                        width={22}
                        height={20}
                        alt={field.value.label}
                        className="inline-block mr-2"
                      />
                    )
                  )}
                  {!multiselect &&
                    ((!Array.isArray(field.value) &&
                      (field.value?.label ||
                        (!Array.isArray(defaultValue) &&
                          defaultValue?.label))) || (
                      <span className="text-text_highlight/80">
                        {placeholder || "Select an option"}
                      </span>
                    ))}
                </div>
                <FaAngleDown
                  className={cn("text-text", open && "transform rotate-180")}
                  size={15}
                />
              </div>
            )}

            {/* Custom Dropdown - Always show when open */}
            {open && (
              <div
                ref={dropdownRef}
                className={cn(
                  contentContainerStyles,
                  "absolute w-full mt-1 min-w-[200px] max-h-80 overflow-auto",
                )}
                onScroll={handleScroll}
              >
                {/* Options List */}
                <div>
                  {options?.length > 0 ? (
                    <div className="p-1">
                      {options?.map((option) => {
                        const isSelected = multiselect
                          ? Array.isArray(field.value) &&
                            field.value.some(
                              (v: OptionType) => v.value === option.value,
                            )
                          : field.value?.value === option.value;
                        return (
                          <div
                            key={option.value}
                            className={cn(
                              "px-2 py-1.5 md:text-sm text-xs cursor-pointer text-text flex items-center !rounded-lg hover:bg-primary/10",
                              isSelected && "bg-primary/10",
                            )}
                            style={{ transition: "background 0.15s" }}
                            onClick={() => {
                              selectOption(option);
                              if (!multiselect) field.onChange(option);
                              else
                                field.onChange(
                                  Array.isArray(field.value)
                                    ? field.value.some(
                                        (v: OptionType) =>
                                          v.value === option.value,
                                      )
                                      ? field.value.filter(
                                          (v: OptionType) =>
                                            v.value !== option.value,
                                        )
                                      : [...field.value, option]
                                    : [option],
                                );
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {multiselect && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="mr-2 accent-primary"
                                tabIndex={-1}
                              />
                            )}
                            {option?.image && (
                              <Image
                                src={option.image || ""}
                                width={22}
                                height={20}
                                alt={option.label}
                                className="inline-block mr-2"
                              />
                            )}
                            <div className="flex items-center ml-2 font-normal">
                              {option.label}
                            </div>
                          </div>
                        );
                      })}
                      {/* Loading indicator */}
                      {isLoading && (
                        <div className="p-1 text-center text-text_highlight text-[11px] opacity-60 border-t border-border/30  mt-1">
                          <div className="flex items-center justify-center">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              <div
                                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-primary rounded-full animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* End of results indicator */}
                      {!hasMore && options.length > 0 && !isLoading && (
                        <div className="p-1 text-center text-text_highlight text-[11px] opacity-60 border-t border-border/30 mt-0.5">
                          No more options
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2 text-center text-text_highlight md:text-sm text-xs">
                      {isLoading ? (
                        <div className="flex items-center justify-center mt-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        "No options available"
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {(error || errorMessage) && (
              <p className="text-warning md:text-sm text-xs mt-1">
                {Array.isArray(error) &&
                  !error?.[0]?.toLowerCase().includes("required") &&
                  !error?.[0]?.toLowerCase().includes("null") &&
                  error?.[0]}
                {!Array.isArray(error) && error?.message}
                {errorMessage}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default SearchSelectHF;
