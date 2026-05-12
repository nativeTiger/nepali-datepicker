import * as React from "react";
import NepaliDate from "nepali-date-converter";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../lib/utils";
import { NepaliCalendar } from "./calendar";
import type { NepaliCalendarProps, NepaliDateRange } from "./calendar";
import { TimePicker } from "./time-picker";
import type { TimeValue } from "./time-picker";
import { formatNepaliDate, formatTime } from "../lib/date-utils";
import { NEPALI_MONTHS } from "../data/calendar-data";

export type { NepaliDateRange, TimeValue };
export type { NepaliCalendarProps };
export type { CaptionLayout, Matcher } from "../types";

export type TimeRangeValue = {
  start: TimeValue;
  end: TimeValue;
};

// ─── Display helpers ──────────────────────────────────────────────────────────

function longDate(date: NepaliDate): string {
  return `${NEPALI_MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getYear()}`;
}

function shortDate(date: NepaliDate): string {
  return formatNepaliDate(date);
}

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * Props for `<NepaliDatePicker>`.
 */
interface NepaliDatePickerProps
  extends Omit<
    NepaliCalendarProps,
    "selected" | "onSelect" | "month" | "onMonthChange" | "disabled"
  > {
  /** Controlled selection value. Pass `undefined` to clear. */
  value?: NepaliDate | NepaliDateRange;
  /** Called when the selection changes. Receives `undefined` when cleared. */
  onChange?: (date: NepaliDate | NepaliDateRange | undefined) => void;
  /**
   * Render a `<TimePicker>` below the calendar.
   * Time state is managed internally when `timeValue` is not provided.
   * @default false
   */
  showTimePicker?: boolean;
  /** Controlled time value. When omitted, internal state is used. */
  timeValue?: TimeValue | TimeRangeValue;
  /** Called on every time change in both controlled and uncontrolled modes. */
  onTimeChange?: (time: TimeValue | TimeRangeValue) => void;
  /** Placeholder shown in the trigger when nothing is selected. */
  placeholder?: string;
  /** Disables the trigger button entirely. @default false */
  disabled?: boolean;
  /** Show an ✕ clear button when a value is set. @default false */
  clearable?: boolean;
  /**
   * How the selected date is displayed in the trigger.
   * - `"short"` → `2082-1-1`
   * - `"long"` → `Baishakh 1, 2082`
   * @default "long"
   */
  displayFormat?: "short" | "long";
  /** Popover alignment relative to the trigger. @default "start" */
  align?: "start" | "center" | "end";
  /** Extra CSS classes for the outer wrapper `<div>`. */
  className?: string;
  /** Extra CSS classes for the trigger `<Button>`. */
  triggerClassName?: string;
  /** Disable specific calendar dates (passed to `<NepaliCalendar>`). */
  disabledDates?: NepaliCalendarProps["disabled"];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A fully-featured Nepali (Bikram Sambat) date / date-range picker.
 *
 * @example
 * const [date, setDate] = useState<NepaliDate>();
 * <NepaliDatePicker value={date} onChange={(d) => setDate(d as NepaliDate)} />
 *
 * @example
 * <NepaliDatePicker
 *   mode="range"
 *   value={range}
 *   onChange={(d) => setRange(d as NepaliDateRange)}
 *   numberOfMonths={2}
 *   captionLayout="dropdown"
 *   clearable
 * />
 */
export function NepaliDatePicker({
  value,
  onChange,
  showTimePicker = false,
  timeValue,
  onTimeChange,
  placeholder,
  disabled = false,
  clearable = false,
  displayFormat = "long",
  align = "start",
  className,
  triggerClassName,
  disabledDates,
  mode = "single",
  numberOfMonths = 1,
  fromDate,
  toDate,
  captionLayout = "label",
  fixedWeeks = false,
  footer,
  locale = "en",
  showOutsideDays,
  defaultMonth,
}: NepaliDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const fmt = displayFormat === "long" ? longDate : shortDate;

  // Internal time state — used when timeValue prop is not provided (uncontrolled)
  const [internalTime, setInternalTime] = React.useState<TimeValue | TimeRangeValue>(() =>
    mode === "range"
      ? { start: { hours: 0, minutes: 0 }, end: { hours: 0, minutes: 0 } }
      : { hours: 0, minutes: 0 },
  );

  const effectiveTimeValue = timeValue ?? internalTime;

  const handleTimeChange = React.useCallback(
    (t: TimeValue | TimeRangeValue) => {
      if (timeValue === undefined) setInternalTime(t);
      onTimeChange?.(t);
    },
    [timeValue, onTimeChange],
  );

  const triggerLabel = React.useMemo(() => {
    if (!value) return null;
    if (mode === "range") {
      const range = value as NepaliDateRange;
      if (!range.from) return null;
      const tv = effectiveTimeValue as TimeRangeValue;
      const startTime = showTimePicker && tv?.start ? ` ${formatTime(tv.start.hours, tv.start.minutes)}` : "";
      if (!range.to) return `${fmt(range.from)}${startTime} →`;
      const endTime   = showTimePicker && tv?.end   ? ` ${formatTime(tv.end.hours, tv.end.minutes)}`     : "";
      return `${fmt(range.from)}${startTime} – ${fmt(range.to)}${endTime}`;
    }
    const tv = effectiveTimeValue as TimeValue;
    const timeStr = showTimePicker && tv ? ` ${formatTime(tv.hours, tv.minutes)}` : "";
    return `${fmt(value as NepaliDate)}${timeStr}`;
  }, [value, mode, showTimePicker, effectiveTimeValue, fmt]);

  const handleSelect = (selected: NepaliDate | NepaliDateRange | undefined) => {
    onChange?.(selected);
    if (mode === "single" && selected && !showTimePicker) setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(undefined);
  };

  const hasValue =
    mode === "single"
      ? value instanceof NepaliDate
      : !!(value as NepaliDateRange | undefined)?.from;

  return (
    <div className={cn("inline-flex", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "min-w-[200px] justify-start text-left font-normal",
              !hasValue && "text-muted-foreground",
              triggerClassName,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">
              {triggerLabel ?? (placeholder ?? (mode === "range" ? "Pick a date range" : "Pick a date"))}
            </span>
            {clearable && hasValue && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear selection"
                onClick={handleClear}
                onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
                className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align={align} sideOffset={8}>
          <div className="flex flex-col">
            <NepaliCalendar
              mode={mode}
              selected={value}
              onSelect={handleSelect}
              numberOfMonths={numberOfMonths}
              fromDate={fromDate}
              toDate={toDate}
              captionLayout={captionLayout}
              fixedWeeks={fixedWeeks}
              footer={footer}
              locale={locale}
              showOutsideDays={showOutsideDays}
              defaultMonth={defaultMonth}
              disabled={disabledDates}
            />

            {showTimePicker && mode === "single" && (
              <TimePicker
                value={effectiveTimeValue as TimeValue}
                onChange={(t) => handleTimeChange(t)}
              />
            )}

            {showTimePicker && mode === "range" && (
              <div className="flex gap-6 border-t p-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Start time</p>
                  <TimePicker
                    className="border-t-0 p-0"
                    value={(effectiveTimeValue as TimeRangeValue).start}
                    onChange={(t) => handleTimeChange({ ...(effectiveTimeValue as TimeRangeValue), start: t })}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">End time</p>
                  <TimePicker
                    className="border-t-0 p-0"
                    value={(effectiveTimeValue as TimeRangeValue).end}
                    onChange={(t) => handleTimeChange({ ...(effectiveTimeValue as TimeRangeValue), end: t })}
                  />
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
