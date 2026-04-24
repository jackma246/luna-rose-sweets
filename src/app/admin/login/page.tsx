import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="admin-scope min-h-dvh flex items-center justify-center bg-paper px-5">
          <div className="text-sm text-ink-soft">Loading…</div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
