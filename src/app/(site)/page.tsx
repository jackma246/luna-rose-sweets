import Link from "next/link";
import Image from "next/image";
import V2Header from "./components/V2Header";
import V2Footer from "./components/V2Footer";
import AvailabilityCalendar from "./components/AvailabilityCalendar";
import { getProductBySlug } from "@/data/products";

export const dynamic = "force-dynamic";

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
  "San Jose & Bay Area pick up",
  "Made from scratch",
  "Custom color palettes available",
];

const _partySetVariants = getProductBySlug("party-set")!.variants;
const _setPrice = (keyword: string): number =>
  _partySetVariants.find((v) => v.label.toLowerCase().startsWith(keyword))?.price ?? 0;

// pulls the shop's own image / category / price for a treat so the home cards
// carry the exact same info the shop grid shows
const _treat = (slug: string, name: string, badge?: string) => {
  const p = getProductBySlug(slug);
  const prices = p?.variants.map((v) => v.price) ?? [];
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  return {
    slug,
    name,
    badge: badge ?? null,
    img: p?.image ?? "",
    category: p?.category ?? "",
    price: prices.length ? (min === max ? `$${min}` : `from $${min}`) : "",
  };
};

const SETS = [
  {
    id: "small",
    label: "Small Set",
    pcs: "36 pcs",
    price: _setPrice("small"),
    badge: null as string | null,
    badgeBg: "",
    mark: "",
    featured: false,
    desc: "A sweet and simple option for intimate gatherings.",
  },
  {
    id: "medium",
    label: "Medium Set",
    pcs: "48 pcs",
    price: _setPrice("medium"),
    badge: "Most loved" as string | null,
    badgeBg: "var(--cherry)",
    mark: "♥",
    featured: true,
    desc: "Our most popular choice — balanced and polished.",
  },
  {
    id: "large",
    label: "Large Set",
    pcs: "96 pcs",
    price: _setPrice("large"),
    badge: "Best value" as string | null,
    badgeBg: "var(--pine)",
    mark: "✦",
    featured: false,
    desc: "Perfect for larger celebrations with maximum impact.",
  },
];

const TREATS = [
  _treat("cakepops", "Cake Pops", "Best seller"),
  _treat("cakesicles", "Cakesicles", "Best seller"),
  _treat("choc-dipped-caramel-pretzel-rods", "Pretzel Rods"),
  _treat("choc-covered-oreos", "Chocolate Sandwich Cookies (Oreos®️)"),
];

// shared desktop container — stops marketing sections pinching at 520px
const _container = { maxWidth: 1100, margin: "0 auto" };

