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

const CHERRY = "#B94A64";
const ROSE_DEEP = "#8F3550";
const MINT = "#9FC8B8";
const INK = "#3A1F18";
const PIE_COLORS = ["#B94A64", "#9FC8B8", "#F7C6CE", "#F5D76E", "#6B4A3A", "#FBE3E7"];

export interface MonthlyPoint {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
  orders: number;
}

export interface SlicePoint {
  name: string;
  value: number;
}

export interface DayOfWeekPoint {
  day: string;
  placed: number;
  needed: number;
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

function countFmt(v: number | string | readonly (number | string)[] | undefined): string {
  if (v === undefined || v === null) return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

const tooltipStyle = {
  borderRadius: 12,
  fontSize: 13,
  border: "1px solid rgba(58,31,24,0.12)",
  background: "#FBF6EE",
  color: INK,
  fontFamily: "var(--font-dm-sans), DM Sans, system-ui",
};

const axisTick = { fontSize: 12, fill: "#6B4A3A" };

function EmptyChart({ height }: { height: number }) {
  return (
    <div style={{ height }} className="flex items-center justify-center text-sm text-ink-soft">
      No data for this period.
    </div>
  );
}

export function MonthlyBars({ data }: { data: MonthlyPoint[] }) {
  if (!data.length || data.every((d) => d.revenue === 0 && d.expenses === 0)) {
    return <EmptyChart height={280} />;
  }
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(58,31,24,0.08)" vertical={false} />
          <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={{ stroke: "rgba(58,31,24,0.12)" }} />
          <YAxis tickFormatter={dollarTick} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip formatter={dollarFmt} contentStyle={tooltipStyle} cursor={{ fill: "rgba(185,74,100,0.06)" }} />
          <Legend wrapperStyle={{ fontSize: 12, color: INK, paddingTop: 8 }} />
          <Bar dataKey="revenue" name="Revenue" fill={CHERRY} radius={[6, 6, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill={MINT} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NetBars({ data }: { data: MonthlyPoint[] }) {
  if (!data.length || data.every((d) => d.net === 0)) {
    return <EmptyChart height={220} />;
  }
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(58,31,24,0.08)" vertical={false} />
          <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={{ stroke: "rgba(58,31,24,0.12)" }} />
          <YAxis tickFormatter={dollarTick} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip formatter={dollarFmt} contentStyle={tooltipStyle} cursor={{ fill: "rgba(185,74,100,0.06)" }} />
          <Bar dataKey="net" name="Net">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.net >= 0 ? INK : ROSE_DEEP} radius={6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersBars({ data }: { data: MonthlyPoint[] }) {
  if (!data.length || data.every((d) => d.orders === 0)) {
    return <EmptyChart height={220} />;
  }
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(58,31,24,0.08)" vertical={false} />
          <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={{ stroke: "rgba(58,31,24,0.12)" }} />
          <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip formatter={countFmt} contentStyle={tooltipStyle} cursor={{ fill: "rgba(185,74,100,0.06)" }} />
          <Bar dataKey="orders" name="Orders" fill={CHERRY} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DayOfWeekBars({ data }: { data: DayOfWeekPoint[] }) {
  if (!data.length || data.every((d) => d.placed === 0 && d.needed === 0)) {
    return <EmptyChart height={240} />;
  }
  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(58,31,24,0.08)" vertical={false} />
          <XAxis dataKey="day" tick={axisTick} tickLine={false} axisLine={{ stroke: "rgba(58,31,24,0.12)" }} />
          <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
          <Tooltip formatter={countFmt} contentStyle={tooltipStyle} cursor={{ fill: "rgba(185,74,100,0.06)" }} />
          <Legend wrapperStyle={{ fontSize: 12, color: INK, paddingTop: 8 }} />
          <Bar dataKey="placed" name="Placed" fill={CHERRY} radius={[6, 6, 0, 0]} />
          <Bar dataKey="needed" name="Needed" fill={MINT} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SlicePie({ data }: { data: SlicePoint[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-ink-soft py-12 text-center">No data for this period.</div>;
  }
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={78}
            innerRadius={40}
            paddingAngle={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#FBF6EE" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip formatter={dollarFmt} contentStyle={tooltipStyle} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 12, color: INK }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
