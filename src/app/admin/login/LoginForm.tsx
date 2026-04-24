"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
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
      window.location.assign(next);
    } catch {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <main className="admin-scope min-h-dvh flex items-center justify-center bg-paper px-5">
      <form onSubmit={onSubmit} className="admin-card w-full max-w-sm p-8">
        <div className="logo-mark mb-1">
          Dip <span className="amp">&amp;</span> Sprinkle
        </div>
        <p className="text-sm text-ink-soft mb-7">Enter the admin password to continue.</p>

        <label className="kicker block mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
          disabled={loading}
          className="field"
        />
        {error && <p className="text-sm text-[#b91c1c] mt-2">Incorrect password.</p>}

        <button type="submit" disabled={loading} className="btn-cherry w-full justify-center mt-6 disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