export default function HomePage() {
  return (
    <>
      <V2Header current="shop" />

      {/* ── SECTION 1: HERO (original design) ── */}
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
              Beautiful dessert sets for your special moments.
            </p>
            <p style={{ margin: "0 0 1.25rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--cherry, #c05)" }}>
              Party sets starting at $135
            </p>
            <div className="ctas">
              <Link href="/products/party-set" className="btn btn-primary">
                Shop Party Sets →
              </Link>
              <Link href="/products" className="btn btn-ghost">
                Browse treats
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

      {/* ── MARQUEE (original design) ── */}
      <div className="marquee">
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      </div>

      <AvailabilityCalendar />

      {/* ── SECTION 2: BESTSELLER SETS ── */}
      <section style={{ padding: "3rem 1.25rem 2.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div className="kicker">Our Sets</div>
          <h2 style={{ margin: "0.25rem 0 0.5rem" }}>
            Most popular <em>party sets.</em>
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.6 }}>
            Most customers choose Medium or Large for the best experience.
          </p>
        </div>

        <div style={{ ..._container, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", alignItems: "stretch" }}>
          {SETS.map((s) => (
            <Link
              key={s.label}
              href={`/products/party-set?size=${s.id}`}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "0.45rem",
                padding: "18px 19px",
                borderRadius: 14,
                border: s.featured ? "1.5px solid var(--cherry)" : "1px solid var(--rule)",
                background: s.featured ? "linear-gradient(180deg, #fff, var(--blush-soft))" : "#fff",
                boxShadow: s.featured ? "0 14px 30px -18px rgba(185,74,100,.5)" : "none",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {s.badge && (
                <span style={{
                  position: "absolute", top: -9, left: 18,
                  fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.04em",
                  padding: "0.22rem 0.62rem", borderRadius: 999,
                  background: s.badgeBg, color: "#fff",
                }}>
                  {s.mark} {s.badge}
                </span>
              )}
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.75rem", marginTop: s.badge ? "0.4rem" : 0 }}>
                <span style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.35rem", letterSpacing: "-0.01em" }}>{s.label}</span>
                <span style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.35rem", color: "var(--cherry)" }}>${s.price}</span>
              </div>
              <div style={{ fontSize: "0.64rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 600 }}>{s.pcs}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.5 }}>{s.desc}</div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <Link href="/products/party-set" className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2rem" }}>
            Build my set →
          </Link>
        </div>
      </section>

      {/* ── SECTION 3: VISUAL ── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <Image
          src="/images/brand-spread-new.png"
          alt="Coordinated dessert table"
          width={1200}
          height={700}
          style={{ width: "100%", height: "auto", display: "block", maxHeight: 420, objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "1.5rem",
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
          color: "#fff",
          textAlign: "center",
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.01em" }}>
            Designed to elevate your dessert table.
          </p>
        </div>
      </section>

      {/* ── SECTION 4: WHY SETS ── */}
      <section style={{ padding: "3rem 1.25rem", background: "var(--surface, #faf9f7)", borderTop: "1px solid var(--border, #e8e4de)", borderBottom: "1px solid var(--border, #e8e4de)" }}>
        <div style={{ ..._container, textAlign: "center" }}>
          <div className="kicker">Why a set?</div>
          <h2 style={{ margin: "0.25rem 0 1.75rem" }}>
            Better together. <em>Always.</em>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {[
              { mark: "♥", label: "More variety", body: "A mix of textures and treats that satisfies every guest." },
              { mark: "✦", label: "Better presentation", body: "Styled in a unified color palette — cohesive and elevated." },
              { mark: "❖", label: "Better value", body: "More per dollar than ordering individual items." },
            ].map((w) => (
              <div key={w.label} style={{ textAlign: "center", padding: "0 0.5rem" }}>
                <span style={{ color: "var(--cherry)", fontSize: 18, lineHeight: 1 }}>{w.mark}</span>
                <div style={{ fontFamily: "var(--font-fraunces)", fontSize: "1.15rem", margin: "0.5rem 0 0.3rem" }}>{w.label}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.55 }}>{w.body}</div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "1.75rem", fontSize: "0.82rem", opacity: 0.55, fontStyle: "italic" }}>
            Most customers choose Medium or Large for the best experience.
          </p>
        </div>
      </section>

      {/* ── SECTION 6: INDIVIDUAL TREATS ── */}
      <section style={{ padding: "0 1.25rem 3rem", borderTop: "1px solid var(--border, #e8e4de)", paddingTop: "2.5rem" }}>
        <div style={_container}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div className="kicker">Individual Treats</div>
            <h2 style={{ margin: "0.25rem 0 0.4rem" }}>
              Browse <em>individual treats.</em>
            </h2>
            <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.6 }}>
              Prefer to mix and match? Order by the dozen.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "2rem 1.5rem" }}>
            {TREATS.map((t) => (
              <Link key={t.slug} href={`/products/${t.slug}`} className="product">
                {t.badge && (
                  <div className="ribbon-tag cocoa">
                    {t.badge.split(" ").slice(0, 1).join(" ")}
                    <br />
                    {t.badge.split(" ").slice(1).join(" ")}
                  </div>
                )}
                <div className="thumb">
                  {t.img && (
                    <Image src={t.img} alt={t.name} width={600} height={600} />
                  )}
                </div>
                <div className="info">
                  <h3>{t.name}</h3>
                  <div className="caption">{t.category}</div>
                  <div className="price">{t.price}</div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/products" className="btn btn-ghost">
              See all treats →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FINAL CTA ── */}
      <section style={{
        padding: "3.5rem 1.5rem 4rem",
        background: "linear-gradient(135deg, #fff5f5 0%, #fff9f2 100%)",
        borderTop: "1px solid var(--border, #e8e4de)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
            Ready to order?<br />
            <em>Let&rsquo;s build your table.</em>
          </h2>
          <p style={{ margin: "0 0 1.75rem", opacity: 0.6, fontSize: "0.9rem", lineHeight: 1.6 }}>
            Beautifully coordinated and ready for your celebration.
          </p>
          <Link
            href="/products/party-set"
            className="btn btn-primary"
            style={{ fontSize: "1rem", padding: "0.9rem 2.5rem", display: "inline-flex" }}
          >
            Start your order →
          </Link>
        </div>
      </section>

      <V2Footer />
    </>
  );
}
