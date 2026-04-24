import Link from "next/link";
import { ReactNode } from "react";
import AdminNav from "./AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-scope min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur border-b border-[var(--rule)]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="logo-mark">
            Dip <span className="amp">&amp;</span> Sprinkle
            <span className="hidden sm:inline ml-2 text-[11px] tracking-[0.28em] uppercase text-ink-soft font-sans font-medium">
              Admin
            </span>
          </Link>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="text-[11px] tracking-[0.22em] uppercase text-ink-soft hover:text-cherry transition-colors font-medium"
            >
              Sign out
            </button>
          </form>
        </div>
        <AdminNav />
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">{children}</main>
    </div>
  );
}
