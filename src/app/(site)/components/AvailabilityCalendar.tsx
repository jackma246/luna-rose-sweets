import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { AvailabilityStatus } from "@/generated/prisma";

const statusLabels: Record<AvailabilityStatus, string> = {
  available: "Available",
  limited: "Limited",
  fully_booked: "Fully Booked",
  closed: "Closed",
};

const statusColors: Record<AvailabilityStatus, { bg: string; color: string; border: string }> = {
  available: { bg: "#edf8ef", color: "#2f7a45", border: "#b8dfc1" },
  limited: { bg: "#fff6d8", color: "#8a6200", border: "#f0d27a" },
  fully_booked: { bg: "#ffe7ec", color: "#a32643", border: "#f2a9b9" },
  closed: { bg: "#eee9e2", color: "#70675d", border: "#d8d0c6" },
};

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

export default async function AvailabilityCalendar() {
  const today = new Date();
  const month = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 1);
  const records = await prisma.availabilityDate.findMany({
    where: { date: { gte: month, lt: monthEnd } },
    orderBy: { date: "asc" },
  });
  const byDate = new Map(records.map((r) => [r.date.toISOString().slice(0, 10), r]));
  const months = [month, nextMonth];

  return (
    <section style={{ padding: "3rem 1.25rem", background: "#fffaf3", borderTop: "1px solid var(--border, #e8e4de)", borderBottom: "1px solid var(--border, #e8e4de)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <div className="kicker">Availability</div>
        <h2 style={{ margin: "0.25rem 0 0.5rem" }}>
          Check your <em>order date.</em>
        </h2>
        <p style={{ margin: "0 auto 1.5rem", maxWidth: 560, fontSize: "0.9rem", opacity: 0.65, lineHeight: 1.6 }}>
          Dates are updated manually and availability is confirmed after your order request. For custom designs, earlier is always better.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {(Object.keys(statusLabels) as AvailabilityStatus[]).map((key) => (
            <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 700 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: statusColors[key].bg, border: `1px solid ${statusColors[key].border}` }} />
              {statusLabels[key]}
            </span>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", textAlign: "left" }}>
          {months.map((calendarMonth) => (
            <div key={calendarMonth.toISOString()} style={{ border: "1px solid var(--border, #e8e4de)", borderRadius: "1.4rem", background: "#fff", padding: "1rem", boxShadow: "0 12px 35px rgba(70, 45, 25, 0.06)" }}>
              <h3 style={{ margin: "0 0 0.8rem", textAlign: "center", fontFamily: "var(--font-fraunces)", fontSize: "1.25rem" }}>
                {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.35rem", textAlign: "center", fontSize: "0.65rem", opacity: 0.5, fontWeight: 700 }}>
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <div key={`${day}-${index}`}>{day}</div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.35rem", marginTop: "0.45rem" }}>
                {buildMonthDays(calendarMonth).map((day, index) => {
                  if (!day) return <div key={`blank-${index}`} style={{ aspectRatio: "1 / 1" }} />;
                  const record = byDate.get(dateKey(day));
                  const colors = record ? statusColors[record.status] : null;
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
          ))}
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
