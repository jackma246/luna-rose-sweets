import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";
import V2Header from "./components/V2Header";
import V2Footer from "./components/V2Footer";

const featuredSlugs = [
  "party-set",
  "cakesicles",
  "cakepops",
  "gift-half-dozen-box",
  "cakepop-bouquet",
  "party-custom-cake",
];

const tagOverrides: Record<string, { label: string; variant?: "butter" | "cocoa" }> = {
  "party-set": { label: "Best seller" },
  cakesicles: { label: "New", variant: "butter" },
  "cakepop-bouquet": { label: "Limited", variant: "cocoa" },
  "party-custom-cake": { label: "Made to order", variant: "cocoa" },
};

const confetti = [
  { top: "12%", left: "5%", color: "var(--cherry)", rotate: "30deg" },
  { top: "22%", left: "52%", color: "var(--butter)", rotate: "-20deg" },
  { top: "70%", left: "8%", color: "var(--mint)", rotate: "45deg" },
  { top: "82%", left: "44%", color: "var(--cherry)", rotate: "-10deg" },
  { top: "18%", left: "92%", color: "var(--butter)", rotate: "60deg" },
  { top: "88%", left: "62%", color: "var(--cocoa)", rotate: "-35deg" },
  { top: "48%", left: "3%", color: "var(--cherry)", rotate: "15deg" },
  { top: "8%", left: "38%", color: "var(--mint)", rotate: "-50deg" },
];

const marqueeWords = [
  "cake pops",
  "cakesicles",
  "chocolate bouquets",
  "madeleines",
  "custom orders",
  "oreo pops",
  "cookie boxes",
  "party sets",
];

const insta = [
  "/images/cake-pops/basic.jpg",
  "/images/cakesicles/1.jpg",
  "/images/cupcakes/1.jpg",
  "/images/popsicle-bouquet/1.jpg",
  "/images/treat-boxes/mixed-treats.jpg",
  "/images/strawberry-heart.jpg",
];

