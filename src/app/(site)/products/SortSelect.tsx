"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "a-z", label: "A → Z" },
] as const;

export default function SortSelect() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("sort") ?? "featured";

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString());
    if (e.target.value === "featured") next.delete("sort");
    else next.set("sort", e.target.value);
    const qs = next.toString();
    router.replace(qs ? `/products?${qs}` : "/products", { scroll: false });
  }

  return (
    <select value={current} onChange={onChange} aria-label="Sort products">
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
