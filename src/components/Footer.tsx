import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12">
      {/* Mobile: centered social links above footer */}
      <div className="md:hidden flex justify-center gap-6 py-8 border-t border-accent/10 bg-background">
        <a
          href="#"
          className="text-foreground/70 hover:text-heading transition-colors"
          aria-label="Instagram"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>
        <a
          href="#"
          className="text-foreground/70 hover:text-heading transition-colors"
          aria-label="TikTok"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.65a8.35 8.35 0 0 0 4.76 1.49v-3.5c-.02 0-1 .05-1 .05z" />
          </svg>
        </a>
      </div>

      {/* Footer */}
      <div className="bg-nav-bg text-nav-text">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif font-bold text-lg mb-3">Luna Rose Sweets</h3>
              <p className="text-sm opacity-90">
                Handcrafted cake pops, chocolate-covered strawberries, and custom
                desserts made with love.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-3">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/products" className="hover:opacity-80 transition-opacity">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:opacity-80 transition-opacity">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:opacity-80 transition-opacity">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            {/* Desktop: social links stay in footer */}
            <div className="hidden md:block">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-3">
                Follow Us
              </h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="Instagram"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="hover:opacity-80 transition-opacity"
                  aria-label="TikTok"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.65a8.35 8.35 0 0 0 4.76 1.49v-3.5c-.02 0-1 .05-1 .05z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm opacity-75">
            &copy; {new Date().getFullYear()} Luna Rose Sweets. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