function priceLabel(slug: string): string {
  const p = products.find((x) => x.slug === slug);
  if (!p) return "";
  if (p.enquireOnly) return "Enquire";
  const prices = p.variants.map((v) => v.price);
  if (prices.length === 0) return "";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min}`;
  return `from $${min}`;
}

function captionFor(slug: string): string {
  const p = products.find((x) => x.slug === slug);
  if (!p) return "";
  return p.category;
}

export default function V2Home() {
  const featured = featuredSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <V2Header current="shop" />

      {/* Hero */}
      <section className="hero">
        <div className="confetti-bg" aria-hidden="true">
          {confetti.map((c, i) => (
            <i
              key={i}
              style={{
                top: c.top,
                left: c.left,
                background: c.color,
                transform: `rotate(${c.rotate})`,
              }}
            />
          ))}
        </div>
        <div className="hero-inner">
          <div>
            <div className="eyebrow">A sweet little studio</div>
            <h1>
              Dipped, sprinkled, <em>&amp;</em>
              <br />
              <em>dressed up</em> for the
              <br />
              whole party.
            </h1>
            <p className="lede">
              Handmade cake pops, cakesicles &amp; little bakes — crafted in
              small batches for birthdays, weddings, and every celebration in
              between.
            </p>
            <div className="ctas">
              <Link href="/products" className="btn btn-primary">
                Shop the collection →
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                Custom orders
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="plate" aria-hidden="true" />
            <div className="photo">
              <Image
                src="/images/main-hero.jpg"
                alt="Handcrafted treats beautifully decorated"
                width={800}
                height={800}
                priority
              />
            </div>
            <div className="badge">
              Small
              <br />
              batch
            </div>
          </div>
        </div>
        <div className="script-tag">~ welcome in</div>
      </section>

      {/* Marquee */}
      <div className="marquee">
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      {/* Best sellers */}
      <section className="section">
        <div className="section-head">
          <div className="kicker">Best sellers</div>
          <h2>
            Little bakes, <em>big occasions.</em>
          </h2>
          <p>
            Our most-loved treats. Hand-dipped, hand-sprinkled, never frozen,
            always made the day they ship.
          </p>
        </div>
        <div className="products">
          {featured.map((product) => {
            const tag = tagOverrides[product.slug];
            const img = product.image ?? product.variants[0]?.image;
            return (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="product"
              >
                {tag && (
                  <div className={`ribbon-tag${tag.variant ? ` ${tag.variant}` : ""}`}>
                    {tag.label}
                  </div>
                )}
                <div className="thumb">
                  {img && (
                    <Image
                      src={img}
                      alt={product.name}
                      width={600}
                      height={600}
                    />
                  )}
                </div>
                <div className="info">
                  <h3>{product.name}</h3>
                  <div className="caption">{captionFor(product.slug)}</div>
                  <div className="price">{priceLabel(product.slug)}</div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="shop-all-wrap">
          <Link href="/products" className="btn btn-ghost">
            Shop everything →
          </Link>
        </div>
      </section>

      {/* Our story */}
      <section className="feature">
        <div className="feature-inner">
          <div>
            <div className="kicker">Our story</div>
            <h2>
              A small kitchen, <em>one steady hand,</em> and a lot of sprinkles.
            </h2>
            <p>
              Every treat starts in our studio kitchen with premium Belgian
              chocolate, grass-fed butter, and real Madagascar vanilla. We dip
              each piece by hand and finish every box with the kind of care
              we&rsquo;d want for our own table.
            </p>
            <p>No freezers, no shortcuts. Just small batches, made the day they ship.</p>
            <Link href="/about" className="btn btn-primary">
              Read our story →
            </Link>
          </div>
          <div className="visual">
            <Image
              src="/images/brand-spread.jpg"
              alt="A spread of Dip & Sprinkle treats"
              width={800}
              height={1000}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="testimonials-inner">
          <div className="section-head">
            <div className="kicker">Kind words</div>
            <h2>
              From our <em>sweet</em> customers.
            </h2>
          </div>
          <div className="quote-grid">
            <div className="quote">
              <div className="q-mark">&ldquo;</div>
              <p>
                The cake pops were the hit of my daughter&rsquo;s shower — every
                single guest asked where they came from. Beautifully packaged
                and genuinely the best bite I&rsquo;ve had in years.
              </p>
              <div className="who">
                <div className="avatar">S</div>
                <div>
                  <b>Sarah J.</b>
                  <span>Baby shower</span>
                </div>
              </div>
            </div>
            <div className="quote">
              <div className="q-mark">&ldquo;</div>
              <p>
                We ordered the dessert tower for our wedding and guests are
                still talking about it. Dip &amp; Sprinkle made our day feel
                like a dream.
              </p>
              <div className="who">
                <div className="avatar">M</div>
                <div>
                  <b>Maya &amp; Tom</b>
                  <span>Wedding</span>
                </div>
              </div>
            </div>
            <div className="quote">
              <div className="q-mark">&ldquo;</div>
              <p>
                I&rsquo;ve ordered three times now and it keeps getting better.
                Every detail is thought through — from the ribbon on the box to
                the little handwritten note.
              </p>
              <div className="who">
                <div className="avatar">A</div>
                <div>
                  <b>Amelia R.</b>
                  <span>Repeat customer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="insta">
        <div className="insta-inner">
          <div className="section-head">
            <div className="kicker">@dipsprinkle</div>
            <h2>
              Follow along for <em>sweet</em> moments.
            </h2>
          </div>
          <div className="insta-grid">
            {insta.map((src, i) => (
              <a
                key={i}
                href="https://www.instagram.com/dipsprinkle"
                target="_blank"
                rel="noopener noreferrer"
                className="insta-tile"
              >
                <Image src={src} alt="Instagram post" width={400} height={400} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="confetti-bg" aria-hidden="true">
          <i style={{ top: "20%", left: "10%", background: "var(--cherry)" }} />
          <i
            style={{
              top: "70%",
              left: "8%",
              background: "var(--butter)",
              transform: "rotate(-30deg)",
            }}
          />
          <i
            style={{
              top: "30%",
              left: "90%",
              background: "var(--cocoa)",
              transform: "rotate(45deg)",
            }}
          />
          <i
            style={{
              top: "80%",
              left: "85%",
              background: "var(--mint)",
              transform: "rotate(-20deg)",
            }}
          />
        </div>
        <div className="newsletter-inner">
          <h2>
            Sweet notes, <em>straight to you.</em>
          </h2>
          <p>
            New flavors, seasonal collections, and the occasional sprinkle-filled
            surprise. No spam, just sugar.
          </p>
          <form
            className="form"
            action="https://www.instagram.com/dipsprinkle"
            method="get"
          >
            <input type="email" placeholder="your@email.com" required />
            <button type="submit" className="btn btn-primary">
              Sign up
            </button>
          </form>
        </div>
      </section>

      <V2Footer />
    </>
  );
}
