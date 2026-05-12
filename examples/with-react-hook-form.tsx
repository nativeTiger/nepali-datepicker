/**
 * Examples: NepaliDatePicker + React Hook Form
 *
 * Covers:
 *  1. Single date (required)
 *  2. Date range (required)
 *  3. Single date + time picker
 *
 * Dependencies (add to your project):
 *   pnpm add react-hook-form @hookform/resolvers zod nepali-date-converter
 */

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import NepaliDate from "nepali-date-converter";

import {
  NepaliDatePicker,
  type NepaliDateRange,
  type TimeValue,
} from "react-bs-calendar";

// ─── 1. Single date ───────────────────────────────────────────────────────────

const singleSchema = z.object({
  dob: z
    .instanceof(NepaliDate, { message: "Date of birth is required" })
    .refine((d) => d.getYear() <= 2082, {
      message: "Date must not be in the future",
    }),
});

type SingleFormValues = z.infer<typeof singleSchema>;

export function SingleDateForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SingleFormValues>({
    resolver: zodResolver(singleSchema),
  });

  const onSubmit = (data: SingleFormValues) => {
    console.log("Submitted:", data.dob.toString());
    alert(`Selected date: ${data.dob.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Date of Birth</label>
        <Controller
          name="dob"
          control={control}
          render={({ field }) => (
            <NepaliDatePicker
              value={field.value}
              onChange={(d) => field.onChange(d as NepaliDate)}
              placeholder="Select date of birth"
              clearable
              captionLayout="dropdown"
              fromDate={new NepaliDate()}
            />
          )}
        />
        {errors.dob && (
          <p className="text-sm text-red-500">{errors.dob.message}</p>
        )}
      </div>

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

const rangeSchema = z.object({
  leaveRange: z
    .object({
      from: z.instanceof(NepaliDate).optional(),
      to: z.instanceof(NepaliDate).optional(),
    })
    .refine((r) => !!r.from, { message: "Start date is required" })
    .refine((r) => !!r.to, { message: "End date is required", path: ["to"] }),
});

type RangeFormValues = z.infer<typeof rangeSchema>;

export function DateRangeForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RangeFormValues>({
    resolver: zodResolver(rangeSchema),
    defaultValues: { leaveRange: { from: undefined, to: undefined } },
  });

  const onSubmit = (data: RangeFormValues) => {
    const { from, to } = data.leaveRange;
    alert(`Leave: ${from!.toString()} → ${to!.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Leave Period</label>
        <Controller
          name="leaveRange"
          control={control}
          render={({ field }) => (
            <NepaliDatePicker
              mode="range"
              value={field.value as NepaliDateRange}
              onChange={(d) => field.onChange(d as NepaliDateRange)}
              placeholder="Select leave dates"
              numberOfMonths={2}
              clearable
            />
          )}
        />
        {errors.leaveRange?.message && (
          <p className="text-sm text-red-500">{errors.leaveRange.message}</p>
        )}
        {errors.leaveRange?.to?.message && (
          <p className="text-sm text-red-500">{errors.leaveRange.to.message}</p>
        )}
      </div>

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

const appointmentSchema = z.object({
  appointmentDate: z.instanceof(NepaliDate, {
    message: "Appointment date is required",
  }),
  appointmentTime: z
    .object({ hours: z.number(), minutes: z.number() })
    .refine((t) => t.hours !== 0 || t.minutes !== 0, {
      message: "Please select an appointment time",
    }),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export function AppointmentForm() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointmentTime: { hours: 0, minutes: 0 },
    },
  });

  const timeValue = watch("appointmentTime") as TimeValue;

  const onSubmit = (data: AppointmentFormValues) => {
    const { hours, minutes } = data.appointmentTime;
    const pad = (n: number) => String(n).padStart(2, "0");
    alert(
      `Appointment: ${data.appointmentDate.toString()} at ${pad(hours)}:${pad(minutes)}`,
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Appointment Date &amp; Time
        </label>
        <Controller
          name="appointmentDate"
          control={control}
          render={({ field }) => (
            <NepaliDatePicker
              value={field.value}
              onChange={(d) => field.onChange(d as NepaliDate)}
              showTimePicker
              timeValue={timeValue}
              onTimeChange={(t) =>
                setValue("appointmentTime", t as TimeValue, {
                  shouldValidate: true,
                })
              }
              placeholder="Select date and time"
              clearable
            />
          )}
        />
        {errors.appointmentDate && (
          <p className="text-sm text-red-500">
            {errors.appointmentDate.message}
          </p>
        )}
        {errors.appointmentTime && (
          <p className="text-sm text-red-500">
            {errors.appointmentTime.message}
          </p>
        )}
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
