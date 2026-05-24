"use client";

import { useEffect, useMemo, useState } from "react";

type AvailabilityStatus = "available" | "limited" | "fully_booked" | "closed";
type SavedDate = { id?: string; date: string; status: AvailabilityStatus; note?: string | null };

const statusLabels: Record<AvailabilityStatus, string> = {
  available: "Available",
  limited: "Limited",
  fully_booked: "Fully Booked",
  closed: "Closed",
};

const statusClasses: Record<AvailabilityStatus, string> = {
  available: "bg-green-100 text-green-800 border-green-200",
  limited: "bg-amber-100 text-amber-800 border-amber-200",
  fully_booked: "bg-rose-100 text-rose-800 border-rose-200",
  closed: "bg-stone-200 text-stone-700 border-stone-300",
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function buildMonthDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const days: Array<Date | null> = [];
  for (let i = 0; i < first.getDay(); i += 1) days.push(null);
  for (let day = 1; day <= last.getDate(); day += 1) days.push(new Date(month.getFullYear(), month.getMonth(), day));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export default function AvailabilityManager() {
  const [month, setMonth] = useState(() => new Date());
  const [dates, setDates] = useState<Record<string, SavedDate>>({});
  const [selectedDate, setSelectedDate] = useState<string>(dateKey(new Date()));
  const [status, setStatus] = useState<AvailabilityStatus>("available");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const days = useMemo(() => buildMonthDays(month), [month]);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/availability?month=${monthKey(month)}`)
      .then((res) => res.json())
      .then((data: { dates?: SavedDate[] }) => {
        if (!active) return;
        const next: Record<string, SavedDate> = {};
        for (const item of data.dates ?? []) next[item.date] = item;
        setDates(next);
      })
      .catch(() => setMessage("Could not load availability."));
    return () => {
      active = false;
    };
  }, [month]);

  function selectDay(day: Date) {
    const key = dateKey(day);
    const saved = dates[key];
    setSelectedDate(key);
    setStatus(saved?.status ?? "available");
    setNote(saved?.note ?? "");
    setMessage("");
  }

  async function save(nextStatus: AvailabilityStatus | "clear") {
    setMessage("Saving...");
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, status: nextStatus, note }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setMessage(data.error || "Could not save.");
      return;
    }
    setDates((prev) => {
      const next = { ...prev };
      if (nextStatus === "clear") delete next[selectedDate];
      else next[selectedDate] = { date: selectedDate, status: nextStatus, note };
      return next;
    });
    setMessage(nextStatus === "clear" ? "Date cleared." : "Availability saved.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
      <section className="rounded-3xl border border-[var(--rule)] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button className="rounded-full border px-3 py-2 text-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button>
          <h2 className="font-serif text-2xl">{monthLabel(month)}</h2>
          <button className="rounded-full border px-3 py-2 text-sm" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.16em] text-ink-soft">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) return <div key={`blank-${index}`} className="aspect-square" />;
            const key = dateKey(day);
            const saved = dates[key];
            const active = key === selectedDate;
            return (
              <button
                key={key}
                onClick={() => selectDay(day)}
                className={`aspect-square rounded-2xl border p-1 text-left transition ${active ? "ring-2 ring-cherry" : "hover:border-cherry"} ${saved ? statusClasses[saved.status] : "border-[var(--rule)] bg-cream/40"}`}
              >
                <div className="text-sm font-semibold">{day.getDate()}</div>
                {saved && <div className="mt-1 hidden text-[10px] font-semibold sm:block">{statusLabels[saved.status]}</div>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--rule)] bg-white p-5 shadow-sm">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-soft">Selected date</div>
        <h3 className="mt-1 font-serif text-2xl">{selectedDate}</h3>
        <div className="mt-5 space-y-3">
          {(Object.keys(statusLabels) as AvailabilityStatus[]).map((key) => (
            <label key={key} className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 ${status === key ? statusClasses[key] : "border-[var(--rule)]"}`}>
              <span className="font-medium">{statusLabels[key]}</span>
              <input type="radio" checked={status === key} onChange={() => setStatus(key)} />
            </label>
          ))}
        </div>
        <label className="mt-5 block text-sm font-medium">Optional note</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-[var(--rule)] p-3 text-sm" placeholder="Example: Only one small order left" />
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={() => save(status)} className="rounded-full bg-cherry px-5 py-3 text-sm font-semibold text-white">Save Date</button>
          <button onClick={() => save("clear")} className="rounded-full border border-[var(--rule)] px-5 py-3 text-sm font-semibold">Clear</button>
        </div>
        {message && <p className="mt-4 text-sm text-ink-soft">{message}</p>}
      </section>
    </div>
  );
}
