"use client";

import { useState, useEffect } from "react";
import Logo from "./Logo";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="loading-screen fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="loading-logo">
        <Logo size={120} />
      </div>
    </div>
  );
}
