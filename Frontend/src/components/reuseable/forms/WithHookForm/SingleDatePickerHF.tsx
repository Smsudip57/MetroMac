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
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        // Convert string date to Date object for SingleDatePicker
        const dateValue = field.value ? new Date(field.value) : null;

        // Handle onChange to convert Date back to string format for form
        const handleDateChange = (date: Date | null) => {
          if (date) {
            // Convert to UTC for server/database (stores consistent time regardless of timezone)
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            const hours = String(date.getUTCHours()).padStart(2, "0");
            const minutes = String(date.getUTCMinutes()).padStart(2, "0");
            const seconds = String(date.getUTCSeconds()).padStart(2, "0");

            const formattedDate = withTime
              ? `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z` // ISO 8601 UTC format
              : `${year}-${month}-${day}`; // YYYY-MM-DD
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
