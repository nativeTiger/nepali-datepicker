import { SingleDateForm, DateRangeForm, AppointmentForm } from "./with-react-hook-form";

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="mb-8 text-2xl font-semibold text-foreground">
        Nepali DatePicker + React Hook Form
      </h1>

      <div className="grid max-w-4xl gap-8 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Single Date
          </h2>
          <SingleDateForm />
        </section>

        <section className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Date Range
          </h2>
          <DateRangeForm />
        </section>

        <section className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Date + Time
          </h2>
          <AppointmentForm />
        </section>
      </div>
    </div>
  );
}
