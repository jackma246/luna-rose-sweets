"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function MobileFilters({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const search = useSearchParams().toString();

  // close drawer after any navigation (category click)
  useEffect(() => {
    const id = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname, search]);

  return (
    <aside className={`filters${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="filters-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Filter &amp; browse
      </button>
      <div className="filters-body">{children}</div>
    </aside>
  );
}
