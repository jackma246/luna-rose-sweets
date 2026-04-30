import Link from "next/link";

export default function V2Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="brand">
            <div className="logo-placeholder">
              Dip <span className="amp">&amp;</span> Sprinkle
            </div>
            <p>
              Handmade cake pops, cakesicles and little bakes — crafted with
              care in a small studio kitchen.
            </p>
          </div>

          <details className="footer-col">
            <summary><h5>Shop</h5></summary>
            <ul>
              <li>
                <Link href="/products?category=Treats">Cake Pops</Link>
              </li>
              <li>
                <Link href="/products?category=Treats">Cakesicles</Link>
              </li>
              <li>
                <Link href="/products?category=Gift">Bouquets</Link>
              </li>
              <li>
                <Link href="/products?category=Gift">Gift Boxes</Link>
              </li>
              <li>
                <Link href="/products">All Treats</Link>
              </li>
            </ul>
          </details>

          <details className="footer-col">
            <summary><h5>Orders</h5></summary>
            <ul>
              <li>
                <Link href="/contact">Custom orders</Link>
              </li>
              <li>
                <Link href="/contact">Wedding inquiries</Link>
              </li>
              <li>
                <Link href="/contact">Corporate</Link>
              </li>
              <li>
                <Link href="/contact">Shipping</Link>
              </li>
            </ul>
          </details>

          <details className="footer-col">
            <summary><h5>Studio</h5></summary>
            <ul>
              <li>
                <Link href="/about">Our story</Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/dipsprinkle"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </details>
        </div>
        <div className="footer-bot">
          <div>© {new Date().getFullYear()} Dip &amp; Sprinkle · Made with sugar</div>
          <div className="social">
            <a
              href="https://www.instagram.com/dipsprinkle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @dipsprinkle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
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
              aria-label="TikTok @dipsprinkle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.65a8.35 8.35 0 0 0 4.76 1.49v-3.5c-.02 0-1 .05-1 .05z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
