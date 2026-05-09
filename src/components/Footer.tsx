import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12">
      {/* Mobile: centered social links above footer */}
      <div className="md:hidden flex justify-center gap-6 py-8 border-t border-accent/20 bg-background">
        <a
          href="https://www.instagram.com/dipsprinkle"
          target="_blank"
          rel="noopener noreferrer"
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
          href="https://www.tiktok.com/@dipsprinkle"
          target="_blank"
          rel="noopener noreferrer"
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
        <a
          href="https://www.facebook.com/profile.php?id=61572046772764&mibextid=wwXIfr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-chocolate/70 hover:text-accent transition-colors"
          aria-label="Facebook"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>
        <a
          href="https://www.xiaohongshu.com/user/profile/69da8aa7000000002603b2db"
          target="_blank"
          rel="noopener noreferrer"
          className="text-chocolate/70 hover:text-accent transition-colors"
          aria-label="Rednote"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.29 14.3H8.71c-.72 0-1.31-.59-1.31-1.31V9.01c0-.72.59-1.31 1.31-1.31h6.58c.72 0 1.31.59 1.31 1.31v5.98c0 .72-.59 1.31-1.31 1.31zM10.5 10.5v3l2.5-1.5-2.5-1.5z" />
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
                Pretzels, Butter Cookies & More! Homemade from scratch.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-3 text-mint">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/classic/products" className="text-white/80 hover:text-accent transition-colors">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/classic/about" className="text-white/80 hover:text-accent transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/classic/contact" className="text-white/80 hover:text-accent transition-colors">
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
                  href="https://www.instagram.com/dipsprinkle"
                  target="_blank"
                  rel="noopener noreferrer"
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
                  href="https://www.tiktok.com/@dipsprinkle"
                  target="_blank"
                  rel="noopener noreferrer"
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
                <a
                  href="https://www.facebook.com/profile.php?id=61572046772764&mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-accent transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.xiaohongshu.com/user/profile/69da8aa7000000002603b2db"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-accent transition-colors"
                  aria-label="Rednote"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.29 14.3H8.71c-.72 0-1.31-.59-1.31-1.31V9.01c0-.72.59-1.31 1.31-1.31h6.58c.72 0 1.31.59 1.31 1.31v5.98c0 .72-.59 1.31-1.31 1.31zM10.5 10.5v3l2.5-1.5-2.5-1.5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/15 mt-8 pt-6 text-center text-sm text-white/50">
            <div>&copy; {new Date().getFullYear()} Dip & Sprinkle. All rights reserved.</div>
            <div className="mt-3 leading-relaxed">
              San Jose, CA based made in a home kitchen.<br />
              Cottage Food Operation (Class A)<br />
              Permit #: PT0506991<br />
              Santa Clara County.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
