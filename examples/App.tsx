import { SingleDateForm, DateRangeForm, AppointmentForm } from "./with-react-hook-form";
import {
  SingleDateForm as TSSingleDateForm,
  DateRangeForm as TSDateRangeForm,
  AppointmentForm as TSAppointmentForm,
} from "./with-tanstack-form";

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-12">

      <section>
        <h1 className="mb-6 text-2xl font-semibold text-foreground">
          Nepali DatePicker + React Hook Form
        </h1>
        <div className="grid max-w-4xl gap-8 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Single Date
            </h2>
            <SingleDateForm />
          </div>

          <div className="rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Date Range
            </h2>
            <DateRangeForm />
          </div>

          <div className="rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Date + Time
            </h2>
            <AppointmentForm />
          </div>
        </div>
      </section>

      <section>
        <h1 className="mb-6 text-2xl font-semibold text-foreground">
          Nepali DatePicker + TanStack Form
        </h1>
        <div className="grid max-w-4xl gap-8 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Single Date
            </h2>
            <TSSingleDateForm />
          </div>

          <div className="rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Date Range
            </h2>
            <TSDateRangeForm />
          </div>

          <div className="rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Date + Time
            </h2>
            <TSAppointmentForm />
          </div>
        </div>
      </section>

    </div>
  );
}
