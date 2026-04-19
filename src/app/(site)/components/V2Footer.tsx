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
          <div>
            <h5>Shop</h5>
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
          </div>
          <div>
            <h5>Orders</h5>
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
          </div>
          <div>
            <h5>Studio</h5>
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
          </div>
        </div>
        <div className="footer-bot">
          <div>© {new Date().getFullYear()} Dip &amp; Sprinkle · Made with sugar</div>
          <div className="social">
            <a
              href="https://www.instagram.com/dipsprinkle"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@sanjosesweets"
              target="_blank"
              rel="noopener noreferrer"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
