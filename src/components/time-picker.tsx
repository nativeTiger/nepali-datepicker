import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import type { TimeValue } from "../types";

export type { TimeValue };

// ─── Single segment (Hours or Minutes) ───────────────────────────────────────

interface TimeSegmentProps {
  value: number;
  min: number;
  max: number;
  label: string;
  onChange: (value: number) => void;
}

function TimeSegment({ value, min, max, label, onChange }: TimeSegmentProps) {
  const increment = () => onChange(value < max ? value + 1 : min);
  const decrement = () => onChange(value > min ? value - 1 : max);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(-2);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= min && n <= max) onChange(n);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp")   { e.preventDefault(); increment(); }
    if (e.key === "ArrowDown") { e.preventDefault(); decrement(); }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.deltaY < 0 ? increment() : decrement();
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <button
        type="button"
        onClick={increment}
        tabIndex={-1}
        aria-label={`Increase ${label}`}
        className="flex h-5 w-9 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <ChevronUp className="h-3 w-3" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={String(value).padStart(2, "0")}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
        onFocus={(e) => e.target.select()}
        aria-label={label}
        className={cn(
          "h-9 w-9 rounded-md border border-input bg-background text-center text-sm font-medium",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-colors hover:border-ring",
        )}
      />
      <button
        type="button"
        onClick={decrement}
        tabIndex={-1}
        aria-label={`Decrease ${label}`}
        className="flex h-5 w-9 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <ChevronDown className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── TimePicker ───────────────────────────────────────────────────────────────

/**
 * Props for the `<TimePicker>` component.
 */
interface TimePickerProps {
  /**
   * Controlled time value. When omitted, defaults to `{ hours: 0, minutes: 0 }`.
   */
  value?: TimeValue;
  /** Called on every change with the new `TimeValue`. */
  onChange: (value: TimeValue) => void;
  /** Extra CSS classes applied to the outermost `<div>`. */
  className?: string;
}

/**
 * A 24-hour spin-button time picker with hours (0–23) and minutes (0–59).
 *
 * ### Interaction model
 * - **▲ / ▼ buttons** — increment / decrement with wrap-around
 * - **`ArrowUp` / `ArrowDown`** on a focused segment — same as the buttons
 * - **Direct typing** — validated; invalid input is silently ignored
 * - **Mouse wheel** — scroll to change value
 *
 * @example
 * const [time, setTime] = useState<TimeValue>({ hours: 9, minutes: 0 });
 * <TimePicker value={time} onChange={setTime} />
 */
export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const hours   = value?.hours   ?? 0;
  const minutes = value?.minutes ?? 0;

  return (
    <div className={cn("flex items-end gap-1 border-t p-3", className)}>
      <TimeSegment
        label="HH"
        value={hours}
        min={0}
        max={23}
        onChange={(h) => onChange({ hours: h, minutes })}
      />
      <span className="mb-[0.6rem] select-none text-lg font-semibold text-muted-foreground">
        :
      </span>
      <TimeSegment
        label="MM"
        value={minutes}
        min={0}
        max={59}
        onChange={(m) => onChange({ hours, minutes: m })}
      />
      <span className="mb-[0.6rem] ml-2 tabular-nums text-sm text-muted-foreground">
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
      </span>
    </div>
  );
}
