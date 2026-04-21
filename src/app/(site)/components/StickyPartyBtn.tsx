"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StickyPartyBtn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      padding: "0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(8px)",
      borderTop: "1px solid var(--border, #e8e4de)",
      display: "flex",
      justifyContent: "center",
    }}>
      <Link
        href="/products/party-set"
        className="btn btn-primary"
        style={{ width: "100%", maxWidth: 480, justifyContent: "center", fontSize: "1rem", padding: "0.9rem 1.5rem" }}
      >
        Shop Party Sets →
      </Link>
    </div>
  );
}
