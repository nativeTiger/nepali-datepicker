/**
 * Examples: NepaliDatePicker + TanStack Form
 *
 * Covers:
 *  1. Single date (required)
 *  2. Date range (required)
 *  3. Single date + time picker
 *
 * Dependencies (add to your project):
 *   pnpm add @tanstack/react-form zod nepali-date-converter
 */

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import NepaliDate from "nepali-date-converter";

import {
  NepaliDatePicker,
  type NepaliDateRange,
  type TimeValue,
} from "react-bs-calendar";

// ─── 1. Single date ───────────────────────────────────────────────────────────

const dobSchema = z
  .instanceof(NepaliDate, { message: "Date of birth is required" })
  .refine((d) => d.getYear() <= 2082, {
    message: "Date must not be in the future",
  });

export function SingleDateForm() {
  const form = useForm({
    defaultValues: {
      dob: undefined as NepaliDate | undefined,
    },
    onSubmit: ({ value }) => {
      alert(`Selected date: ${value.dob!.toString()}`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="dob"
        validators={{
          onChange: ({ value }) => {
            const result = dobSchema.safeParse(value);
            return result.success ? undefined : result.error.errors[0].message;
          },
        }}
      >
        {(field) => (
          <div className="space-y-1">
            <label className="text-sm font-medium">Date of Birth</label>
            <NepaliDatePicker
              value={field.state.value}
              onChange={(d) => field.handleChange(d as NepaliDate)}
              placeholder="Select date of birth"
              clearable
              captionLayout="dropdown"
              fromDate={new NepaliDate()}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <button
        type="submit"
        className="rounded bg-primary px-4 py-2 text-sm text-white"
      >
        Submit
      </button>
    </form>
  );
}

// ─── 2. Date range ────────────────────────────────────────────────────────────

const rangeSchema = z
  .object({
    from: z.union([z.instanceof(NepaliDate), z.undefined()]),
    to: z.union([z.instanceof(NepaliDate), z.undefined()]).optional(),
  })
  .refine((r) => !!r.from, { message: "Start date is required" })
  .refine((r) => !!r.to, { message: "End date is required" });

export function DateRangeForm() {
  const form = useForm({
    defaultValues: {
      leaveRange: { from: undefined, to: undefined } as NepaliDateRange,
    },
    onSubmit: ({ value }) => {
      const { from, to } = value.leaveRange;
      alert(`Leave: ${from!.toString()} → ${to!.toString()}`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="leaveRange"
        validators={{
          onChange: ({ value }) => {
            const result = rangeSchema.safeParse(value);
            return result.success ? undefined : result.error.errors[0].message;
          },
        }}
      >
        {(field) => (
          <div className="space-y-1">
            <label className="text-sm font-medium">Leave Period</label>
            <NepaliDatePicker
              mode="range"
              value={field.state.value}
              onChange={(d) => field.handleChange(d as NepaliDateRange)}
              placeholder="Select leave dates"
              numberOfMonths={2}
              clearable
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-500">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <button
        type="submit"
        className="rounded bg-primary px-4 py-2 text-sm text-white"
      >
        Submit
      </button>
    </form>
  );
}

// ─── 3. Single date + time picker ─────────────────────────────────────────────

const appointmentDateSchema = z.instanceof(NepaliDate, {
  message: "Appointment date is required",
});

const appointmentTimeSchema = z
  .object({ hours: z.number(), minutes: z.number() })
  .refine((t) => t.hours !== 0 || t.minutes !== 0, {
    message: "Please select an appointment time",
  });

export function AppointmentForm() {
  const form = useForm({
    defaultValues: {
      appointmentDate: undefined as NepaliDate | undefined,
      appointmentTime: { hours: 0, minutes: 0 } as TimeValue,
    },
    onSubmit: ({ value }) => {
      const { hours, minutes } = value.appointmentTime;
      const pad = (n: number) => String(n).padStart(2, "0");
      alert(
        `Appointment: ${value.appointmentDate!.toString()} at ${pad(hours)}:${pad(minutes)}`,
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="space-y-1">
        <label className="text-sm font-medium">Appointment Date &amp; Time</label>

        <form.Field
          name="appointmentDate"
          validators={{
            onChange: ({ value }) => {
              const result = appointmentDateSchema.safeParse(value);
              return result.success ? undefined : result.error.errors[0].message;
            },
          }}
        >
          {(dateField) => (
            <form.Field
              name="appointmentTime"
              validators={{
                onChange: ({ value }) => {
                  const result = appointmentTimeSchema.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.errors[0].message;
                },
              }}
            >
              {(timeField) => (
                <>
                  <NepaliDatePicker
                    value={dateField.state.value}
                    onChange={(d) => dateField.handleChange(d as NepaliDate)}
                    showTimePicker
                    timeValue={timeField.state.value}
                    onTimeChange={(t) =>
                      timeField.handleChange(t as TimeValue)
                    }
                    placeholder="Select date and time"
                    clearable
                  />
                  {dateField.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-500">
                      {dateField.state.meta.errors[0]}
                    </p>
                  )}
                  {timeField.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-500">
                      {timeField.state.meta.errors[0]}
                    </p>
                  )}
                </>
              )}
            </form.Field>
          )}
        </form.Field>
      </div>

      <button
        type="submit"
        className="rounded bg-primary px-4 py-2 text-sm text-white"
      >
        Book Appointment
      </button>
    </form>
  );
}
