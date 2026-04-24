export interface MonthOption {
  value: string;
  label: string;
}

export function lastNMonthOptions(n: number, now = new Date()): MonthOption[] {
  const out: MonthOption[] = [];
  const cur = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let i = 0; i < n; i++) {
    const d = new Date(cur);
    d.setMonth(d.getMonth() - i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    out.push({ value, label });
  }
  return out;
}

export function parseMonth(value: string | undefined | null): { start: Date; end: Date } | null {
  if (!value || value === "all") return null;
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  return { start, end };
}
