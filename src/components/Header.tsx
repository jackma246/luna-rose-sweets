"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Logo from "./Logo";

export default function Header() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <header className="sticky top-0 z-40">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-md border-b border-accent/10">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo size={44} className="transition-transform duration-300 group-hover:scale-105" />
          <span className="font-serif text-heading font-bold text-lg hidden sm:block tracking-wide">
            Luna Rose Sweets
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative p-2.5 rounded-full hover:bg-accent/10 text-foreground hover:text-heading transition-all duration-200"
            aria-label="Shopping cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-heading text-xs font-bold text-white animate-fade-in-up">
                {totalItems}
              </span>
            )}
          </Link>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-full hover:bg-accent/10 transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:block bg-nav-bg/95 backdrop-blur-sm px-6 py-2.5">
        <ul className="flex items-center justify-center gap-10">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-nav-text font-medium text-sm tracking-wide uppercase hover:opacity-80 transition-opacity relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-nav-text/60 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-nav-bg/95 backdrop-blur-sm px-6 py-4 animate-fade-in-up">
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-nav-text font-medium text-sm tracking-wide uppercase py-1"
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
