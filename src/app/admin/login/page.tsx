import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center bg-neutral-50 px-5">
          <div className="text-sm text-neutral-500">Loading…</div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
