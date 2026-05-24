"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AvailabilityStatus = "available" | "limited" | "fully_booked" | "closed";
type AvailabilityRecord = { date: string; status: AvailabilityStatus; note?: string | null };

const statusLabels: Record<AvailabilityStatus, string> = {
  available: "Available",
  limited: "Limited",
  fully_booked: "Fully Booked",
  closed: "Closed",
};

type VisibleStatus = Exclude<AvailabilityStatus, "available">;

const visibleStatuses: VisibleStatus[] = ["limited", "fully_booked", "closed"];

const statusColors: Record<VisibleStatus, { bg: string; color: string; border: string }> = {
  limited: { bg: "#fff6d8", color: "#8a6200", border: "#f0d27a" },
  fully_booked: { bg: "#ffe7ec", color: "#a32643", border: "#f2a9b9" },
  closed: { bg: "#eee9e2", color: "#70675d", border: "#d8d0c6" },
};

function getStatusColors(status: AvailabilityStatus | undefined) {
  if (!status || status === "available") return null;
  return statusColors[status];
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
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

export default function AvailabilityCalendarClient({ records }: { records: AvailabilityRecord[] }) {
  const today = useMemo(() => new Date(), []);
  const currentMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const [monthOffset, setMonthOffset] = useState(0);
  const calendarMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
  const byDate = useMemo(() => new Map(records.map((r) => [r.date, r])), [records]);

  return (
    <section style={{ padding: "3rem 1.25rem", background: "#fffaf3", borderTop: "1px solid var(--border, #e8e4de)", borderBottom: "1px solid var(--border, #e8e4de)" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <div className="kicker">Availability</div>
        <h2 style={{ margin: "0.25rem 0 0.5rem" }}>
          Check your <em>order date.</em>
        </h2>
        <p style={{ margin: "0 auto 1.5rem", maxWidth: 520, fontSize: "0.9rem", opacity: 0.65, lineHeight: 1.6 }}>
          Dates are updated manually and availability is confirmed after your order request. For custom designs, earlier is always better.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {visibleStatuses.map((key) => (
            <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 700 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: statusColors[key].bg, border: `1px solid ${statusColors[key].border}` }} />
              {statusLabels[key]}
            </span>
          ))}
        </div>

        <div style={{ border: "1px solid var(--border, #e8e4de)", borderRadius: "1.4rem", background: "#fff", padding: "1rem", boxShadow: "0 12px 35px rgba(70, 45, 25, 0.06)", textAlign: "left" }}>
          <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 44px", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
            <button
              type="button"
              onClick={() => setMonthOffset((value) => Math.max(0, value - 1))}
              disabled={monthOffset === 0}
              aria-label="Previous month"
              style={{ width: 44, height: 44, borderRadius: 99, border: "1px solid var(--border, #e8e4de)", background: monthOffset === 0 ? "#f4f0ea" : "#fff", color: monthOffset === 0 ? "#b5aaa0" : "inherit", fontSize: "1.4rem", fontWeight: 700 }}
            >
              ‹
            </button>
            <h3 style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-fraunces)", fontSize: "1.55rem" }}>
              {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <button
              type="button"
              onClick={() => setMonthOffset((value) => Math.min(11, value + 1))}
              disabled={monthOffset === 11}
              aria-label="Next month"
              style={{ width: 44, height: 44, borderRadius: 99, border: "1px solid var(--border, #e8e4de)", background: monthOffset === 11 ? "#f4f0ea" : "#fff", color: monthOffset === 11 ? "#b5aaa0" : "inherit", fontSize: "1.4rem", fontWeight: 700 }}
            >
              ›
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.35rem", textAlign: "center", fontSize: "0.65rem", opacity: 0.5, fontWeight: 700 }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.35rem", marginTop: "0.45rem" }}>
            {buildMonthDays(calendarMonth).map((day, index) => {
              if (!day) return <div key={`blank-${index}`} style={{ aspectRatio: "1 / 1" }} />;
              const record = byDate.get(dateKey(day));
              const colors = getStatusColors(record?.status);
              const isPast = day < new Date(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <div
                  key={dateKey(day)}
                  title={record?.note || (record ? statusLabels[record.status] : "Request to confirm")}
                  style={{
                    aspectRatio: "1 / 1",
                    borderRadius: "0.75rem",
                    border: `1px solid ${colors?.border || "#eee8df"}`,
                    background: colors?.bg || (isPast ? "#f4f0ea" : "#fff"),
                    color: colors?.color || (isPast ? "#b5aaa0" : "inherit"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    opacity: isPast && !record ? 0.45 : 1,
                  }}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/contact" className="btn btn-primary" style={{ fontSize: "0.95rem", padding: "0.85rem 1.75rem" }}>
            Request Your Date →
          </Link>
        </div>
      </div>
    </section>
  );
}
