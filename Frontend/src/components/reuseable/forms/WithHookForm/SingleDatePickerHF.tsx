"use client";

import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import SingleDatePicker from "../WithoutHookForm/SingleDatePicker";
import { fieldContainerStyles, contentContainerStyles } from "./FieldWrapper";

interface SingleDatePickerHFProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disablePrevious?: boolean;
  disableNext?: boolean;
  className?: string;
  position?: "start" | "end";
  triggerClassName?: string;
  contentClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
  withTime?: boolean;
  localDateWithoutTime?: boolean; // When true, converts local date to ISO string (e.g., "2026-02-27" from Dubai → "2026-02-26T20:00:00Z")
}

const SingleDatePickerHF: React.FC<SingleDatePickerHFProps> = ({
  name,
  label,
  placeholder = "Select a date",
  required = false,
  disablePrevious = false,
  disableNext = false,
  position = "start",
  triggerClassName,
  contentClassName,
  labelClassName,
  disabled = false,
  withTime = false,
  localDateWithoutTime = false,
}) => {
  const { control } = useFormContext();

  // Helper function to convert ISO UTC string to local date for display
  const convertUTCToLocalDate = (isoString: string): Date | null => {
    if (!isoString) return null;

    // Parse the ISO UTC string
    const utcDate = new Date(isoString);

    // Extract the LOCAL date components (not UTC!)
    // This accounts for the timezone offset
    const year = utcDate.getFullYear();
    const month = utcDate.getMonth();
    const day = utcDate.getDate();

    // Create a new Date at local noon with the local date
    // This ensures SingleDatePicker displays the correct local date
    return new Date(year, month, day, 12, 0, 0);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Convert string date to Date object for SingleDatePicker
        const dateValue = field.value
          ? localDateWithoutTime
            ? convertUTCToLocalDate(field.value)
            : new Date(field.value)
          : null;

        // Handle onChange to convert Date back to string format for form
        const handleDateChange = (date: Date | null) => {
          if (date) {
            let formattedDate: string;

            if (localDateWithoutTime) {
              // When localDateWithoutTime is true:
              // Treat the selected date as a local date (e.g., "2026-02-27" from Dubai)
              // and convert it to ISO format in UTC
              // Example: User in Dubai selects "2026-02-27"
              // → This is 2026-02-27 00:00:00 Dubai time (UTC+4)
              // → Converts to ISO: 2026-02-26T20:00:00Z (UTC)
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              const localDateString = `${year}-${month}-${day}T00:00:00`;
              formattedDate = new Date(localDateString).toISOString();
            } else {
              // Helper to format date components with padding
              const getDateParts = (useUTC: boolean) => {
                const y = useUTC ? date.getUTCFullYear() : date.getFullYear();
                const m = String((useUTC ? date.getUTCMonth() : date.getMonth()) + 1).padStart(2, "0");
                const d = String(useUTC ? date.getUTCDate() : date.getDate()).padStart(2, "0");
                return { y, m, d };
              };

              const { y, m, d } = getDateParts(true);

              if (withTime) {
                // When withTime is true, use UTC values
                const h = String(date.getUTCHours()).padStart(2, "0");
                const min = String(date.getUTCMinutes()).padStart(2, "0");
                const s = String(date.getUTCSeconds()).padStart(2, "0");
                formattedDate = `${y}-${m}-${d}T${h}:${min}:${s}Z`;
              } else {
                // When both are false, use UTC date values (YYYY-MM-DD format)
                formattedDate = `${y}-${m}-${d}`;
              }
            }

            field.onChange(formattedDate);
          } else {
            field.onChange(null);
          }
        };

        return (
          <SingleDatePicker
            label={label}
            placeholder={placeholder}
            value={dateValue}
            onChange={handleDateChange}
            required={required}
            disablePrevious={disablePrevious}
            disableNext={disableNext}
            error={fieldState.error?.message}
            triggerClassName={
              triggerClassName ||
              fieldContainerStyles +
              "  flex items-center !py-0 justify-between cursor-pointer"
            }
            contentClassName={
              contentClassName ||
              contentContainerStyles + " absolute h-max md:p-3 p-2"
            }
            labelClassName={labelClassName}
            position={position}
            disabled={disabled}
            withTime={withTime}
          />
        );
      }}
    />
  );
};

export default SingleDatePickerHF;
