"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Logo from "./Logo";

export default function Header() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/contact", label: "Custom Orders" },
    { href: "/contact", label: "Contact Us" },
    { href: "/about", label: "About" },
  ];

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-accent/20 shadow-sm">
      {/* Desktop header */}
      <div className="hidden md:flex max-w-6xl mx-auto px-6 py-4 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="shrink-0">
            <Logo size={80} />
          </Link>
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="nav-link text-chocolate font-medium text-sm tracking-wide hover:text-mint transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link
          href="/cart"
          className="relative text-foreground hover:text-heading transition-colors"
          aria-label="Shopping cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-chocolate">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile header: hamburger | centered logo | search + cart */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        {/* Left: hamburger */}
        <button
          onClick={() => { setMobileOpen(!mobileOpen); setSearchOpen(false); }}
          className="p-1.5 text-foreground"
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </>
            )}
          </svg>
        </button>

        {/* Center: bigger logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2">
          <Logo size={90} />
        </Link>

        {/* Right: search + cart */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSearchOpen(!searchOpen); setMobileOpen(false); }}
            className="p-1.5 text-foreground hover:text-heading transition-colors"
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <Link
            href="/cart"
            className="relative p-1.5 text-foreground hover:text-heading transition-colors"
            aria-label="Shopping cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-heading text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden border-t border-accent/10 px-4 py-3 bg-card-bg">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2.5 rounded-md bg-background border border-accent/20 text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:border-heading"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-full bg-mint text-white text-sm font-bold"
            >
              Go
            </button>
          </form>
        </div>
      )}

      {/* Mobile nav dropdown — bigger with larger font */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-accent/10 px-6 py-6 bg-card-bg">
          <ul className="space-y-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-foreground text-lg font-medium tracking-wide py-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
