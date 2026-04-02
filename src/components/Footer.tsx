import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12">
      {/* Mobile: centered social links above footer */}
      <div className="md:hidden flex justify-center gap-6 py-8 border-t border-accent/20 bg-background">
        <a
          href="#"
          className="text-chocolate/70 hover:text-accent transition-colors"
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
          className="text-chocolate/70 hover:text-accent transition-colors"
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

      {/* Chocolate drip divider */}
      <div className="relative">
        <svg viewBox="0 0 1440 40" className="w-full block" preserveAspectRatio="none">
          <path d="M0,0 L1440,0 L1440,20 Q1350,40 1300,20 Q1250,0 1200,15 Q1150,30 1100,20 Q1050,10 1000,20 Q950,35 900,18 Q850,5 800,20 Q750,35 700,15 Q650,0 600,20 Q550,35 500,18 Q450,5 400,22 Q350,38 300,18 Q250,2 200,20 Q150,38 100,18 Q50,2 0,20 Z" fill="#5C3828"/>
        </svg>
      </div>

      {/* Footer */}
      <div className="bg-chocolate text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif font-bold text-lg mb-3 text-accent">Dip & Sprinkle</h3>
              <p className="text-sm text-white/80">
                Sweet treats dipped & decorated — Madeleines, Cake Pops, Rice Krispies,
                Pretzels, Butter Cookies & More! Homemade with love.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-mint">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/products" className="text-white/80 hover:text-accent transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-white/80 hover:text-accent transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/80 hover:text-accent transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            {/* Desktop: social links stay in footer */}
            <div className="hidden md:block">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-mint">
                Follow Us
              </h3>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-white/80 hover:text-accent transition-colors"
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
                  className="text-white/80 hover:text-accent transition-colors"
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
          <div className="border-t border-white/15 mt-8 pt-6 text-center text-sm text-white/50">
            &copy; {new Date().getFullYear()} Dip & Sprinkle. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
