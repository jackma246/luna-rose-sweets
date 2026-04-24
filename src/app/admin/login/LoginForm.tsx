"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError(true);
        setLoading(false);
        return;
      }
      router.replace(next);
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-neutral-50 px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-2xl p-7 shadow-sm border border-neutral-200">
        <h1 className="text-xl font-semibold mb-1">Dip & Sprinkle admin</h1>
        <p className="text-sm text-neutral-500 mb-6">Enter the admin password to continue.</p>

        <label className="block text-sm font-medium mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          disabled={loading}
          className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        {error && <p className="text-sm text-red-600 mt-2">Incorrect password.</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full bg-neutral-900 text-white rounded-full py-2.5 font-medium disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
