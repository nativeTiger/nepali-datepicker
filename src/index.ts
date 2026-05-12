// ─── Main components ──────────────────────────────────────────────────────────
export { NepaliDatePicker }              from "./components/datepicker";
export { NepaliCalendar }               from "./components/calendar";
export { TimePicker }                   from "./components/time-picker";

// ─── Types ────────────────────────────────────────────────────────────────────
export type { NepaliCalendarProps }     from "./components/calendar";
export type { NepaliDateRange }         from "./types";
export type { TimeValue, TimeRangeValue } from "./components/datepicker";
export type { CaptionLayout, Matcher }  from "./types";

// ─── Utilities ────────────────────────────────────────────────────────────────
export {
  // AD ↔ BS conversion
  adToNepali,
  nepaliToAd,
  adToNepaliString,
  nepaliToAdString,
  parseNepaliDate,
  // Date arithmetic
  addDays,
  addMonths,
  daysBetween,
  // Comparisons
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  isBetween,
  // Week helpers
  getDayOfWeek,
  startOfWeek,
  endOfWeek,
  // Formatting
  formatDate,
  formatNepaliDate,
  formatTime,
  // Numerals
  toNepaliNumerals,
  toEnglishNumerals,
  // Misc
  todayNepali,
  isDateDisabled,
  getMonthInfo,
  // Constants
  NEPALI_MONTHS_NE,
} from "./lib/date-utils";

export { cn } from "./lib/utils";
