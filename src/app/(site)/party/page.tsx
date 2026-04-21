import Link from "next/link";
import Image from "next/image";
import V2Header from "../components/V2Header";
import V2Footer from "../components/V2Footer";

const SETS = [
  {
    label: "Small Set",
    pcs: "36 pcs",
    price: 135,
    badge: null,
    desc: "A sweet and simple option for intimate gatherings.",
  },
  {
    label: "Medium Set",
    pcs: "48 pcs",
    price: 185,
    badge: "Most Popular",
    desc: "Our most popular choice for a balanced and polished dessert table.",
  },
  {
    label: "Large Set",
    pcs: "96 pcs",
    price: 310,
    badge: "Best Value",
    desc: "Perfect for larger celebrations with more variety and visual impact.",
  },
];

const WHY = [
  {
    icon: "✨",
    title: "Better together",
    body: "Enjoy a more complete dessert table with our curated sets — thoughtfully designed to offer more variety and better value than ordering individual items.",
  },
  {
    icon: "🎨",
    title: "A cohesive look",
    body: "Our dessert sets are styled in a unified color palette to elevate your entire table — effortlessly.",
  },
  {
    icon: "💝",
    title: "More value",
    body: "Sets give you more variety per dollar and save you the hassle of coordinating multiple orders.",
  },
  {
    icon: "🎉",
    title: "Perfect for hosting",
    body: "Whether it's a birthday, baby shower, or wedding — our sets are ready to impress.",
  },
];

const REVIEWS = [
  {
    quote: "They were the highlight of the dessert table — every single guest asked where they came from.",
    name: "Sarah J.",
    event: "Baby shower",
  },
  {
    quote: "Everything matched perfectly with our theme. The color palette was exactly what I asked for.",
    name: "Maya & Tom",
    event: "Wedding",
  },
  {
    quote: "Guests kept coming back for more. Worth every penny — and the presentation was stunning.",
    name: "Amelia R.",
    event: "Birthday party",
  },
];

const TREATS = [
  { name: "Cake Pops", slug: "cakepops", img: "/images/cake-pops/basic.jpg" },
  { name: "Cakesicles", slug: "cakesicles", img: "/images/cakesicles/5.png" },
  { name: "Pretzel Rods", slug: "choc-dipped-caramel-pretzel-rods", img: "/images/caramel-pretzel/1.jpg" },
  { name: "Oreos & more", slug: "choc-covered-oreos", img: "/images/choco-cookies/1.jpg" },
];

