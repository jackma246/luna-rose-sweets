"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function V2Header({ current }: { current?: string }) {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Shop", key: "shop" },
    { href: "/products", label: "All Products", key: "products" },
    { href: "/contact", label: "Custom Orders", key: "custom" },
    { href: "/about", label: "Our Story", key: "about" },
    { href: "/contact", label: "Contact", key: "contact" },
  ];

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="ribbon">
        Free delivery over $85 <span>✿</span> Order by Thursday for weekend pickup
      </div>
      <header className="site-header">
        <div className="bar">
          <button
            className="nav-toggle"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="3" y1="2" x2="17" y2="12" />
                  <line x1="17" y1="2" x2="3" y2="12" />
                </>
              ) : (
                <>
                  <line x1="2" y1="3" x2="18" y2="3" />
                  <line x1="2" y1="7" x2="18" y2="7" />
                  <line x1="2" y1="11" x2="18" y2="11" />
                </>
              )}
            </svg>
          </button>

          <Link href="/" className="logo-placeholder">
            Dip <span className="amp">&amp;</span> Sprinkle
          </Link>

          <nav className="nav">
            {navLinks.slice(0, 4).map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={current === link.key ? "current" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="icons">
            <Link href="/cart" className="cart-link" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`mobile-drawer ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
          <nav>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={current === link.key ? "current" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
