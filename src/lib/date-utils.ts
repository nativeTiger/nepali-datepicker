import NepaliDate from "nepali-date-converter";
import { CALENDAR_DATA, FIRST_DAY_OF_MONTH } from "../data/calendar-data";
import type { Matcher, NepaliDateRange } from "../types";

/**
 * Returns the total number of days in a BS month and the weekday index
 * (0 = Sunday) on which that month starts.
 *
 * Reads from the pre-computed lookup tables in `calendar-data.ts`.
 * Falls back to 30 days / Sunday start when the year is out of range.
 *
 * @example
 * const { totalNumberOfDays, firstDayOfMonth } =
 *   getMonthInfo(new NepaliDate(2082, 0, 1));
 * // → { month: 0, year: 2082, totalNumberOfDays: 31, firstDayOfMonth: 6 }
 */
export function getMonthInfo(date: NepaliDate) {
  const month = date.getMonth();
  const year = date.getYear();
  return {
    month,
    year,
    totalNumberOfDays: CALENDAR_DATA[year]?.[month] ?? 30,
    firstDayOfMonth: FIRST_DAY_OF_MONTH[year]?.[month] ?? 0,
  };
}

/**
 * Returns `true` when two BS dates represent the same calendar day.
 *
 * @example
 * isSameDay(new NepaliDate(2082, 0, 1), new NepaliDate(2082, 0, 1)) // → true
 * isSameDay(new NepaliDate(2082, 0, 1), new NepaliDate(2082, 0, 2)) // → false
 */