export default function PartyLandingPage() {
  return (
    <>
      <V2Header />

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        padding: "5rem 1.5rem 4rem",
        textAlign: "center",
        background: "linear-gradient(160deg, #fff9f7 0%, #fff 60%)",
        overflow: "hidden",
      }}>
        {/* soft confetti dots */}
        {[
          { top: "12%", left: "6%", color: "var(--cherry, #c05)", size: 10, rotate: "20deg" },
          { top: "20%", left: "88%", color: "var(--butter, #f0c96b)", size: 8, rotate: "-30deg" },
          { top: "70%", left: "5%", color: "var(--mint, #3a7d6e)", size: 7, rotate: "45deg" },
          { top: "75%", left: "92%", color: "var(--cherry, #c05)", size: 9, rotate: "-15deg" },
        ].map((c, i) => (
          <i key={i} aria-hidden="true" style={{
            position: "absolute",
            top: c.top, left: c.left,
            width: c.size, height: c.size * 2.5,
            background: c.color,
            borderRadius: 2,
            transform: `rotate(${c.rotate})`,
            opacity: 0.35,
          }} />
        ))}

        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-block",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--cherry, #c05)",
            marginBottom: "1rem",
          }}>
            Party Sets
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            Beautifully curated dessert sets<br />
            <em>for your special moments.</em>
          </h1>

          <p style={{ fontSize: "1.05rem", opacity: 0.65, lineHeight: 1.7, marginBottom: "1rem" }}>
            Chocolate-covered treats designed in your color palette —
            perfect for birthdays, baby showers, and celebrations.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.35rem", alignItems: "center", fontSize: "0.9rem", opacity: 0.7 }}>
            <li>✨ Mix of chocolate-covered treats</li>
            <li>✨ Designed in your color palette</li>
            <li>✨ Perfect for parties &amp; dessert tables</li>
          </ul>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products/party-set" className="btn btn-primary">
              Shop Party Sets →
            </Link>
            <Link href="/products" className="btn btn-ghost">
              Browse Individual Treats
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{
        background: "var(--surface, #faf9f7)",
        borderTop: "1px solid var(--border, #e8e4de)",
        borderBottom: "1px solid var(--border, #e8e4de)",
        padding: "0.85rem 1.5rem",
      }}>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1.25rem 2.5rem",
          fontSize: "0.82rem",
          fontWeight: 600,
        }}>
          {["Made from scratch", "Custom color palettes", "Perfect for dessert tables", "San Jose / Bay Area pickup"].map((t) => (
            <span key={t} style={{ opacity: 0.7 }}>✔ {t}</span>
          ))}
        </div>
      </div>

      {/* ── HERO IMAGE ── */}
      <div style={{ position: "relative", maxHeight: 480, overflow: "hidden" }}>
        <Image
          src="/images/brand-spread.jpg"
          alt="A beautifully arranged party treat set"
          width={1400}
          height={800}
          style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}
          priority
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.6) 100%)",
        }} />
      </div>

      {/* ── BESTSELLER SETS ── */}
      <section style={{ padding: "4rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div className="kicker">Our Sets</div>
          <h2>
            Most popular <em>party sets.</em>
          </h2>
          <p style={{ opacity: 0.65, maxWidth: 480, margin: "0 auto" }}>
            ⭐ Most customers choose Medium or Large for the best experience.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
          {SETS.map((s) => (
            <Link
              key={s.label}
              href="/products/party-set"
              style={{
                display: "block",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                border: s.badge === "Most Popular"
                  ? "2px solid var(--cherry, #c05)"
                  : "1px solid var(--border, #e8e4de)",
                background: s.badge === "Most Popular" ? "#fff8f8" : "#fff",
                textDecoration: "none",
                color: "inherit",
                transition: "box-shadow 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: "1rem" }}>{s.label}</span>
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", opacity: 0.5 }}>{s.pcs}</span>
                </div>
                {s.badge && (
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em",
                    padding: "0.2rem 0.6rem", borderRadius: "999px",
                    background: s.badge === "Most Popular" ? "var(--cherry, #c05)" : "#2a7a5e",
                    color: "#fff",
                  }}>
                    {s.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.82rem", opacity: 0.6, marginBottom: "0.85rem", lineHeight: 1.5 }}>
                {s.desc}
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--cherry, #c05)" }}>
                ${s.price}
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/products/party-set" className="btn btn-primary">
            View All Party Sets →
          </Link>
        </div>
      </section>

      {/* ── WHY SETS ── */}
      <section style={{ padding: "4rem 1.5rem", background: "var(--surface, #faf9f7)", borderTop: "1px solid var(--border, #e8e4de)", borderBottom: "1px solid var(--border, #e8e4de)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="kicker">Why Sets?</div>
            <h2>
              Why choose <em>just one?</em>
            </h2>
            <p style={{ opacity: 0.65, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Our party sets are designed to give you the perfect mix of textures, colors, and presentation — all in one.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {WHY.map((w) => (
              <div key={w.title} style={{ padding: "1.25rem", background: "#fff", borderRadius: "0.65rem", border: "1px solid var(--border, #e8e4de)" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.6rem" }}>{w.icon}</div>
                <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.95rem" }}>{w.title}</h4>
                <p style={{ margin: 0, fontSize: "0.82rem", opacity: 0.65, lineHeight: 1.6 }}>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESIGN SECTION ── */}
      <section style={{ padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <div className="kicker">Design</div>
            <h2>
              Create a look that <em>matches your event.</em>
            </h2>
            <p style={{ opacity: 0.65, lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Choose your color palette and upgrade your design for a more elevated and cohesive finish.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Classic — simple, clean, and elegant", "Enhanced — elevated with coordinated details ⭐", "Signature Custom — fully themed and bespoke"].map((item) => (
                <li key={item} style={{ fontSize: "0.88rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--cherry, #c05)", fontWeight: 700, flexShrink: 0 }}>→</span>
                  <span style={{ opacity: 0.75 }}>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/products/party-set" className="btn btn-primary">
              Start customizing →
            </Link>
          </div>
          <div style={{ borderRadius: "0.75rem", overflow: "hidden" }}>
            <Image
              src="/images/treat-boxes/mixed-treats.jpg"
              alt="Coordinated dessert set"
              width={700}
              height={700}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </section>

      {/* ── INDIVIDUAL TREATS ── */}
      <section style={{ padding: "4rem 1.5rem", background: "var(--surface, #faf9f7)", borderTop: "1px solid var(--border, #e8e4de)", borderBottom: "1px solid var(--border, #e8e4de)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="kicker">Individual Treats</div>
            <h2>
              Or pick your <em>favourites.</em>
            </h2>
            <p style={{ opacity: 0.65, maxWidth: 480, margin: "0 auto" }}>
              Prefer to order individual treats? We&rsquo;ve got you covered with our full collection.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            {TREATS.map((t) => (
              <Link
                key={t.slug}
                href={`/products/${t.slug}`}
                style={{ display: "block", borderRadius: "0.65rem", overflow: "hidden", border: "1px solid var(--border, #e8e4de)", textDecoration: "none", color: "inherit", background: "#fff" }}
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
                <div style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.88rem" }}>
                  {t.name}
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/products" className="btn btn-ghost">
              Browse all treats →
            </Link>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section style={{ padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="kicker">Kind words</div>
            <h2>
              From our <em>sweet</em> customers.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
            {REVIEWS.map((r) => (
              <div key={r.name} style={{ padding: "1.5rem", background: "var(--surface, #faf9f7)", borderRadius: "0.65rem", border: "1px solid var(--border, #e8e4de)" }}>
                <div style={{ fontSize: "2rem", lineHeight: 1, color: "var(--cherry, #c05)", marginBottom: "0.75rem", fontFamily: "Georgia, serif" }}>&ldquo;</div>
                <p style={{ margin: "0 0 1rem", fontSize: "0.88rem", lineHeight: 1.7, opacity: 0.8 }}>{r.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--cherry, #c05)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700 }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem" }}>{r.name}</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.55 }}>{r.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding: "5rem 1.5rem",
        background: "linear-gradient(135deg, #fff5f5 0%, #fff9f2 100%)",
        borderTop: "1px solid var(--border, #e8e4de)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {[
          { top: "15%", left: "8%", color: "var(--cherry, #c05)", rotate: "25deg" },
          { top: "75%", left: "5%", color: "var(--butter, #f0c96b)", rotate: "-20deg" },
          { top: "20%", left: "90%", color: "var(--mint, #3a7d6e)", rotate: "50deg" },
          { top: "80%", left: "88%", color: "var(--cherry, #c05)", rotate: "-35deg" },
        ].map((c, i) => (
          <i key={i} aria-hidden="true" style={{
            position: "absolute",
            top: c.top, left: c.left,
            width: 8, height: 22,
            background: c.color,
            borderRadius: 2,
            transform: `rotate(${c.rotate})`,
            opacity: 0.3,
          }} />
        ))}

        <div style={{ maxWidth: 540, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginBottom: "1rem" }}>
            Ready to create your <em>dessert table?</em>
          </h2>
          <p style={{ opacity: 0.65, lineHeight: 1.7, marginBottom: "2rem", fontSize: "1rem" }}>
            Designed to make your dessert table feel complete — beautifully coordinated and ready for your celebration.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/products/party-set" className="btn btn-primary">
              Shop Party Sets →
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Custom order
            </Link>
          </div>
        </div>
      </section>

      <V2Footer />
    </>
  );
}
