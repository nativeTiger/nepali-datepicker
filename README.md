# react-bs-calendar

[![npm version](https://img.shields.io/npm/v/react-bs-calendar)](https://www.npmjs.com/package/react-bs-calendar)
[![npm downloads](https://img.shields.io/npm/dm/react-bs-calendar)](https://www.npmjs.com/package/react-bs-calendar)
[![license](https://img.shields.io/npm/l/react-bs-calendar)](https://github.com/nativeTiger/nepali-datepicker/blob/main/LICENSE)
[![demo](https://img.shields.io/badge/demo-live-brightgreen)](https://nepali-datepicker-seven.vercel.app/)

A production-ready **Nepali (Bikram Sambat)** date picker for React — built on [Radix UI](https://www.radix-ui.com/) primitives with the [shadcn/ui](https://ui.shadcn.com/) design system and Tailwind CSS.

**Features:**

- Single date and date-range selection
- Hover preview while selecting a range
- Time picker (24-hour, spin-button style)
- Keyboard navigation (arrow keys, Page Up/Down, Home/End)
- Disabled dates via predicate, exact date, or date range
- Min/Max date bounds
- Multi-month view
- Month / year dropdown captions (shadcn Select)
- Devanagari numeral and month name locale (`"ne"`)
- Full AD ↔ BS conversion utilities
- Strict TypeScript + full JSDoc
- Supports React 18+

---

## Installation

```bash
# npm
npm install react-bs-calendar

# pnpm
pnpm add react-bs-calendar

# yarn
yarn add react-bs-calendar
```

### Peer dependencies

```bash
pnpm add nepali-date-converter lucide-react tailwindcss \
  @radix-ui/react-popover @radix-ui/react-select
```

### Tailwind setup

The components use Tailwind CSS utility classes and the **shadcn/ui CSS variable** tokens
(`--primary`, `--accent`, `--popover`, `--muted-foreground`, etc.).

1. Add the package source to your Tailwind `content` so the classes are not purged:

```js
// tailwind.config.ts
export default {
  content: ["./src/**/*.{ts,tsx}"],
};
```

2. Make sure the shadcn/ui CSS variables are defined in your global CSS
   (they are added automatically when you run `npx shadcn@latest init`):

```css
/* globals.css */
:root {
  --background: ...;
  --foreground: ...;
  --primary: ...;
  --accent: ...;
  /* ... full list at https://ui.shadcn.com/docs/theming */
}
```

---

## Quick start

```tsx
import { NepaliDatePicker } from "react-bs-calendar";
import NepaliDate from "nepali-date-converter";
import { useState } from "react";

export default function App() {
  const [date, setDate] = useState<NepaliDate>();

  return (
    <NepaliDatePicker
      value={date}
      onChange={(d) => setDate(d as NepaliDate)}
      clearable
    />
  );
}
```

---

## `<NepaliDatePicker>`

The main component. Renders a trigger button and a popover with the calendar.

### Props

| Prop               | Type                            | Default         | Description                                           |
| ------------------ | ------------------------------- | --------------- | ----------------------------------------------------- |
| `value`            | `NepaliDate \| NepaliDateRange` | —               | Controlled value                                      |
| `onChange`         | `(date) => void`                | —               | Called when the date/range changes or is cleared      |
| `mode`             | `"single" \| "range"`           | `"single"`      | Selection mode                                        |
| `showTimePicker`   | `boolean`                       | `false`         | Show a time picker below the calendar                 |
| `timeValue`        | `TimeValue \| TimeRangeValue`   | —               | Controlled time (optional — has internal fallback)    |
| `onTimeChange`     | `(time) => void`                | —               | Called when time changes                              |
| `placeholder`      | `string`                        | `"Pick a date"` | Trigger placeholder when nothing selected             |
| `disabled`         | `boolean`                       | `false`         | Disables the trigger button                           |
| `clearable`        | `boolean`                       | `false`         | Show an ✕ button when a value is set                  |
| `displayFormat`    | `"short" \| "long"`             | `"long"`        | `"short"` → `2082-1-1`, `"long"` → `Baishakh 1, 2082` |
| `align`            | `"start" \| "center" \| "end"`  | `"start"`       | Popover alignment                                     |
| `triggerClassName` | `string`                        | —               | Extra classes for the trigger button                  |
| `disabledDates`    | `Matcher \| Matcher[]`          | —               | Disable specific calendar dates                       |
| `numberOfMonths`   | `number`                        | `1`             | Month panels to show side-by-side                     |
| `fromDate`         | `NepaliDate`                    | —               | Minimum selectable date                               |
| `toDate`           | `NepaliDate`                    | —               | Maximum selectable date                               |
| `captionLayout`    | `CaptionLayout`                 | `"label"`       | Caption style (see below)                             |
| `locale`           | `"en" \| "ne"`                  | `"en"`          | `"ne"` uses Devanagari numerals and month names       |
| `fixedWeeks`       | `boolean`                       | `false`         | Always render 6 rows                                  |
| `footer`           | `ReactNode`                     | —               | Content below the calendar grid                       |
| `defaultMonth`     | `NepaliDate`                    | —               | Initial month shown (uncontrolled)                    |

### `captionLayout` options

| Value               | Renders                        |
| ------------------- | ------------------------------ |
| `"label"`           | Plain text — `Baishakh 2082`   |
| `"dropdown"`        | Select for both month and year |
| `"dropdown-months"` | Select for month only          |
| `"dropdown-years"`  | Select for year only           |

### Examples

```tsx
// Date range with 2 months and dropdown navigation
<NepaliDatePicker
  mode="range"
  value={range}
  onChange={(d) => setRange(d as NepaliDateRange)}
  numberOfMonths={2}
  captionLayout="dropdown"
  clearable
/>

// With time picker (uncontrolled time — no extra state needed)
<NepaliDatePicker value={date} onChange={setDate} showTimePicker />

// With time picker (controlled time)
<NepaliDatePicker
  value={date}
  onChange={setDate}
  showTimePicker
  timeValue={time}
  onTimeChange={setTime}
/>

// Nepali numerals + year range constraint
<NepaliDatePicker
  value={date}
  onChange={setDate}
  locale="ne"
  captionLayout="dropdown-years"
  fromDate={new NepaliDate(2075, 0, 1)}
  toDate={new NepaliDate(2090, 11, 30)}
/>

// Disable weekends
<NepaliDatePicker
  value={date}
  onChange={setDate}
  disabledDates={(d) => getDayOfWeek(d) === 6}
/>

// Disable past dates
<NepaliDatePicker
  value={date}
  onChange={setDate}
  disabledDates={(d) => isBefore(d, todayNepali())}
/>
```

---

## `<NepaliCalendar>`

Headless calendar grid — no popover. Embed directly in your UI.

### Props

Same as `<NepaliDatePicker>` except the trigger/popover props (`placeholder`, `clearable`, `align`, `displayFormat`, `triggerClassName`, `disabledDates`). Use `selected` / `onSelect` / `disabled` instead.

```tsx
import { NepaliCalendar } from "react-bs-calendar";

<NepaliCalendar
  mode="range"
  selected={range}
  onSelect={setRange}
  numberOfMonths={2}
/>;
```

### Keyboard navigation

| Key                    | Action                       |
| ---------------------- | ---------------------------- |
| `←` / `→`              | Move one day                 |
| `↑` / `↓`              | Move one week                |
| `Page Up / Down`       | Move one month               |
| `Shift + Page Up/Down` | Move one year                |
| `Home` / `End`         | First / last day of the week |
| `Enter` or `Space`     | Select the focused date      |

---

## `<TimePicker>`

Standalone 24-hour spin-button time input.

```tsx
import { TimePicker } from "react-bs-calendar";
import type { TimeValue } from "react-bs-calendar";

const [time, setTime] = useState<TimeValue>({ hours: 9, minutes: 0 });

<TimePicker value={time} onChange={setTime} />;
```

### Interaction model

- **▲ / ▼ buttons** — increment / decrement with wrap-around
- **`ArrowUp` / `ArrowDown`** on the input — same as buttons
- **Direct typing** — validated; out-of-range input is ignored
- **Mouse wheel** — scroll to change

---

## Types

```ts
import type {
  NepaliDateRange,
  TimeValue,
  TimeRangeValue,
  Matcher,
  CaptionLayout,
} from "react-bs-calendar";

// Date range
type NepaliDateRange = {
  from: NepaliDate | undefined;
  to?: NepaliDate | undefined;
};

// 24-hour time
type TimeValue = { hours: number; minutes: number };

// Time range (for range mode + time picker)
type TimeRangeValue = { start: TimeValue; end: TimeValue };

// Flexible date matcher
type Matcher =
  | NepaliDate
  | NepaliDate[]
  | NepaliDateRange
  | ((date: NepaliDate) => boolean);

// Caption header style
type CaptionLayout =
  | "label"
  | "dropdown"
  | "dropdown-months"
  | "dropdown-years";
```

---

## Utility functions

All utilities are tree-shakeable and exported directly from the package.

```ts
import {
  adToNepali,
  nepaliToAd,
  adToNepaliString,
  nepaliToAdString,
  parseNepaliDate,
  addDays,
  addMonths,
  daysBetween,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  isBetween,
  getDayOfWeek,
  startOfWeek,
  endOfWeek,
  todayNepali,
  formatNepaliDate,
  formatDate,
  formatTime,
  toNepaliNumerals,
  toEnglishNumerals,
  isDateDisabled,
} from "react-bs-calendar";
```

### AD ↔ BS conversion

| Function           | Signature                       | Description                          |
| ------------------ | ------------------------------- | ------------------------------------ |
| `adToNepali`       | `(Date) → NepaliDate`           | JS Date → BS date                    |
| `nepaliToAd`       | `(NepaliDate) → Date`           | BS date → JS Date                    |
| `adToNepaliString` | `(Date) → string`               | JS Date → `"YYYY-MM-DD"` BS string   |
| `nepaliToAdString` | `(NepaliDate) → string`         | BS date → `"YYYY-MM-DD"` AD string   |
| `parseNepaliDate`  | `(string) → NepaliDate \| null` | Parse `"YYYY-M-D"` or `"YYYY-MM-DD"` |

```ts
adToNepali(new Date(2025, 3, 14)); // → NepaliDate 2082-1-1
nepaliToAd(new NepaliDate(2082, 0, 1)); // → Date 2025-04-14
adToNepaliString(new Date(2025, 3, 14)); // → "2082-01-01"
nepaliToAdString(new NepaliDate(2082, 0, 1)); // → "2025-04-14"
parseNepaliDate("2082-1-1"); // → NepaliDate(2082, 0, 1)
parseNepaliDate("bad"); // → null
```

### Date arithmetic

| Function             | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `addDays(date, n)`   | Add (or subtract) `n` days — handles month/year rollover       |
| `addMonths(date, n)` | Add `n` months — day clamped to last valid day of target month |
| `daysBetween(a, b)`  | Absolute day count between two BS dates                        |

### Comparisons

| Function                      | Description                                |
| ----------------------------- | ------------------------------------------ |
| `isSameDay(a, b)`             | Same year, month, and day                  |
| `isSameMonth(a, b)`           | Same year and month                        |
| `isBefore(a, b)`              | `a` is strictly earlier than `b`           |
| `isAfter(a, b)`               | `a` is strictly later than `b`             |
| `isBetween(date, start, end)` | Strictly between start and end (exclusive) |

### Week helpers

| Function             | Description                                |
| -------------------- | ------------------------------------------ |
| `getDayOfWeek(date)` | `0` = Sunday … `6` = Saturday              |
| `startOfWeek(date)`  | The Sunday of the week containing `date`   |
| `endOfWeek(date)`    | The Saturday of the week containing `date` |

### Formatting & numerals

| Function                 | Example                                          |
| ------------------------ | ------------------------------------------------ |
| `formatNepaliDate(date)` | `"2082-1-1"` (no zero-padding)                   |
| `formatDate(date)`       | `"2082-01-01"` (zero-padded, for `data-*` attrs) |
| `formatTime(h, m)`       | `formatTime(9, 5)` → `"09:05"`                   |
| `toNepaliNumerals(n)`    | `toNepaliNumerals(2082)` → `"२०८२"`              |
| `toEnglishNumerals(s)`   | `toEnglishNumerals("२०८२")` → `"2082"`           |

### Other

| Function                                      | Description                                                 |
| --------------------------------------------- | ----------------------------------------------------------- |
| `todayNepali()`                               | Current date as a `NepaliDate`                              |
| `isDateDisabled(date, matchers?, min?, max?)` | `true` if the date matches any matcher or is out of bounds  |
| `getMonthInfo(date)`                          | `{ totalNumberOfDays, firstDayOfMonth }` from lookup tables |

---

## Calendar data

The package includes static lookup tables covering **1970–2099 BS** (~1913–2042 AD):

- `CALENDAR_DATA` — days in each month per year
- `FIRST_DAY_OF_MONTH` — weekday index (0 = Sunday) on which each month starts

These encode the official Nepali calendar and are the source of truth for all date arithmetic.

---

## Design system

The components use the same **CSS variable tokens** as [shadcn/ui](https://ui.shadcn.com/):

| Token                                | Used for                  |
| ------------------------------------ | ------------------------- |
| `--primary` / `--primary-foreground` | Selected date             |
| `--accent` / `--accent-foreground`   | Range strip, today, hover |
| `--muted-foreground`                 | Outside days, day headers |
| `--popover` / `--popover-foreground` | Popover background        |
| `--border` / `--input`               | Time picker input borders |
| `--ring`                             | Focus ring                |

All tokens adapt automatically to light and dark mode via the `.dark` class.

---

## License

MIT © [nativeTiger](https://github.com/nativeTiger)
