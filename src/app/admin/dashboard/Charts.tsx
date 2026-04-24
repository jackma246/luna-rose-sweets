"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ROSE = "#c5005d";
const MINT = "#A8D8CB";
const PIE_COLORS = ["#c5005d", "#A8D8CB", "#F2B5C5", "#5C3828", "#f9d4dc", "#7c4f3a"];

export interface MonthlyPoint {
  month: string; // "Apr 2026"
  revenue: number;
  expenses: number;
  net: number;
}

export interface SlicePoint {
  name: string;
  value: number;
}

function dollarTick(v: number) {
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

function dollarFmt(v: number | string | readonly (number | string)[] | undefined): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return v.map((x) => dollarFmt(x as number | string)).join(", ");
  const n = typeof v === "string" ? Number(v) : (v as number);
  return `$${(n || 0).toFixed(2)}`;
}

export function MonthlyBars({ data }: { data: MonthlyPoint[] }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#f0ebe4" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#737373" }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
          <YAxis tickFormatter={dollarTick} tick={{ fontSize: 12, fill: "#737373" }} tickLine={false} axisLine={false} />
          <Tooltip formatter={dollarFmt} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="revenue" name="Revenue" fill={ROSE} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill={MINT} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NetBars({ data }: { data: MonthlyPoint[] }) {
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#f0ebe4" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#737373" }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
          <YAxis tickFormatter={dollarTick} tick={{ fontSize: 12, fill: "#737373" }} tickLine={false} axisLine={false} />
          <Tooltip formatter={dollarFmt} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
          <Bar dataKey="net" name="Net">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.net >= 0 ? "#5C3828" : "#dc2626"} radius={4} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SlicePie({ data }: { data: SlicePoint[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-neutral-400 py-12 text-center">No data for this period.</div>;
  }
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => e.name}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={dollarFmt} contentStyle={{ borderRadius: 8, fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
