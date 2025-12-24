"use client";

import { dayNames, monthNames } from "@/constants/shared";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { FaAngleLeft, FaAngleRight, FaChevronDown } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FieldLabel } from "../WithHookForm/FieldWrapper";

// Helper function to create a date with time set to noon to avoid timezone issues
const createSafeDateWithoutTime = (
  year: number,
  month: number,
  day: number
): Date => {
  return new Date(year, month, day, 12, 0, 0, 0);
};

// Helper function to normalize date to noon
const normalizeDateToNoon = (date: Date): Date => {
  if (!date) return date;
  return createSafeDateWithoutTime(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

interface DateItem {
  date: Date;
  isCurrentMonth: boolean;
}

interface SingleDatePickerProps {
  // eslint-disable-next-line no-unused-vars
  onChange?: (date: Date | null) => void;
  value?: Date | null;
  position?: "start" | "end";
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
  disablePrevious?: boolean;
  disableNext?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  withTime?: boolean;
}

const SingleDatePicker: React.FC<SingleDatePickerProps> = ({
  onChange,
  value,
  position = "bottom",
  placeholder = "Select a date",
  triggerClassName,
  contentClassName,
  labelClassName,
  disablePrevious = false,
  disableNext = false,
  label,
  required = false,
  error,
  disabled = false,
  withTime = false,
}) => {
  // Normalize today to noon
  const today = normalizeDateToNoon(new Date());

  // States
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [currentMonth, setCurrentMonth] = useState<Date>(value || today);
  const [currentYear, setCurrentYear] = useState<number>(
    (value || today).getFullYear()
  );
  const [isYearView, setIsYearView] = useState<boolean>(false);
  const [isMonthView, setIsMonthView] = useState<boolean>(false);

  // Time states - Convert 24-hour to 12-hour format properly for initial state
  const [selectedHour, setSelectedHour] = useState<number>(() => {
    if (!value) return 12;
    const hour24 = value.getHours();
    if (hour24 === 0) return 12; // 00:xx -> 12 AM
    if (hour24 <= 12) return hour24; // 01:xx-12:xx -> 1-12
    return hour24 - 12; // 13:xx-23:xx -> 1-11 PM
  });
  const [selectedMinute, setSelectedMinute] = useState<number>(
    value ? value.getMinutes() : 0
  );
  const [selectedAmPm, setSelectedAmPm] = useState<"AM" | "PM">(
    value ? (value.getHours() >= 12 ? "PM" : "AM") : "PM"
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [popoverPosition, setPopoverPosition] = useState<"top" | "bottom">(
    "bottom"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Calculate popover position based on available screen space
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const popoverHeight = 280; // Approximate height of the popover
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If there's not enough space below and more space above, show at top
      if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
        setPopoverPosition("top");
      } else {
        setPopoverPosition("bottom");
      }
    }
  }, [isOpen]);

  // Don't sync with value prop changes after initial mount to prevent overriding user selections

  // Get month and year for display
  const monthYear: string = `${
    monthNames[currentMonth.getMonth()]
  } ${currentMonth.getFullYear()}`;

  // Generate calendar grid for days
  const generateCalendarGrid = (): DateItem[][] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Get the number of days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Create grid with weeks
    const grid: DateItem[][] = [];
    let week: DateItem[] = [];
    let dayCounter = 1;

    // Add days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevMonthDay = daysInPrevMonth - firstDayOfMonth + i + 1;
      week.push({
        date: createSafeDateWithoutTime(year, month - 1, prevMonthDay),
        isCurrentMonth: false,
      });
    }

    // Add days from current month
    while (dayCounter <= daysInMonth) {
      week.push({
        date: createSafeDateWithoutTime(year, month, dayCounter),
        isCurrentMonth: true,
      });

      dayCounter++;

      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
    }

    // Add days from next month
    let nextMonthDay = 1;
    while (week.length < 7) {
      week.push({
        date: createSafeDateWithoutTime(year, month + 1, nextMonthDay),
        isCurrentMonth: false,
      });
      nextMonthDay++;
    }

    if (week.length > 0) grid.push(week);

    // Add more weeks if needed to make it 6 rows
    while (grid.length < 6) {
      week = [];
      for (let i = 0; i < 7; i++) {
        week.push({
          date: createSafeDateWithoutTime(year, month + 1, nextMonthDay),
          isCurrentMonth: false,
        });
        nextMonthDay++;
      }
      grid.push(week);
    }

    return grid;
  };

  const calendarGrid = generateCalendarGrid();

  // Check if a month is in the past or future
  const isMonthInPast = (year: number, month: number): boolean => {
    if (disablePrevious) {
      const currentDate = new Date();
      if (year < currentDate.getFullYear()) return true;
      if (year === currentDate.getFullYear() && month < currentDate.getMonth())
        return true;
    }
    return false;
  };

  const isMonthInFuture = (year: number, month: number): boolean => {
    if (disableNext) {
      const currentDate = new Date();
      if (year > currentDate.getFullYear()) return true;
      if (year === currentDate.getFullYear() && month > currentDate.getMonth())
        return true;
    }
    return false;
  };

  // Check if a year is in the past or future
  const isYearInPast = (year: number): boolean => {
    return disablePrevious && year < new Date().getFullYear();
  };

  const isYearInFuture = (year: number): boolean => {
    return disableNext && year > new Date().getFullYear();
  };

  // Navigation methods
  const goToPreviousMonth = (): void => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);

    if (
      disablePrevious &&
      isMonthInPast(prevMonth.getFullYear(), prevMonth.getMonth())
    ) {
      return;
    }

    setCurrentMonth(
      createSafeDateWithoutTime(
        prevMonth.getFullYear(),
        prevMonth.getMonth(),
        1
      )
    );
  };

  const goToNextMonth = (): void => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    if (
      disableNext &&
      isMonthInFuture(nextMonth.getFullYear(), nextMonth.getMonth())
    ) {
      return;
    }

    setCurrentMonth(
      createSafeDateWithoutTime(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        1
      )
    );
  };

  const goToPreviousYear = (): void => {
    if (disablePrevious && isYearInPast(currentYear - 1)) {
      return;
    }
    setCurrentYear(currentYear - 1);
  };

  const goToNextYear = (): void => {
    if (disableNext && isYearInFuture(currentYear + 1)) {
      return;
    }
    setCurrentYear(currentYear + 1);
  };

  // View toggles
  const toggleYearView = (): void => {
    setIsYearView(!isYearView);
    setIsMonthView(false);
  };

  const toggleMonthView = (): void => {
    setIsMonthView(!isMonthView);
    setIsYearView(false);
  };

  // Date utilities
  const isDateBeforeToday = (date: Date): boolean => {
    if (!disablePrevious) return false;

    const todayYMD =
      today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
    const dateYMD =
      date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
    return dateYMD < todayYMD;
  };

  const isDateAfterToday = (date: Date): boolean => {
    if (!disableNext) return false;

    const todayYMD =
      today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
    const dateYMD =
      date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
    return dateYMD > todayYMD;
  };

  const isSelectedDate = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Handlers
  const handleDateClick = (date: Date): void => {
    if (isDateBeforeToday(date) || isDateAfterToday(date)) return;

    let finalDate: Date;
    if (withTime) {
      const hour24 =
        selectedAmPm === "AM"
          ? selectedHour === 12
            ? 0
            : selectedHour
          : selectedHour === 12
          ? 12
          : selectedHour + 12;
      finalDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour24,
        selectedMinute,
        0,
        0
      );
    } else {
      finalDate = normalizeDateToNoon(date);
    }

    setSelectedDate(finalDate);
    onChange?.(finalDate);

    if (!withTime) {
      setIsOpen(false);
    }
  };

  const handleMonthClick = (monthIndex: number): void => {
    if (
      isMonthInPast(currentYear, monthIndex) ||
      isMonthInFuture(currentYear, monthIndex)
    ) {
      return;
    }

    setCurrentMonth(createSafeDateWithoutTime(currentYear, monthIndex, 1));
    setIsMonthView(false);
  };

  const handleYearClick = (year: number): void => {
    if (isYearInPast(year) || isYearInFuture(year)) {
      return;
    }

    setCurrentYear(year);
    setIsYearView(false);

    // Update the current month with the selected year
    setCurrentMonth(
      createSafeDateWithoutTime(year, currentMonth.getMonth(), 1)
    );

    // Show month view after selecting a year for better UX flow
    setIsMonthView(true);
  };

  // Time handlers
  const handleTimeChange = (
    hour?: number,
    minute?: number,
    ampm?: "AM" | "PM"
  ): void => {
    if (!selectedDate) return;

    const hourToUse = hour !== undefined ? hour : selectedHour;
    const minuteToUse = minute !== undefined ? minute : selectedMinute;
    const ampmToUse = ampm !== undefined ? ampm : selectedAmPm;

    const hour24 =
      ampmToUse === "AM"
        ? hourToUse === 12
          ? 0
          : hourToUse
        : hourToUse === 12
        ? 12
        : hourToUse + 12;

    const newDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hour24,
      minuteToUse,
      0,
      0
    );

    setSelectedDate(newDate);
    onChange?.(newDate);
  };

  const handleHourChange = (hour: number): void => {
    setSelectedHour(hour);
    // Call handleTimeChange immediately with the new hour
    handleTimeChange(hour, selectedMinute, selectedAmPm);
  };

  const handleMinuteChange = (minute: number): void => {
    setSelectedMinute(minute);
    // Call handleTimeChange immediately with the new minute
    handleTimeChange(selectedHour, minute, selectedAmPm);
  };

  const handleAmPmChange = (ampm: "AM" | "PM"): void => {
    setSelectedAmPm(ampm);
    // Call handleTimeChange immediately with the new ampm
    handleTimeChange(selectedHour, selectedMinute, ampm);
  };

  // Generate years for year view (12 years before and after current)
  const generateYearRange = (): number[] => {
    const years = [];
    const startYear = currentYear - 12;
    for (let i = 0; i < 24; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  // Render time picker
  const renderTimePicker = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
      <div className="flex gap-2 border-l border-border pl-2 ml-2 max-h-[265px]">
        {/* Hour Picker */}
        <div className="w-12  flex flex-col">
          <div className="text-xs text-text_highlight text-center mb-1">
            Hour
          </div>
          <div className="flex-1 overflow-y-auto border border-border rounded no_scrollbar">
            {hours.map((hour) => (
              <button
                key={hour}
                type="button"
                onClick={() => handleHourChange(hour)}
                className={cn(
                  "w-full h-6 text-xs flex items-center justify-center hover:bg-primary/10",
                  selectedHour === hour ? "bg-primary text-white" : "text-text"
                )}
              >
                {hour.toString().padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        {/* Minute Picker */}
        <div className="w-12 h-full flex flex-col">
          <div className="text-xs text-text_highlight text-center mb-1">
            Min
          </div>
          <div className="flex-1 overflow-y-auto border border-border rounded no_scrollbar">
            {minutes.map((minute) => (
              <button
                key={minute}
                type="button"
                onClick={() => handleMinuteChange(minute)}
                className={cn(
                  "w-full h-6 text-xs flex items-center justify-center hover:bg-primary/10",
                  selectedMinute === minute
                    ? "bg-primary text-white"
                    : "text-text"
                )}
              >
                {minute.toString().padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        {/* AM/PM Picker */}
      </div>
    );
  };

  // Render month selector
  const renderMonthSelector = () => {
    return (
      <div className="aspect-square">
        <div className="flex justify-between items-center mb-3">
          <button
            type="button"
            onClick={goToPreviousYear}
            disabled={disablePrevious && isYearInPast(currentYear - 1)}
            className={cn(
              "md:size-8 size-7 flex items-center justify-center text-white bg-primary rounded-full",
              disablePrevious &&
                isYearInPast(currentYear - 1) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            <FaAngleLeft size={14} />
          </button>
          <div
            className="font-bold text-sm text-text text-center flex items-center justify-center gap-1 cursor-pointer"
            onClick={toggleYearView}
          >
            {currentYear}{" "}
            <FaChevronDown className="ml-1 font-medium" size={12} />
          </div>
          <button
            type="button"
            onClick={goToNextYear}
            disabled={disableNext && isYearInFuture(currentYear + 1)}
            className={cn(
              "md:size-8 size-7 flex items-center justify-center text-white bg-primary rounded-full",
              disableNext &&
                isYearInFuture(currentYear + 1) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            <FaAngleRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-y-2 mt-6">
          {monthNames.map((month, index) => {
            const isCurrentMonthSelected =
              currentMonth.getMonth() === index &&
              currentMonth.getFullYear() === currentYear;

            const isDisabled =
              (disablePrevious && isMonthInPast(currentYear, index)) ||
              (disableNext && isMonthInFuture(currentYear, index));

            return (
              <div key={month} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => handleMonthClick(index)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full h-7 flex items-center justify-center text-xs rounded-full transition-colors text-text font-semibold hover:bg-primary hover:text-white",
                    isCurrentMonthSelected
                      ? "bg-primary border-primary/20 border text-white hover:bg-primary rounded-full"
                      : "",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {month.substring(0, 3)}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render year selector
  const renderYearSelector = () => {
    const years = generateYearRange();

    return (
      <div className="aspect-square">
        <div className="flex justify-between items-center mb-3">
          <button
            type="button"
            onClick={() => setCurrentYear(currentYear - 20)}
            disabled={disablePrevious && isYearInPast(currentYear - 20)}
            className={cn(
              "md:size-8 size-7 flex items-center justify-center text-white bg-primary rounded-full",
              disablePrevious &&
                isYearInPast(currentYear - 20) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            <FaAngleLeft size={14} />
          </button>
          <div className="font-bold text-sm text-text text-center flex items-center justify-center gap-1">
            {years[0]} - {years[years.length - 1]}
          </div>
          <button
            type="button"
            onClick={() => setCurrentYear(currentYear + 20)}
            disabled={disableNext && isYearInFuture(currentYear + 20)}
            className={cn(
              "md:size-8 size-7 flex items-center justify-center text-white bg-primary rounded-full",
              disableNext &&
                isYearInFuture(currentYear + 20) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            <FaAngleRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-4 max-h-[200px] overflow-y-auto no_scrollbar">
          {years.map((year) => {
            const isSelected = currentYear === year;
            const isDisabled =
              (disablePrevious && isYearInPast(year)) ||
              (disableNext && isYearInFuture(year));

            return (
              <div key={year} className="flex justify-center py-0.5">
                <button
                  type="button"
                  onClick={() => handleYearClick(year)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full h-7 flex items-center justify-center text-xs rounded-full transition-colors text-text font-semibold hover:bg-primary hover:text-white",
                    isSelected
                      ? "bg-primary border-primary/20 border text-white hover:bg-primary rounded-full"
                      : "",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {year}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render day calendar
  const renderDayCalendar = () => {
    return (
      <div className="">
        <div className="flex justify-between items-center mb-3">
          <button
            type="button"
            onClick={goToPreviousMonth}
            disabled={
              disablePrevious &&
              isMonthInPast(
                currentMonth.getMonth() === 0
                  ? currentMonth.getFullYear() - 1
                  : currentMonth.getFullYear(),
                currentMonth.getMonth() === 0 ? 11 : currentMonth.getMonth() - 1
              )
            }
            className={cn(
              "md:size-8 size-7 flex items-center justify-center text-white bg-primary rounded-full ",
              disablePrevious &&
                isMonthInPast(
                  currentMonth.getMonth() === 0
                    ? currentMonth.getFullYear() - 1
                    : currentMonth.getFullYear(),
                  currentMonth.getMonth() === 0
                    ? 11
                    : currentMonth.getMonth() - 1
                ) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronLeft size={14} />
          </button>
          <div
            className="font-bold text-sm cursor-pointer flex items-center space-x-2"
            onClick={toggleMonthView}
          >
            <span>{monthYear}</span>{" "}
            <FaChevronDown className="ml-1 font-medium" size={12} />
          </div>
          <button
            type="button"
            onClick={goToNextMonth}
            disabled={
              disableNext &&
              isMonthInFuture(
                currentMonth.getMonth() === 11
                  ? currentMonth.getFullYear() + 1
                  : currentMonth.getFullYear(),
                currentMonth.getMonth() === 11 ? 0 : currentMonth.getMonth() + 1
              )
            }
            className={cn(
              "md:size-8 size-7 flex items-center justify-center text-white bg-primary rounded-full",
              disableNext &&
                isMonthInFuture(
                  currentMonth.getMonth() === 11
                    ? currentMonth.getFullYear() + 1
                    : currentMonth.getFullYear(),
                  currentMonth.getMonth() === 11
                    ? 0
                    : currentMonth.getMonth() + 1
                ) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 text-xs mb-1">
          {calendarGrid.map((week, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {week.map((day, colIndex) => (
                <div key={colIndex} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      day.isCurrentMonth && handleDateClick(day.date)
                    }
                    disabled={
                      !day.isCurrentMonth ||
                      isDateBeforeToday(day.date) ||
                      isDateAfterToday(day.date)
                    }
                    className={cn(
                      "md:h-8 h-7 w-full rounded-full flex items-center justify-center text-text font-semibold border border-transparent",
                      !day.isCurrentMonth
                        ? "opacity-0 cursor-default"
                        : isDateBeforeToday(day.date) ||
                          isDateAfterToday(day.date)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:border-primary hover:bg-white",
                      isSelectedDate(day.date)
                        ? "bg-primary border-primary text-white hover:bg-primary"
                        : ""
                    )}
                  >
                    {day.date.getDate()}
                  </button>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <FieldLabel required={required} className={labelClassName}>
        {label}
      </FieldLabel>

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          triggerClassName ||
            "flex items-center pl-3 pr-1 md:text-sm text-xs justify-between w-full h-12 border rounded-lg focus:outline-none cursor-pointer",
          error && !triggerClassName
            ? "border-warning"
            : !triggerClassName && "border-border",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {selectedDate ? (
          <p className="text-text font-semibold line-clamp-1">
            {withTime
              ? `${format(
                  selectedDate,
                  "do MMM, yyyy"
                )} at ${selectedHour}:${selectedMinute
                  .toString()
                  .padStart(2, "0")} ${selectedAmPm}`
              : format(selectedDate, "do MMM, yyyy")}
          </p>
        ) : (
          <p className="text-text_highlight">{placeholder}</p>
        )}

        <IoCalendarOutline
          className="md:ml-2 ml-1 font-medium text-primary md:mr-1.5 mr-1"
          size={16}
        />
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className={cn(
            contentClassName ||
              "absolute z-[999] shadow-lg bg-white rounded-lg border border-border h-max",
            withTime ? "md:w-[400px] w-[360px]" : "md:w-[260px] w-[260px]",
            "md:p-3 p-2",
            isOpen ? "animate-fadeIn" : "animate-fadeOut",
            popoverPosition === "top" ? "mb-1" : "mt-1"
          )}
          style={{
            [position === "end" ? "right" : "left"]: 0,
            [popoverPosition === "top" ? "bottom" : "top"]: "100%",
          }}
        >
          <div className={cn("flex !h-[260px]", withTime && "")}>
            <div className="flex-1 h-max">
              {isYearView
                ? renderYearSelector()
                : isMonthView
                ? renderMonthSelector()
                : renderDayCalendar()}
            </div>
            {withTime && renderTimePicker()}
          </div>

          {withTime && selectedDate && (
            <div className="mt-3 pt-2 border-t border-border">
              <div className="flex justify-between items-center">
                <span></span>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-text_highlight">
                    {selectedHour}:{selectedMinute.toString().padStart(2, "0")}
                  </div>
                  <div className="">
                    <div className="flex gap-1">
                      {["AM", "PM"].map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() =>
                            handleAmPmChange(period as "AM" | "PM")
                          }
                          className={cn(
                            "h-6 text-xs flex items-center justify-center rounded-full border border-border hover:bg-primary/10 px-2",
                            selectedAmPm === period
                              ? "bg-primary text-white border-primary"
                              : "text-text"
                          )}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1 text-xs bg-primary text-white rounded-full hover:bg-primary/90"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-warning md:text-sm text-xs mt-1">{error}</p>}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-5px);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out forwards;
        }
        .animate-fadeOut {
          animation: fadeOut 0.15s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SingleDatePicker;
