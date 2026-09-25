"use client";

import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  MIN_LEAD_DAYS,
  formatFriendlyDateKey,
  isBlockedStatus,
  leadTimeMessage,
  minRequestableDateKey,
  type AvailabilityStatus,
} from "@/lib/availabilityShared";
import { addDaysToKey, formatDateKey, isDateKey, todayKey } from "@/lib/businessDate";

type PublicRecord = { date: string; status: AvailabilityStatus };

// Same palette as the homepage AvailabilityCalendarClient so the two read as one system.
const statusColors: Record<"limited" | "fully_booked" | "closed", { bg: string; color: string; border: string }> = {
  limited: { bg: "#fff6d8", color: "#8a6200", border: "#f0d27a" },
  fully_booked: { bg: "#f1e3df", color: "#9c7d78", border: "#dcc4c0" },
  closed: { bg: "#eee9e2", color: "#70675d", border: "#d8d0c6" },
};

const statusLabels = { limited: "Limited", fully_booked: "Booked", closed: "Closed" } as const;

// Dates are calendar days in the bakery's zone (America/Los_Angeles), whatever zone the browser is in.
function shortDate(iso: string) {
  return formatDateKey(iso, { month: "short", day: "numeric" });
}

const friendlyDate = formatFriendlyDateKey;

function blockedMessage(iso: string, status: AvailabilityStatus) {
  return status === "closed"
    ? `We're closed on ${friendlyDate(iso)} - please choose another day.`
    : `${friendlyDate(iso)} is fully booked - please choose another day.`;
}

export type RequestDatePickerProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  /** Reports whether the current value is acceptable (not blocked) and whether availability is still loading. */
  onValidityChange?: (state: { valid: boolean; loading: boolean }) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Helper text styling: "site" = cart modal (inputs carry bottom margin), "contact" = contact form, "classic" = Tailwind theme. */
  theme?: "site" | "contact" | "classic";
  /** Show the upcoming closed/booked days list under the input. Default true. */
  showUpcoming?: boolean;
  /** Minimum notice in days (the longest lead time of the items being ordered). Default MIN_LEAD_DAYS. */
  leadDays?: number;
};

export default function RequestDatePicker({
  id,
  name,
  value,
  onChange,
  onValidityChange,
  required,
  disabled,
  className,
  style,
  theme = "site",
  showUpcoming = true,
  leadDays = MIN_LEAD_DAYS,
}: RequestDatePickerProps) {
  const [records, setRecords] = useState<PublicRecord[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = useMemo(() => todayKey(), []);
  const minDate = useMemo(() => minRequestableDateKey(new Date(), leadDays), [leadDays]);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const minDateRef = useRef(minDate);
  const leadDaysRef = useRef(leadDays);
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    minDateRef.current = minDate;
    leadDaysRef.current = leadDays;
  });

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/availability", { signal: ctrl.signal, cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: { ok: boolean; dates: PublicRecord[] }) => {
        const dates = json.dates ?? [];
        setRecords(dates);
        // If a day was already set before the calendar loaded (picked quickly, or prefilled from a link),
        // re-check it now.
        const current = valueRef.current;
        if (!current) return;
        if (!isDateKey(current)) {
          onChangeRef.current("");
          return;
        }
        if (current < minDateRef.current) {
          setError(leadTimeMessage(leadDaysRef.current, minDateRef.current));
          onChangeRef.current("");
          return;
        }
        const status = dates.find((r) => r.date === current)?.status;
        if (isBlockedStatus(status)) {
          setError(blockedMessage(current, status));
          onChangeRef.current("");
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setLoadFailed(true);
        setRecords([]);
      });
    return () => ctrl.abort();
  }, []);

  const byDate = useMemo(() => new Map((records ?? []).map((r) => [r.date, r.status])), [records]);
  const loading = records === null;
  const selectedStatus = value ? byDate.get(value) : undefined;
  const selectedBlocked = isBlockedStatus(selectedStatus);

  useEffect(() => {
    onValidityChange?.({ valid: !selectedBlocked, loading });
    // onValidityChange is intentionally excluded: callers pass inline lambdas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlocked, loading]);

  function handleChange(next: string) {
    setError(null);
    if (!next) {
      onChange("");
      return;
    }
    if (next < minDate) {
      // Native date inputs emit change events for partial years while typing ("0026"),
      // so do not shout yet - the blur handler reports short notice once the user is done.
      onChange("");
      return;
    }
    const status = byDate.get(next);
    if (isBlockedStatus(status)) {
      setError(blockedMessage(next, status));
      onChange("");
      return;
    }
    onChange(next);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw && raw < minDate) {
      setError(leadTimeMessage(leadDays, minDate));
    }
  }

  const upcoming = useMemo(() => {
    if (!records) return [];
    const start = today;
    const end = addDaysToKey(today, 60);
    return records
      .filter((r) => r.date >= start && r.date <= end && r.status !== "available")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [records, today]);

  const helpStyle: CSSProperties =
    theme === "site"
      ? { fontSize: "0.78rem", margin: "-0.5rem 0 0.9rem", lineHeight: 1.45 }
      : theme === "contact"
        ? { fontSize: "0.78rem", margin: "0.45rem 0 0", lineHeight: 1.45 }
        : {};
  const helpClass = theme === "classic" ? "text-xs mt-1" : undefined;

  return (
    <div>
      <input
        id={id}
        name={name}
        type="date"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        min={minDate}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={id ? `${id}-help` : undefined}
        className={className}
        style={style}
      />

      {error && (
        <p role="alert" className={helpClass} style={{ ...helpStyle, color: "#b0343c", fontWeight: 500 }}>
          {error}
        </p>
      )}

      {!error && selectedStatus === "limited" && (
        <p className={helpClass} style={{ ...helpStyle, color: statusColors.limited.color }}>
          Limited availability on {friendlyDate(value)} - we&rsquo;ll confirm by email.
        </p>
      )}

      {showUpcoming && upcoming.length > 0 && (
        <div id={id ? `${id}-help` : undefined} className={helpClass} style={{ ...helpStyle, display: "flex", flexWrap: "wrap", gap: "0.3rem", alignItems: "center" }}>
          <span style={{ opacity: 0.6, marginRight: "0.15rem" }}>Coming up:</span>
          {upcoming.map((r) => {
            const c = statusColors[r.status as keyof typeof statusColors];
            return (
              <span
                key={r.date}
                title={`${statusLabels[r.status as keyof typeof statusLabels]} on ${friendlyDate(r.date)}`}
                style={{
                  background: c.bg,
                  color: c.color,
                  border: `1px solid ${c.border}`,
                  borderRadius: 999,
                  padding: "0.1rem 0.55rem",
                  fontSize: "0.72rem",
                  whiteSpace: "nowrap",
                }}
              >
                {shortDate(r.date)} · {statusLabels[r.status as keyof typeof statusLabels]}
              </span>
            );
          })}
        </div>
      )}

      {loadFailed && (
        <p className={helpClass} style={{ ...helpStyle, opacity: 0.6 }}>
          Couldn&rsquo;t load our calendar - we&rsquo;ll double-check the date when you send your request.
        </p>
      )}
    </div>
  );
}
