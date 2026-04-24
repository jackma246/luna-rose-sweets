import Link from "next/link";
import { ReactNode } from "react";
import AdminNav from "./AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="font-semibold">
            Dip & Sprinkle <span className="text-neutral-400 font-normal">· admin</span>
          </Link>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900">
              Sign out
            </button>
          </form>
        </div>
        <AdminNav />
      </header>
      <main className="max-w-5xl mx-auto px-4 py-5 pb-24">{children}</main>
    </div>
  );
}