export function isSameDay(a: NepaliDate, b: NepaliDate): boolean {
  return (
    a.getYear() === b.getYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Returns `true` when two BS dates fall in the same year and month.
 *
 * @example
 * isSameMonth(new NepaliDate(2082, 0, 1), new NepaliDate(2082, 0, 31)) // → true
 * isSameMonth(new NepaliDate(2082, 0, 1), new NepaliDate(2082, 1, 1))  // → false
 */
export function isSameMonth(a: NepaliDate, b: NepaliDate): boolean {
  return a.getYear() === b.getYear() && a.getMonth() === b.getMonth();
}

/**
 * Returns `true` when `a` is strictly earlier than `b` in the BS calendar.
 *
 * @example
 * isBefore(new NepaliDate(2082, 0, 1), new NepaliDate(2082, 0, 2)) // → true
 * isBefore(new NepaliDate(2082, 0, 2), new NepaliDate(2082, 0, 1)) // → false
 */
export function isBefore(a: NepaliDate, b: NepaliDate): boolean {
  if (a.getYear() !== b.getYear()) return a.getYear() < b.getYear();
  if (a.getMonth() !== b.getMonth()) return a.getMonth() < b.getMonth();
  return a.getDate() < b.getDate();
}

/**
 * Returns `true` when `a` is strictly later than `b` in the BS calendar.
 *
 * @example
 * isAfter(new NepaliDate(2082, 0, 2), new NepaliDate(2082, 0, 1)) // → true
 * isAfter(new NepaliDate(2082, 0, 1), new NepaliDate(2082, 0, 2)) // → false
 */
export function isAfter(a: NepaliDate, b: NepaliDate): boolean {
  if (a.getYear() !== b.getYear()) return a.getYear() > b.getYear();
  if (a.getMonth() !== b.getMonth()) return a.getMonth() > b.getMonth();
  return a.getDate() > b.getDate();
}

/**
 * Returns `true` when `date` falls **strictly between** `start` and `end`
 * (both endpoints excluded).
 *
 * @example
 * const s = new NepaliDate(2082, 0, 1);
 * const e = new NepaliDate(2082, 0, 10);
 * isBetween(new NepaliDate(2082, 0, 5), s, e) // → true
 * isBetween(s, s, e)                           // → false  (start excluded)
 */
export function isBetween(
  date: NepaliDate,
  start: NepaliDate,
  end: NepaliDate,
): boolean {
  return isAfter(date, start) && isBefore(date, end);
}

/**
 * Returns a new `NepaliDate` offset by `n` days from `date`.
 * Negative values move backwards. Correctly wraps across month and year
 * boundaries using the pre-computed `CALENDAR_DATA` lookup table.
 *
 * @param date - The base BS date.
 * @param n - Number of days to add (negative to subtract).
 *
 * @example
 * addDays(new NepaliDate(2082, 0, 30), 2)  // → NepaliDate(2082, 1, 2)
 * addDays(new NepaliDate(2082, 0, 1),  -1) // → NepaliDate(2081, 11, 30)
 */
export function addDays(date: NepaliDate, n: number): NepaliDate {
  if (n === 0) return date;
  let y = date.getYear();
  let m = date.getMonth();
  let d = date.getDate();
  let remaining = Math.abs(n);
  const dir = n > 0 ? 1 : -1;

  while (remaining > 0) {
    d += dir;
    const daysInMonth = CALENDAR_DATA[y]?.[m] ?? 30;
    if (d > daysInMonth) {
      d = 1;
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    } else if (d < 1) {
      m--;
      if (m < 0) {
        m = 11;
        y--;
      }
      d = CALENDAR_DATA[y]?.[m] ?? 30;
    }
    remaining--;
  }
  return new NepaliDate(y, m, d);
}

/**
 * Returns a new `NepaliDate` offset by `n` months from `date`.
 * The day is clamped to the last valid day of the target month when needed
 * (e.g. jumping from Chaitra 30 to a month with only 29 days yields day 29).
 *
 * @param date - The base BS date.
 * @param n - Number of months to add (negative to subtract).
 *
 * @example
 * addMonths(new NepaliDate(2082, 0, 31), 1) // → NepaliDate(2082, 1, 31) or last day
 * addMonths(new NepaliDate(2082, 0, 1), -1) // → NepaliDate(2081, 11, 1)
 */
export function addMonths(date: NepaliDate, n: number): NepaliDate {
  let m = date.getMonth() + n;
  let y = date.getYear();
  while (m > 11) {
    m -= 12;
    y++;
  }
  while (m < 0) {
    m += 12;
    y--;
  }
  const daysInMonth = CALENDAR_DATA[y]?.[m] ?? 30;
  return new NepaliDate(y, m, Math.min(date.getDate(), daysInMonth));
}

/**
 * Returns the weekday index for a BS date: **0 = Sunday, 6 = Saturday**.
 *
 * Derived from `FIRST_DAY_OF_MONTH` without any AD-conversion overhead.
 *
 * @example
 * getDayOfWeek(new NepaliDate(2082, 0, 1)) // → 6  (Saturday)
 */
export function getDayOfWeek(date: NepaliDate): number {
  const firstDay = FIRST_DAY_OF_MONTH[date.getYear()]?.[date.getMonth()] ?? 0;
  return (firstDay + date.getDate() - 1) % 7;
}

/**
 * Returns the Sunday that begins the week containing `date`.
 *
 * @example
 * // If 2082-1-5 is a Wednesday (dow 3)
 * startOfWeek(new NepaliDate(2082, 0, 5)) // → NepaliDate(2082, 0, 2) (Sunday)
 */
export function startOfWeek(date: NepaliDate): NepaliDate {
  return addDays(date, -getDayOfWeek(date));
}

/**
 * Returns the Saturday that ends the week containing `date`.
 *
 * @example
 * // If 2082-1-5 is a Wednesday (dow 3)
 * endOfWeek(new NepaliDate(2082, 0, 5)) // → NepaliDate(2082, 0, 8) (Saturday)
 */
export function endOfWeek(date: NepaliDate): NepaliDate {
  return addDays(date, 6 - getDayOfWeek(date));
}

/**
 * Returns `true` when `date` should be treated as disabled.
 *
 * Checks are applied in this order:
 * 1. `min` — date is before the minimum allowed date
 * 2. `max` — date is after the maximum allowed date
 * 3. Each matcher in `matchers` (function, exact date, or range)
 *
 * @param date - The BS date to test.
 * @param matchers - One or more `Matcher` values (optional).
 * @param min - Minimum allowed date, inclusive (optional).
 * @param max - Maximum allowed date, inclusive (optional).
 *
 * @example
 * isDateDisabled(
 *   new NepaliDate(2082, 0, 5),
 *   (d) => getDayOfWeek(d) === 6, // disable Saturdays
 * ) // → false  (if 2082-1-5 is not a Saturday)
 */
export function isDateDisabled(
  date: NepaliDate,
  matchers?: Matcher | Matcher[],
  min?: NepaliDate,
  max?: NepaliDate,
): boolean {
  if (min && isBefore(date, min)) return true;
  if (max && isAfter(date, max)) return true;
  if (!matchers) return false;
  const arr = Array.isArray(matchers) ? matchers : [matchers];
  for (const m of arr) {
    if (typeof m === "function") {
      if (m(date)) return true;
    } else if (m instanceof NepaliDate) {
      if (isSameDay(date, m)) return true;
    } else if ("from" in m) {
      const range = m as NepaliDateRange;
      if (range.from && range.to) {
        if (!isBefore(date, range.from) && !isAfter(date, range.to)) return true;
      } else if (range.from && isSameDay(date, range.from)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Returns a zero-padded BS date string in `"YYYY-MM-DD"` format.
 * Used for `data-date` attributes and reliable string-based lookups.
 *
 * @example
 * formatDate(new NepaliDate(2082, 0, 1)) // → "2082-01-01"
 */
export function formatDate(date: NepaliDate): string {
  return `${date.getYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Returns a human-readable BS date string in `"YYYY-M-D"` format
 * (no zero-padding). Suitable for display labels and trigger buttons.
 *
 * @example
 * formatNepaliDate(new NepaliDate(2082, 0, 1)) // → "2082-1-1"
 */
export function formatNepaliDate(date: NepaliDate): string {
  return `${date.getYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

const NEPALI_NUMERALS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/**
 * Converts an Arabic (ASCII) number to its Devanagari numeral equivalent.
 *
 * @example
 * toNepaliNumerals(2082) // → "२०८२"
 * toNepaliNumerals(9)    // → "९"
 */
export function toNepaliNumerals(n: number): string {
  return String(n)
    .split("")
    .map((d) => NEPALI_NUMERALS[Number(d)] ?? d)
    .join("");
}

/**
 * Formats hours and minutes as a zero-padded `"HH:MM"` string.
 *
 * @example
 * formatTime(9, 5)  // → "09:05"
 * formatTime(14, 0) // → "14:00"
 */
export function formatTime(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Nepali month names in Devanagari script, indexed 0 (Baishakh) → 11 (Chaitra).
 * Used when `locale="ne"` is passed to calendar components.
 */
export const NEPALI_MONTHS_NE = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फाल्गुन",
  "चैत",
];

// ─── AD ↔ BS Conversion ───────────────────────────────────────────────────────

/**
 * Converts an English (AD) JavaScript `Date` to a Nepali (BS) `NepaliDate`.
 *
 * @example
 * adToNepali(new Date(2025, 3, 14)) // → NepaliDate for 2082-1-1 (Baishakh 1)
 */
export function adToNepali(adDate: Date): NepaliDate {
  return new NepaliDate(adDate);
}

/**
 * Converts a Nepali (BS) `NepaliDate` to an English (AD) JavaScript `Date`.
 *
 * @example
 * nepaliToAd(new NepaliDate(2082, 0, 1)) // → JS Date for 2025-04-14
 */
export function nepaliToAd(bsDate: NepaliDate): Date {
  return bsDate.toJsDate();
}

/**
 * Converts an English (AD) `Date` and returns a zero-padded BS string
 * in `"YYYY-MM-DD"` format.
 *
 * @example
 * adToNepaliString(new Date(2025, 3, 14)) // → "2082-01-01"
 */
export function adToNepaliString(adDate: Date): string {
  const bs = new NepaliDate(adDate);
  return `${bs.getYear()}-${String(bs.getMonth() + 1).padStart(2, "0")}-${String(bs.getDate()).padStart(2, "0")}`;
}

/**
 * Converts a Nepali (BS) `NepaliDate` and returns a zero-padded AD string
 * in `"YYYY-MM-DD"` format.
 *
 * @example
 * nepaliToAdString(new NepaliDate(2082, 0, 1)) // → "2025-04-14"
 */
export function nepaliToAdString(bsDate: NepaliDate): string {
  const ad = bsDate.toJsDate();
  return `${ad.getFullYear()}-${String(ad.getMonth() + 1).padStart(2, "0")}-${String(ad.getDate()).padStart(2, "0")}`;
}

/**
 * Parses a BS date string in `"YYYY-M-D"` or `"YYYY-MM-DD"` format into a
 * `NepaliDate`. Returns `null` if the string is invalid.
 *
 * @example
 * parseNepaliDate("2082-1-1")   // → NepaliDate(2082, 0, 1)
 * parseNepaliDate("2082-01-01") // → NepaliDate(2082, 0, 1)
 * parseNepaliDate("bad-input")  // → null
 */
export function parseNepaliDate(str: string): NepaliDate | null {
  const parts = str.split(/[-/\s]/);
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 32) return null;
  try {
    return new NepaliDate(y, m - 1, d);
  } catch {
    return null;
  }
}

// ─── Numeral conversion ───────────────────────────────────────────────────────

const EN_NUMERALS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

/**
 * Converts a string containing Devanagari (Nepali) digits to ASCII digits.
 *
 * @example
 * toEnglishNumerals("२०८२") // → "2082"
 */
export function toEnglishNumerals(str: string): string {
  return str.replace(/[०-९]/g, (ch) => EN_NUMERALS[ch] ?? ch);
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────

/** Returns the current date as a `NepaliDate` (BS). */
export function todayNepali(): NepaliDate {
  return new NepaliDate();
}

/**
 * Returns the absolute number of days between two `NepaliDate` values.
 * Order doesn't matter.
 *
 * @example
 * daysBetween(new NepaliDate(2082, 0, 1), new NepaliDate(2082, 0, 31)) // → 30
 */
export function daysBetween(a: NepaliDate, b: NepaliDate): number {
  const [start, end] = isBefore(a, b) ? [a, b] : [b, a];
  let count = 0;
  let cur = start;
  while (isBefore(cur, end)) {
    cur = addDays(cur, 1);
    count++;
  }
  return count;
}
