import { Suspense } from "react";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAuthenticated()) redirect("/admin");
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
