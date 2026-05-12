import NepaliDate from "nepali-date-converter";

/**
 * A Bikram Sambat (BS) date range with an optional end.
 *
 * While the user is picking the second date `to` is `undefined`.
 * Both `from` and `to` being `undefined` means there is no selection.
 *
 * @example
 * const range: NepaliDateRange = {
 *   from: new NepaliDate(2082, 0, 1),
 *   to:   new NepaliDate(2082, 0, 31),
 * };
 */
export type NepaliDateRange = {
  /** Start of the range. `undefined` means no selection. */
  from: NepaliDate | undefined;
  /** End of the range. `undefined` while the user is selecting the second date. */
  to?: NepaliDate | undefined;
};

/**
 * A 24-hour time value composed of hours and minutes.
 *
 * @example
 * const time: TimeValue = { hours: 14, minutes: 30 }; // 2:30 PM
 */
export type TimeValue = {
  /** Hour component in 24-hour format (0–23). */
  hours: number;
  /** Minute component (0–59). */
  minutes: number;
};

/**
 * A pair of `TimeValue` objects used when `mode="range"` and `showTimePicker`
 * is enabled — one time for the range start and one for the range end.
 */
export type TimeRangeValue = {
  /** Time associated with the range start date. */
  start: TimeValue;
  /** Time associated with the range end date. */
  end: TimeValue;
};

/**
 * A flexible date-matcher used by the `disabled` prop.
 *
 * Supported forms:
 * - **`NepaliDate`** — disables that single date
 * - **`NepaliDate[]`** — disables all listed dates
 * - **`NepaliDateRange`** — disables every date in the inclusive range
 * - **`(date) => boolean`** — disables any date for which the function returns `true`
 *
 * @example
 * // Disable every Saturday
 * disabled={(d) => getDayOfWeek(d) === 6}
 */
export type Matcher =
  | NepaliDate
  | NepaliDate[]
  | NepaliDateRange
  | ((date: NepaliDate) => boolean);

/**
 * Controls how the month / year header inside the calendar is rendered.
 *
 * | Value | Renders |
 * |---|---|
 * | `"label"` | Plain text — e.g. `Baishakh 2082` (default) |
 * | `"dropdown"` | `<Select>` for both month **and** year |
 * | `"dropdown-months"` | `<Select>` for month only |
 * | `"dropdown-years"` | `<Select>` for year only |
 */
export type CaptionLayout =
  | "label"
  | "dropdown"
  | "dropdown-months"
  | "dropdown-years";
