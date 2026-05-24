import AvailabilityManager from "./AvailabilityManager";

export default function AvailabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-ink-soft">Calendar</p>
        <h1 className="mt-1 font-serif text-4xl">Availability</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Mark dates as available, limited, fully booked, or closed. These dates show on the website homepage.
        </p>
      </div>
      <AvailabilityManager />
    </div>
  );
}
