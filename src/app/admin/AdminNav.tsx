"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Orders", match: (p: string) => p === "/admin" || p.startsWith("/admin/orders") },
  { href: "/admin/expenses", label: "Expenses", match: (p: string) => p.startsWith("/admin/expenses") },
  { href: "/admin/dashboard", label: "Dashboard", match: (p: string) => p.startsWith("/admin/dashboard") },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="max-w-5xl mx-auto px-4">
      <div className="flex gap-6 -mb-px">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`relative py-3 text-[12px] font-medium uppercase tracking-[0.2em] transition-colors ${
                active ? "text-cherry" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
              {active && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-cherry" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
