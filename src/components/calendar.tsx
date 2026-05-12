import * as React from "react";
import NepaliDate from "nepali-date-converter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../lib/utils";
import { CALENDAR_DATA, FIRST_DAY_OF_MONTH, NEPALI_DAYS, NEPALI_MONTHS } from "../data/calendar-data";
import type { CaptionLayout, Matcher, NepaliDateRange } from "../types";
import {
  addDays,
  addMonths,
  endOfWeek,
  formatDate,
  isAfter,
  isBefore,
  isBetween,
  isDateDisabled,
  isSameDay,
  isSameMonth,
  startOfWeek,
  toNepaliNumerals,
  NEPALI_MONTHS_NE,
} from "../lib/date-utils";

export type { NepaliDateRange };

const MIN_YEAR = 1970;
const MAX_YEAR = 2099;

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * Props for the headless `<NepaliCalendar>` grid component.
 */
export interface NepaliCalendarProps {
  /** Extra CSS classes applied to the root `<div>`. */
  className?: string;
  /**
   * Selection mode.
   * - `"single"` — one date at a time.
   * - `"range"` — start + end with a highlighted strip in between.
   * @default "single"
   */
  mode?: "single" | "range";
  /** Controlled selection value. */
  selected?: NepaliDate | NepaliDateRange;
  /** Called when the user selects a date or presses Enter on a focused day. */
  onSelect?: (date: NepaliDate | NepaliDateRange | undefined) => void;
  /** The month shown on first render (uncontrolled). Ignored when `month` is provided. */
  defaultMonth?: NepaliDate;
  /** Controlled current month. Pair with `onMonthChange`. */
  month?: NepaliDate;
  /** Called whenever the visible month changes. */
  onMonthChange?: (month: NepaliDate) => void;
  /**
   * Number of month panels rendered side-by-side.
   * When > 1, `showOutsideDays` is forced `false` to avoid duplicate date cells.
   * @default 1
   */
  numberOfMonths?: number;
  /**
   * Show greyed-out days from adjacent months. Disabled automatically for multi-month.
   * @default true
   */
  showOutsideDays?: boolean;
  /** Disable specific dates. Accepts a `Matcher` or array of matchers. */
  disabled?: Matcher | Matcher[];
  /** Minimum selectable date (inclusive). */
  fromDate?: NepaliDate;
  /** Maximum selectable date (inclusive). */
  toDate?: NepaliDate;
  /**
   * Controls how the month / year caption header is rendered.
   * @default "label"
   */
  captionLayout?: CaptionLayout;
  /**
   * Always render exactly 6 rows per month panel.
   * @default false
   */
  fixedWeeks?: boolean;
  /** Content rendered below the day grid with a border separator. */
  footer?: React.ReactNode;
  /**
   * Display locale.
   * - `"en"` — English (default)
   * - `"ne"` — Nepali (Devanagari numerals and month names)
   * @default "en"
   */
  locale?: "en" | "ne";
}

// ─── Caption ─────────────────────────────────────────────────────────────────

interface CaptionProps {
  monthDate: NepaliDate;
  captionLayout: CaptionLayout;
  fromYear: number;
  toYear: number;
  locale: "en" | "ne";
  onMonthSelect: (month: number) => void;
  onYearSelect: (year: number) => void;
}

