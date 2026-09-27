import Link from "next/link";
import { ReactNode } from "react";
import AdminNav from "./AdminNav";
import { isAuthenticated } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Signed out, the only reachable admin page is /admin/login (every other page
  // redirects there via requireAdminPage), so render it without the admin chrome:
  // no nav links to protected pages and no "Sign out" button.
  // This is presentation only; auth is enforced per page and per API route.
  if (!(await isAuthenticated())) {
    return <div className="admin-scope min-h-dvh bg-paper text-ink">{children}</div>;
  }

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
              className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.22em] uppercase text-ink-soft hover:text-cherry transition-colors font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
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
