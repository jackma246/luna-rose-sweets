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
  "Order by Thursday for weekend pickup",
  "Made from scratch",
  "Custom color palettes available",
];

const _partySetVariants = getProductBySlug("party-set")!.variants;
const _setPrice = (keyword: string): number =>
  _partySetVariants.find((v) => v.label.toLowerCase().startsWith(keyword))?.price ?? 0;

const SETS = [
  {
    id: "small",
    label: "Small Set",
    pcs: "36 pcs",
    price: _setPrice("small"),
    badge: null,
    badgeBg: "",
    desc: "A sweet and simple option for intimate gatherings.",
  },
  {
    id: "medium",
    label: "Medium Set",
    pcs: "48 pcs",
    price: _setPrice("medium"),
    badge: "⭐ Most Popular",
    badgeBg: "var(--cherry, #c05)",
    desc: "Our most popular choice — balanced and polished.",
  },
  {
    id: "large",
    label: "Large Set",
    pcs: "96 pcs",
    price: _setPrice("large"),
    badge: "✨ Best Value",
    badgeBg: "#2a7a5e",
    desc: "Perfect for larger celebrations with maximum impact.",
  },
];

const TREATS = [
  { name: "Cake Pops", slug: "cakepops", img: "/images/cake-pops/basic.jpg" },
  { name: "Cakesicles", slug: "cakesicles", img: "/images/cakesicles/5.png" },
  { name: "Pretzel Rods", slug: "choc-dipped-caramel-pretzel-rods", img: "/images/caramel-pretzel/1.jpg" },
  { name: "Chocolate sandwich cookies (Oreos®️) & more", slug: "choc-covered-oreos", img: "/images/choco-cookies/1.jpg" },
];

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
                Browse all treats
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

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxWidth: 520, margin: "0 auto" }}>
          {SETS.map((s) => (
            <Link
              key={s.label}
              href={`/products/party-set?size=${s.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.25rem",
                borderRadius: "0.65rem",
                border: s.badge?.includes("Popular")
                  ? "2px solid var(--cherry, #c05)"
                  : "1px solid var(--border, #e8e4de)",
                background: s.badge?.includes("Popular") ? "#fff8f8" : "#fff",
                textDecoration: "none",
                color: "inherit",
                gap: "0.75rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.label}</span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.45 }}>{s.pcs}</span>
                  {s.badge && (
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.03em",
                      padding: "0.15rem 0.55rem", borderRadius: "999px",
                      background: s.badgeBg, color: "#fff",
                    }}>
                      {s.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.8rem", opacity: 0.55, lineHeight: 1.4 }}>{s.desc}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.2rem", flexShrink: 0, color: "var(--cherry, #c05)" }}>
                ${s.price}
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/products/party-set" className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2rem" }}>
            View Party Sets →
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
        <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <div className="kicker">Why a set?</div>
          <h2 style={{ margin: "0.25rem 0 1.5rem" }}>
            Better together. <em>Always.</em>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
            {[
              { icon: "✨", label: "More variety", body: "A mix of textures and treats that satisfies every guest." },
              { icon: "🎨", label: "Better presentation", body: "Styled in a unified color palette — cohesive and elevated." },
              { icon: "💝", label: "Better value", body: "More per dollar than ordering individual items." },
            ].map((w) => (
              <div key={w.label} style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.3rem", flexShrink: 0, lineHeight: 1.4 }}>{w.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: "0.15rem" }}>{w.label}</div>
                  <div style={{ fontSize: "0.82rem", opacity: 0.6, lineHeight: 1.55 }}>{w.body}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "1.5rem", fontSize: "0.82rem", opacity: 0.55, fontStyle: "italic" }}>
            Most customers choose Medium or Large for the best experience.
          </p>
        </div>
      </section>

      {/* ── SECTION 5: MID CTA ── */}
      <section style={{ padding: "2.5rem 1.25rem", textAlign: "center" }}>
        <Link
          href="/products/party-set"
          className="btn btn-primary"
          style={{ fontSize: "1rem", padding: "0.9rem 2.5rem", display: "inline-flex" }}
        >
          Shop Party Sets →
        </Link>
      </section>

      {/* ── SECTION 6: INDIVIDUAL TREATS ── */}
      <section style={{ padding: "0 1.25rem 3rem", borderTop: "1px solid var(--border, #e8e4de)", paddingTop: "2.5rem" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div className="kicker">Individual Treats</div>
            <h2 style={{ margin: "0.25rem 0 0.4rem" }}>
              Browse <em>individual treats.</em>
            </h2>
            <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.6 }}>
              Prefer to mix and match? Order by the dozen.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {TREATS.map((t) => (
              <Link
                key={t.slug}
                href={`/products/${t.slug}`}
                style={{
                  display: "block", borderRadius: "0.6rem",
                  overflow: "hidden", border: "1px solid var(--border, #e8e4de)",
                  textDecoration: "none", color: "inherit", background: "#fff",
                }}
              >
                <div style={{ aspectRatio: "1", overflow: "hidden" }}>
                  <Image
                    src={t.img}
                    alt={t.name}
                    width={400}
                    height={400}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
                <div style={{ padding: "0.6rem 0.75rem", fontWeight: 600, fontSize: "0.82rem" }}>
                  {t.name}
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link href="/products" className="btn btn-ghost">
              Browse all treats →
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
            Shop Party Sets →
          </Link>
        </div>
      </section>

      <V2Footer />
    </>
  );
}