function Caption({
  monthDate,
  captionLayout,
  fromYear,
  toYear,
  locale,
  onMonthSelect,
  onYearSelect,
}: CaptionProps) {
  const months = locale === "ne" ? NEPALI_MONTHS_NE : NEPALI_MONTHS;
  const year   = monthDate.getYear();
  const month  = monthDate.getMonth();

  if (captionLayout === "label") {
    return (
      <span className="text-sm font-medium">
        {months[month]}&nbsp;{locale === "ne" ? toNepaliNumerals(year) : year}
      </span>
    );
  }

  const showMonthDropdown = captionLayout === "dropdown" || captionLayout === "dropdown-months";
  const showYearDropdown  = captionLayout === "dropdown" || captionLayout === "dropdown-years";
  const triggerCn = "h-7 gap-1 border-0 bg-transparent px-2 text-sm font-medium shadow-none focus:ring-0 focus-visible:ring-0";

  return (
    <div className="flex items-center gap-1">
      {showMonthDropdown ? (
        <Select value={String(month)} onValueChange={(v) => onMonthSelect(Number(v))}>
          <SelectTrigger size="sm" aria-label="Select month" className={triggerCn}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-60">
            {months.map((name, i) => (
              <SelectItem key={i} value={String(i)}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="text-sm font-medium">{months[month]}</span>
      )}

      {showYearDropdown ? (
        <Select value={String(year)} onValueChange={(v) => onYearSelect(Number(v))}>
          <SelectTrigger size="sm" aria-label="Select year" className={triggerCn}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-60">
            {Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i).map((y) => (
              <SelectItem key={y} value={String(y)}>
                {locale === "ne" ? toNepaliNumerals(y) : y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="text-sm font-medium">
          {locale === "ne" ? toNepaliNumerals(year) : year}
        </span>
      )}
    </div>
  );
}

// ─── Cell grid builder ────────────────────────────────────────────────────────

function buildCells(
  monthDate: NepaliDate,
  fixedWeeks: boolean,
): { date: number; monthOffset: number }[] {
  const y = monthDate.getYear();
  const m = monthDate.getMonth();
  const totalDays = CALENDAR_DATA[y]?.[m] ?? 30;
  const firstDay  = FIRST_DAY_OF_MONTH[y]?.[m] ?? 0;

  const prevDate  = addMonths(monthDate, -1);
  const prevTotal = CALENDAR_DATA[prevDate.getYear()]?.[prevDate.getMonth()] ?? 30;

  const totalCells = fixedWeeks
    ? 42
    : Math.ceil((firstDay + totalDays) / 7) * 7;

  return Array.from({ length: totalCells }, (_, i) => {
    if (i < firstDay)               return { date: prevTotal - firstDay + i + 1, monthOffset: -1 };
    if (i < firstDay + totalDays)   return { date: i - firstDay + 1,             monthOffset: 0  };
    return { date: i - (firstDay + totalDays) + 1, monthOffset: 1 };
  });
}

// ─── NepaliCalendar ───────────────────────────────────────────────────────────

/**
 * A headless Nepali (Bikram Sambat) calendar grid.
 *
 * Renders one or more month panels with full keyboard navigation,
 * single-date and range selection, range hover-preview, disabled-date
 * support, and an optional Devanagari locale.
 *
 * @example
 * <NepaliCalendar selected={date} onSelect={setDate} />
 *
 * @example
 * <NepaliCalendar
 *   mode="range"
 *   selected={range}
 *   onSelect={setRange}
 *   numberOfMonths={2}
 * />
 */
export function NepaliCalendar({
  className,
  mode = "single",
  selected,
  onSelect,
  defaultMonth,
  month: controlledMonth,
  onMonthChange,
  numberOfMonths = 1,
  showOutsideDays: showOutsideDaysProp = true,
  disabled,
  fromDate,
  toDate,
  captionLayout = "label",
  fixedWeeks = false,
  footer,
  locale = "en",
}: NepaliCalendarProps) {
  const showOutsideDays = showOutsideDaysProp && numberOfMonths === 1;
  const today = React.useMemo(() => new NepaliDate(), []);

  const getInitialMonth = React.useCallback((): NepaliDate => {
    if (controlledMonth) return controlledMonth;
    if (defaultMonth)    return defaultMonth;
    if (selected) {
      const s = mode === "range"
        ? (selected as NepaliDateRange).from
        : (selected as NepaliDate);
      if (s) return s;
    }
    return today;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [viewMonth,   setViewMonth]   = React.useState<NepaliDate>(getInitialMonth);
  const [hoverDate,   setHoverDate]   = React.useState<NepaliDate | null>(null);
  const [focusedDate, setFocusedDate] = React.useState<NepaliDate | null>(null);

  const calendarRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (controlledMonth) setViewMonth(controlledMonth);
  }, [controlledMonth]);

  React.useEffect(() => {
    if (!focusedDate || !calendarRef.current) return;
    const btn = calendarRef.current.querySelector(
      `button[data-date="${formatDate(focusedDate)}"]`,
    ) as HTMLButtonElement | null;
    if (btn && document.activeElement !== btn) btn.focus({ preventScroll: true });
  }, [focusedDate]);

  const navigateMonth = React.useCallback((delta: number) => {
    setViewMonth((prev) => {
      const next = addMonths(prev, delta);
      onMonthChange?.(next);
      return next;
    });
  }, [onMonthChange]);

  const visibleMonths = React.useMemo(
    () => Array.from({ length: numberOfMonths }, (_, i) => addMonths(viewMonth, i)),
    [viewMonth, numberOfMonths],
  );

  const isSelectingRange =
    mode === "range" &&
    !!(selected as NepaliDateRange | undefined)?.from &&
    !(selected as NepaliDateRange | undefined)?.to;

  const handleDateSelect = React.useCallback((date: NepaliDate) => {
    if (isDateDisabled(date, disabled, fromDate, toDate)) return;
    if (mode === "single") {
      onSelect?.(date);
    } else {
      const range = selected as NepaliDateRange | undefined;
      if (!range?.from || range.to !== undefined) {
        onSelect?.({ from: date, to: undefined });
      } else if (isSameDay(date, range.from)) {
        onSelect?.({ from: undefined, to: undefined });
      } else if (isBefore(date, range.from)) {
        onSelect?.({ from: date, to: range.from });
      } else {
        onSelect?.({ from: range.from, to: date });
      }
    }
  }, [mode, selected, disabled, fromDate, toDate, onSelect]);

  const defaultFocusDate = React.useMemo((): NepaliDate => {
    const candidates: Array<NepaliDate | undefined> = [];
    if (mode === "single" && selected instanceof NepaliDate) candidates.push(selected);
    if (mode === "range") {
      const r = selected as NepaliDateRange | undefined;
      if (r?.from) candidates.push(r.from);
    }
    candidates.push(today);
    for (const c of candidates) {
      if (c && visibleMonths.some((m) => isSameMonth(c, m))) return c;
    }
    return new NepaliDate(viewMonth.getYear(), viewMonth.getMonth(), 1);
  }, [mode, selected, today, visibleMonths, viewMonth]);

  const effectiveFocusDate = focusedDate ?? defaultFocusDate;

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent, date: NepaliDate) => {
    let next: NepaliDate | null = null;
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); next = addDays(date,  1);  break;
      case "ArrowLeft":  e.preventDefault(); next = addDays(date, -1);  break;
      case "ArrowDown":  e.preventDefault(); next = addDays(date,  7);  break;
      case "ArrowUp":    e.preventDefault(); next = addDays(date, -7);  break;
      case "PageDown":   e.preventDefault(); next = addMonths(date, e.shiftKey ? 12 : 1);  break;
      case "PageUp":     e.preventDefault(); next = addMonths(date, e.shiftKey ? -12 : -1); break;
      case "Home":       e.preventDefault(); next = startOfWeek(date); break;
      case "End":        e.preventDefault(); next = endOfWeek(date);   break;
      case "Enter":
      case " ":          e.preventDefault(); handleDateSelect(date); return;
      default: return;
    }
    if (!next) return;
    if (fromDate && isBefore(next, fromDate)) next = fromDate;
    if (toDate   && isAfter(next,  toDate))   next = toDate;
    setFocusedDate(next);
    const isVisible = visibleMonths.some((m) => isSameMonth(next!, m));
    if (!isVisible) navigateMonth(isBefore(next, visibleMonths[0]) ? -1 : 1);
  }, [handleDateSelect, visibleMonths, fromDate, toDate, navigateMonth]);

  // Navigation guards
  const lastVisible = visibleMonths[visibleMonths.length - 1];
  const canGoPrev =
    !fromDate ||
    viewMonth.getYear() > fromDate.getYear() ||
    (viewMonth.getYear() === fromDate.getYear() && viewMonth.getMonth() > fromDate.getMonth());
  const canGoNext =
    !toDate ||
    lastVisible.getYear() < toDate.getYear() ||
    (lastVisible.getYear() === toDate.getYear() && lastVisible.getMonth() < toDate.getMonth());

  const fromYear = fromDate?.getYear() ?? MIN_YEAR;
  const toYear   = toDate?.getYear()   ?? MAX_YEAR;

  return (
    <div className={cn("p-3", className)} ref={calendarRef}>
      <div className="flex flex-col gap-4 sm:flex-row">
        {visibleMonths.map((monthDate, monthIdx) => {
          const isFirst = monthIdx === 0;
          const isLast  = monthIdx === numberOfMonths - 1;
          const cells   = buildCells(monthDate, fixedWeeks);
          const rows    = Array.from({ length: cells.length / 7 }, (_, ri) =>
            cells.slice(ri * 7, ri * 7 + 7),
          );

          return (
            <div key={`${monthDate.getYear()}-${monthDate.getMonth()}`} className="space-y-4">
              {/* ── Header ─────────────────────────────────────── */}
              <div className="relative flex items-center justify-center pt-1">
                <Caption
                  monthDate={monthDate}
                  captionLayout={captionLayout}
                  fromYear={fromYear}
                  toYear={toYear}
                  locale={locale}
                  onMonthSelect={(m) => {
                    const next = new NepaliDate(monthDate.getYear(), m, 1);
                    setViewMonth(addMonths(next, -monthIdx));
                    onMonthChange?.(next);
                  }}
                  onYearSelect={(y) => {
                    const next = new NepaliDate(y, monthDate.getMonth(), 1);
                    setViewMonth(addMonths(next, -monthIdx));
                    onMonthChange?.(next);
                  }}
                />
                {/* pointer-events-none wrapper so nav buttons never block caption dropdowns */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigateMonth(-1)}
                    disabled={!canGoPrev}
                    aria-label="Go to previous month"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "pointer-events-auto h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:pointer-events-none",
                      !isFirst && "invisible pointer-events-none",
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateMonth(1)}
                    disabled={!canGoNext}
                    aria-label="Go to next month"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "pointer-events-auto h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 disabled:pointer-events-none",
                      !isLast && "invisible pointer-events-none",
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ── Weekday headers ─────────────────────────────── */}
              <div className="flex">
                {NEPALI_DAYS.map((day) => (
                  <div key={day} className="w-9 text-center text-[0.8rem] font-normal text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* ── Day grid ────────────────────────────────────── */}
              <div
                role="grid"
                aria-label={`${NEPALI_MONTHS[monthDate.getMonth()]} ${monthDate.getYear()}`}
                className="grid gap-y-1"
              >
                {rows.map((row, rowIdx) => (
                  <div key={rowIdx} role="row" className="flex">
                    {row.map(({ date, monthOffset }, colIdx) => {
                      let cellY = monthDate.getYear();
                      let cellM = monthDate.getMonth() + monthOffset;
                      if (cellM < 0)   { cellM = 11; cellY--; }
                      else if (cellM > 11) { cellM = 0;  cellY++; }

                      const cellDate = new NepaliDate(cellY, cellM, date);
                      const dateKey  = formatDate(cellDate);
                      const isOutside = monthOffset !== 0;

                      if (isOutside && !showOutsideDays) {
                        return <div key={colIdx} role="gridcell" className="h-9 w-9" />;
                      }

                      const isToday    = isSameDay(cellDate, today);
                      const isDisabled = isDateDisabled(cellDate, disabled, fromDate, toDate);
                      const isFocused  = isSameDay(cellDate, effectiveFocusDate);

                      // Selection state
                      let isSelected     = false;
                      let isRangeStart   = false;
                      let isRangeEnd     = false;
                      let isRangeMiddle  = false;
                      let isPreviewStart = false;
                      let isPreviewEnd   = false;
                      let isPreviewMiddle = false;

                      if (mode === "single") {
                        isSelected = !!selected && isSameDay(cellDate, selected as NepaliDate);
                      } else {
                        const range = selected as NepaliDateRange | undefined;
                        if (range?.from) {
                          isRangeStart = isSameDay(cellDate, range.from);
                          if (range.to) {
                            isRangeEnd    = isSameDay(cellDate, range.to);
                            isRangeMiddle = isBetween(cellDate, range.from, range.to);
                            isSelected    = isRangeStart || isRangeEnd || isRangeMiddle;
                          } else {
                            isSelected = isRangeStart;
                            if (isSelectingRange && hoverDate) {
                              const lo = isBefore(hoverDate, range.from) ? hoverDate : range.from;
                              const hi = isBefore(hoverDate, range.from) ? range.from : hoverDate;
                              if (!isSameDay(hoverDate, range.from)) {
                                isPreviewStart  = isSameDay(cellDate, lo);
                                isPreviewEnd    = isSameDay(cellDate, hi);
                                isPreviewMiddle = isBetween(cellDate, lo, hi);
                              }
                            }
                          }
                        }
                      }

                      const showActualStrip  = isRangeStart || isRangeEnd || isRangeMiddle;
                      const showPreviewStrip = !showActualStrip && (isPreviewStart || isPreviewEnd || isPreviewMiddle);

                      const cellWrapperCn = cn(
                        "relative h-9 w-9 text-center text-sm",
                        mode === "range" && isRangeMiddle                    && "bg-accent",
                        mode === "range" && isRangeStart  && !isRangeEnd     && "rounded-l-md bg-accent",
                        mode === "range" && isRangeEnd    && !isRangeStart   && "rounded-r-md bg-accent",
                        mode === "range" && isRangeStart  && isRangeEnd      && "rounded-md",
                        showPreviewStrip && isPreviewMiddle                  && "bg-accent/50",
                        showPreviewStrip && isPreviewStart && !isPreviewEnd  && "rounded-l-md bg-accent/50",
                        showPreviewStrip && isPreviewEnd   && !isPreviewStart && "rounded-r-md bg-accent/50",
                        showPreviewStrip && isPreviewStart && isPreviewEnd   && "rounded-md bg-accent/50",
                      );

                      const btnCn = cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-9 w-9 p-0 font-normal",
                        isToday && "font-semibold",
                        isToday && !isSelected && !isRangeStart && !isRangeEnd && !isPreviewStart && !isPreviewEnd
                          && "bg-accent text-accent-foreground",
                        isSelected && mode === "single"
                          && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        (isRangeStart || isRangeEnd)
                          && "z-10 rounded-md bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        isRangeMiddle
                          && "rounded-none bg-transparent text-accent-foreground hover:bg-transparent hover:text-accent-foreground focus:bg-transparent",
                        (isPreviewStart || isPreviewEnd) && !isRangeStart && !isRangeEnd
                          && "z-10 rounded-md bg-primary/60 text-primary-foreground",
                        isPreviewMiddle && !isRangeMiddle
                          && "rounded-none bg-transparent hover:bg-transparent",
                        isOutside   && "text-muted-foreground opacity-50",
                        isDisabled  && "pointer-events-none cursor-not-allowed opacity-40",
                      );

                      return (
                        <div
                          key={colIdx}
                          role="gridcell"
                          aria-selected={isSelected || undefined}
                          className={cellWrapperCn}
                        >
                          <button
                            type="button"
                            data-date={dateKey}
                            aria-label={`${date} ${NEPALI_MONTHS[cellM]}, ${cellY}`}
                            aria-pressed={isSelected || undefined}
                            aria-disabled={isDisabled || undefined}
                            tabIndex={isFocused ? 0 : -1}
                            disabled={isDisabled}
                            className={btnCn}
                            onClick={() => handleDateSelect(cellDate)}
                            onMouseEnter={() => isSelectingRange && setHoverDate(cellDate)}
                            onMouseLeave={() => isSelectingRange && setHoverDate(null)}
                            onFocus={() => setFocusedDate(cellDate)}
                            onKeyDown={(e) => handleKeyDown(e, cellDate)}
                          >
                            <time dateTime={dateKey}>
                              {locale === "ne" ? toNepaliNumerals(date) : String(date)}
                            </time>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {footer && <div className="mt-3 border-t pt-3">{footer}</div>}
    </div>
  );
}
