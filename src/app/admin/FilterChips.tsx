"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export interface ChipOption {
  value: string;
  label: string;
}

interface FilterChipsProps {
  param: string;
  options: ChipOption[];
  current?: string;
  variant?: "ink" | "cherry";
  /** Reset other params when this filter changes (e.g., reset page) */
  resetParams?: string[];
}

export function FilterChips({
  param,
  options,
  current,
  variant = "ink",
  resetParams = [],
}: FilterChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(value: string) {
    const params = new URLSearchParams(sp.toString());
    if (!value || value === "all") {
      params.delete(param);
    } else {
      params.set(param, value);
    }
    for (const p of resetParams) params.delete(p);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  const effective = current ?? "all";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${isPending ? "opacity-70" : ""}`}>
      {options.map((opt) => {
        const active = effective === opt.value || (effective === "all" && opt.value === "all");
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setParam(opt.value)}
            className={`chip ${active ? `active ${variant === "cherry" ? "chip-cherry" : ""}` : ""}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface FilterSelectProps {
  param: string;
  options: ChipOption[];
  current?: string;
  placeholder?: string;
}

export function FilterSelect({ param, options, current, placeholder }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setParam(value: string) {
    const params = new URLSearchParams(sp.toString());
    if (!value || value === "all") {
      params.delete(param);
    } else {
      params.set(param, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <select
      value={current ?? "all"}
      onChange={(e) => setParam(e.target.value)}
      disabled={isPending}
      className={`field max-w-[220px] cursor-pointer ${isPending ? "opacity-70" : ""}`}
    >
      <option value="all">{placeholder ?? "All"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
