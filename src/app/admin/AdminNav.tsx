"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Orders", match: (p: string) => p === "/admin" || p.startsWith("/admin/orders") },
  { href: "/admin/expenses", label: "Expenses", match: (p: string) => p.startsWith("/admin/expenses") },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="max-w-5xl mx-auto px-4">
      <div className="flex gap-1 -mb-px">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-rose-500 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
