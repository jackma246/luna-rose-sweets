"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CAKE_FLAVOURS, getProductBySlug } from "@/data/products";
import { useCart } from "@/context/CartContext";
import V2Header from "../../components/V2Header";
import V2Footer from "../../components/V2Footer";

const _partySetVariants = getProductBySlug("party-set")!.variants;
const _setPrice = (keyword: string): number =>
  _partySetVariants.find((v) => v.label.toLowerCase().startsWith(keyword))?.price ?? 0;

const SIZES = [
  {
    id: "small",
    label: "Small Set",
    pcs: 36,
    price: _setPrice("small"),
    badge: null as string | null,
    badgeColor: "",
    desc: "A sweet and simple option for small gatherings.",
    subDesc: null as string | null,
    previewImg: "/images/treat-boxes/mixed-treats.jpg",
    previewLabel: "Small Set",
  },
  {
    id: "medium",
    label: "Medium Set",
    pcs: 48,
    price: _setPrice("medium"),
    badge: "⭐ Most Popular",
    badgeColor: "var(--cherry, #c05)",
    desc: "Balanced, polished, and perfect for most events.",
    subDesc: "Most customers choose this for the best balance of variety and presentation ✨",
    previewImg: "/images/brand-spread-new.png",
    previewLabel: "Medium Set",
  },
  {
    id: "large",
    label: "Large Set",
    pcs: 96,
    price: _setPrice("large"),
    badge: "✨ Best Value",
    badgeColor: "#2a7a5e",
    desc: "More variety and visual impact for larger celebrations.",
    subDesc: null,
    previewImg: "/images/treat-boxes/mixed-treats.jpg",
    previewLabel: "Large Set",
  },
];

const TREAT_OPTIONS = [
  { id: "cake-pops", label: "Cake Pops" },
  { id: "cakesicles", label: "Cakesicles" },
  { id: "madeleines", label: "Madeleines" },
  { id: "caramel-pretzel-rods", label: "Caramel Pretzel Rods" },
  { id: "twisted-pretzel", label: "Twisted Pretzel" },
  { id: "oreos", label: "Chocolate sandwich cookies (Oreos®️)" },
  { id: "rice-krispies", label: "Rice Krispies" },
  { id: "marshmallows", label: "Marshmallows" },
];

const MAX_TREATS = 4;

const DESIGN_TIERS = [
  { id: "classic", label: "Classic", desc: "Clean coating, drizzle, simple accents", priceLabel: "Included", priceAdd: 0, popular: false },
  { id: "enhanced", label: "Enhanced", desc: "Layered drizzle, coordinated colors, premium details", priceLabel: "+$15", priceAdd: 15, popular: true },
  { id: "signature", label: "Signature", desc: "More detailed and elevated finish", priceLabel: "+$30", priceAdd: 30, popular: false },
];

const FLAVOUR_ADDON_PRICE = 12;

const card: React.CSSProperties = {
  borderRadius: "0.65rem",
  border: "1px solid var(--border, #e8e4de)",
  padding: "1rem 1.15rem",
  background: "#fff",
  cursor: "pointer",
  transition: "border-color 0.15s",
  userSelect: "none",
};

const cardActive: React.CSSProperties = {
  ...card,
  border: "2px solid var(--cherry, #c05)",
  background: "#fff8f8",
};

const sectionStyle: React.CSSProperties = {
  marginBottom: "2rem",
  paddingBottom: "2rem",
  borderBottom: "1px solid var(--border, #e8e4de)",
};

const stepLabel: React.CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  opacity: 0.35,
};

const stepHead: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "0.55rem",
  marginBottom: "0.75rem",
};

function Dot({ active }: { active: boolean }) {
  return (
    <div style={{
      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
      border: active ? "5px solid var(--cherry, #c05)" : "2px solid #ccc",
      transition: "border 0.15s",
    }} />
  );
}

function Check({ active }: { active: boolean }) {
  return (
    <div style={{
      width: 20, height: 20, borderRadius: "0.3rem", flexShrink: 0, marginTop: 1,
      border: active ? "none" : "2px solid #ccc",
      background: active ? "var(--cherry, #c05)" : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s",
    }}>
      {active && <span style={{ color: "#fff", fontSize: "0.75rem", lineHeight: 1 }}>✓</span>}
    </div>
  );
}

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().split("T")[0];
}

function formatPickupDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function PartySetPage() {
  const [sizeId, setSizeId] = useState("medium");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("size");
    if (requested && SIZES.some((s) => s.id === requested)) {
      setSizeId(requested);
    }
  }, []);
  const [treats, setTreats] = useState<string[]>([]);
  const [colorNote, setColorNote] = useState("");
  const [designTier, setDesignTier] = useState("");
  const [flavour, setFlavour] = useState("");
  const [secondFlavour, setSecondFlavour] = useState("");
  const [useTwoFlavours, setUseTwoFlavours] = useState(false);
  const [themeNote, setThemeNote] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const themeRef = useRef<HTMLTextAreaElement>(null);

  const { addItem } = useCart();

  const size = SIZES.find((s) => s.id === sizeId)!;
  const design = DESIGN_TIERS.find((d) => d.id === designTier);
  const flavourAddon = useTwoFlavours ? FLAVOUR_ADDON_PRICE : 0;
  const effectivePrice = size.price + (design?.priceAdd ?? 0) + flavourAddon;

  const isComplete =
    treats.length > 0 &&
    colorNote.trim().length > 0 &&
    designTier !== "" &&
    flavour !== "" &&
    pickupDate !== "";

  function toggleTreat(id: string) {
    setTreats((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id);
      if (prev.length >= MAX_TREATS) return prev;
      return [...prev, id];
    });
  }

  function buildCartNote() {
    const parts: string[] = [];
    parts.push(`Size: ${size.label}`);
    parts.push(`Treats: ${treats.map((id) => TREAT_OPTIONS.find((t) => t.id === id)!.label).join(", ")}`);
    parts.push(`Colors: ${colorNote}`);
    parts.push(`Design: ${design?.label ?? ""}${design?.priceAdd ? ` (${design.priceLabel})` : ""}`);
    if (useTwoFlavours && flavour && secondFlavour) {
      parts.push(`Flavor: ${flavour} + ${secondFlavour} (50/50 split, +$${FLAVOUR_ADDON_PRICE})`);
    } else {
      parts.push(`Flavor: ${flavour}`);
    }
    if (themeNote.trim()) parts.push(`Theme/Notes: ${themeNote.trim()}`);
    if (pickupDate) parts.push(`Pickup Date: ${formatPickupDate(pickupDate)}`);
    return parts.join(" | ");
  }

  function handleAddToCart() {
    if (!isComplete) return;
    addItem({
      productSlug: "party-set",
      variantLabel: size.label,
      name: `Party Set — ${size.label}`,
      price: effectivePrice,
      image: "/images/brand-spread-new.png",
      note: buildCartNote(),
    }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  const wrap: React.CSSProperties = {
    maxWidth: 540,
    margin: "0 auto",
    padding: "1.5rem 1.25rem 6rem",
  };

  return (
    <>
      <V2Header />

      <div style={wrap}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cherry, #c05)", marginBottom: "0.4rem" }}>
            Party Sets
          </div>
          <h1 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.5rem, 5vw, 2rem)", lineHeight: 1.2 }}>
            Build your dessert set
          </h1>
          <p style={{ margin: 0, opacity: 0.6, fontSize: "0.9rem" }}>
            Chocolate-covered treats styled in your color palette.
          </p>
        </div>

        {/* STEP 1: Set Size */}
        <div style={sectionStyle}>
          {/* Preview image */}
          <div style={{ position: "relative", borderRadius: "0.75rem", overflow: "hidden", marginBottom: "1rem", aspectRatio: "16/9" }}>
            <Image
              src={SIZES.find((s) => s.id === sizeId)!.previewImg}
              alt={SIZES.find((s) => s.id === sizeId)!.previewLabel}
              fill
              style={{ objectFit: "cover" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)",
              display: "flex", alignItems: "flex-end", padding: "1rem 1.15rem",
            }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.01em" }}>
                {SIZES.find((s) => s.id === sizeId)!.previewLabel}
              </span>
            </div>
          </div>

          <div style={stepHead}>
            <span style={stepLabel}>Step 1</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Choose your set size</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {SIZES.map((s) => (
              <div
                key={s.id}
                style={sizeId === s.id ? cardActive : card}
                onClick={() => setSizeId(s.id)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <Dot active={sizeId === s.id} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.15rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.label}</span>
                      <span style={{ fontSize: "0.75rem", opacity: 0.45 }}>{s.pcs} pcs</span>
                      {s.badge && (
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px", background: s.badgeColor, color: "#fff" }}>
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.82rem", opacity: 0.6 }}>{s.desc}</div>
                    {s.subDesc && sizeId === s.id && (
                      <div style={{ fontSize: "0.78rem", color: "var(--cherry, #c05)", marginTop: "0.3rem", fontWeight: 500 }}>{s.subDesc}</div>
                    )}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--cherry, #c05)", flexShrink: 0 }}>
                    ${s.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 2: Treat Mix */}
        <div style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 2</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Choose your treat mix</span>
          </div>
          <p style={{ margin: "0 0 0.85rem", fontSize: "0.82rem", opacity: 0.6 }}>
            Select up to 4 types. We'll balance the quantity to create a full and beautiful set.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {TREAT_OPTIONS.map((t) => {
              const active = treats.includes(t.id);
              const disabled = !active && treats.length >= MAX_TREATS;
              return (
                <div
                  key={t.id}
                  style={{
                    ...(active ? cardActive : card),
                    opacity: disabled ? 0.45 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  onClick={() => !disabled && toggleTreat(t.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Check active={active} />
                    <span style={{ fontWeight: 600, fontSize: "0.92rem" }}>{t.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {treats.length === MAX_TREATS && (
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--cherry, #c05)" }}>
              Maximum 4 types selected.
            </p>
          )}
        </div>

        {/* STEP 3: Color Palette */}
        <div style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 3</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Color palette</span>
          </div>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", opacity: 0.6 }}>
            2–3 colors included. Upgraded designs may include additional colors.
          </p>
          <input
            type="text"
            placeholder="e.g. dusty rose, ivory, sage green"
            value={colorNote}
            onChange={(e) => setColorNote(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "0.75rem 1rem", fontSize: "0.92rem",
              border: "1px solid var(--border, #e8e4de)", borderRadius: "0.5rem",
              background: "#fff", outline: "none",
            }}
          />
        </div>

        {/* STEP 4: Design Style */}
        <div style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 4</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Design style</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {DESIGN_TIERS.map((d) => (
              <div
                key={d.id}
                style={designTier === d.id ? cardActive : card}
                onClick={() => setDesignTier(d.id)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <Dot active={designTier === d.id} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.1rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>{d.label}</span>
                      {d.popular && (
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px", background: "var(--cherry, #c05)", color: "#fff" }}>
                          ⭐ Most Popular
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>{d.desc}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, color: d.priceAdd > 0 ? "var(--cherry, #c05)" : "inherit", opacity: d.priceAdd === 0 ? 0.55 : 1 }}>
                    {d.priceLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 5: Flavor */}
        <div style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 5</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Flavor</span>
          </div>

          {/* 1 flavor option */}
          <div
            style={!useTwoFlavours ? cardActive : card}
            onClick={() => { setUseTwoFlavours(false); setSecondFlavour(""); }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Dot active={!useTwoFlavours} />
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>1 flavor</div>
                <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>Included</div>
              </div>
            </div>
          </div>

          {!useTwoFlavours && (
            <div style={{ marginTop: "0.65rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {CAKE_FLAVOURS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFlavour(f.name)}
                  style={{
                    textAlign: "left", padding: "0.6rem 0.9rem",
                    borderRadius: "0.4rem", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
                    border: flavour === f.name ? "2px solid var(--cherry, #c05)" : "1px solid var(--border, #e8e4de)",
                    background: flavour === f.name ? "#fff8f8" : "#fff",
                    color: "inherit",
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}

          {/* 2 flavors option */}
          <div
            style={{ ...(useTwoFlavours ? cardActive : card), marginTop: "0.65rem" }}
            onClick={() => setUseTwoFlavours(true)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Dot active={useTwoFlavours} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>2 flavors</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px", background: "var(--cherry, #c05)", color: "#fff" }}>
                    ⭐ Recommended
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", opacity: 0.55, marginTop: "0.1rem" }}>+$12 · even split · more variety &amp; crowd-friendly</div>
              </div>
            </div>
          </div>

          {useTwoFlavours && (
            <div style={{ marginTop: "0.65rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, opacity: 0.55, marginBottom: "0.2rem" }}>1st flavor</div>
              {CAKE_FLAVOURS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => { setFlavour(f.name); if (secondFlavour === f.name) setSecondFlavour(""); }}
                  style={{
                    textAlign: "left", padding: "0.6rem 0.9rem",
                    borderRadius: "0.4rem", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
                    border: flavour === f.name ? "2px solid var(--cherry, #c05)" : "1px solid var(--border, #e8e4de)",
                    background: flavour === f.name ? "#fff8f8" : "#fff",
                    color: "inherit",
                  }}
                >
                  {f.name}
                </button>
              ))}
              {flavour && (
                <>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, opacity: 0.55, margin: "0.5rem 0 0.2rem" }}>2nd flavor</div>
                  {CAKE_FLAVOURS.filter((f) => f.name !== flavour).map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setSecondFlavour(f.name)}
                      style={{
                        textAlign: "left", padding: "0.6rem 0.9rem",
                        borderRadius: "0.4rem", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
                        border: secondFlavour === f.name ? "2px solid var(--cherry, #c05)" : "1px solid var(--border, #e8e4de)",
                        background: secondFlavour === f.name ? "#fff8f8" : "#fff",
                        color: "inherit",
                      }}
                    >
                      {f.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* STEP 6: Mid CTA */}
        <div style={{ ...sectionStyle, textAlign: "center", padding: "1.5rem 0 2rem" }}>
          <p style={{ margin: "0 0 1rem", fontWeight: 700, fontSize: "1rem" }}>Ready to lock in your order?</p>
          <button
            onClick={() => { setTempDate(pickupDate); setShowDatePicker(true); }}
            style={{
              padding: "0.85rem 2rem", fontSize: "1rem", fontWeight: 700,
              borderRadius: "999px", border: "none", cursor: "pointer",
              background: "var(--cherry, #c05)", color: "#fff",
            }}
          >
            {pickupDate ? `📅 ${formatPickupDate(pickupDate)}` : "Reserve Your Date ✨"}
          </button>
          {pickupDate && (
            <button
              onClick={() => { setTempDate(pickupDate); setShowDatePicker(true); }}
              style={{ display: "block", margin: "0.5rem auto 0", fontSize: "0.78rem", opacity: 0.5, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              Change date
            </button>
          )}
        </div>

        {/* STEP 7: Theme Notes */}
        <div style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 6</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Theme &amp; inspiration <span style={{ fontWeight: 400, opacity: 0.45, fontSize: "0.82rem" }}>(optional)</span></span>
          </div>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", opacity: 0.6 }}>
            Tell us your theme, colors, or overall vibe
          </p>
          <textarea
            ref={themeRef}
            placeholder="e.g. soft pink + ivory, bows, minimal, elegant"
            value={themeNote}
            onChange={(e) => setThemeNote(e.target.value)}
            rows={3}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "0.75rem 1rem", fontSize: "0.92rem",
              border: "1px solid var(--border, #e8e4de)", borderRadius: "0.5rem",
              background: "#fff", outline: "none", resize: "vertical",
            }}
          />
        </div>

        {/* STEP 8: Important Notes */}
        <div style={{ ...sectionStyle, background: "var(--surface, #faf9f7)", borderRadius: "0.65rem", padding: "1rem 1.15rem", border: "1px solid var(--border, #e8e4de)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, opacity: 0.5, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Good to know</div>
          <ul style={{ margin: 0, padding: "0 0 0 1rem", fontSize: "0.82rem", opacity: 0.65, lineHeight: 1.7 }}>
            <li>Designs are semi-custom based on your selected palette</li>
            <li>Detailed character or logo designs require custom approval</li>
            <li>Flavor splits are evenly divided</li>
            <li>Please allow 3–7 days notice depending on set size</li>
          </ul>
        </div>

        {/* URGENCY */}
        <div style={{ textAlign: "center", padding: "0.5rem 0 1rem", fontSize: "0.85rem", opacity: 0.7 }}>
          Weekend spots fill quickly — order by Thursday to secure your pickup ✨
        </div>

        {/* ORDER SUMMARY */}
        {isComplete && (
          <div style={{
            background: "linear-gradient(135deg, #fff5f5 0%, #fff9f2 100%)",
            border: "1px solid var(--border, #e8e4de)",
            borderRadius: "0.75rem",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.75rem", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Order Summary</div>
            <div style={{ fontSize: "0.88rem", lineHeight: 1.8 }}>
              <div><strong>Set:</strong> {size.label} ({size.pcs} pcs)</div>
              <div><strong>Treats:</strong> {treats.map((id) => TREAT_OPTIONS.find((t) => t.id === id)!.label).join(", ")}</div>
              <div><strong>Colors:</strong> {colorNote}</div>
              <div><strong>Design:</strong> {design?.label}</div>
              <div>
                <strong>Flavor:</strong>{" "}
                {useTwoFlavours && flavour && secondFlavour
                  ? `${flavour} + ${secondFlavour} (50/50 split, +$${FLAVOUR_ADDON_PRICE})`
                  : flavour}
              </div>
              {themeNote && <div><strong>Theme:</strong> {themeNote}</div>}
              {pickupDate && <div><strong>Pickup Date:</strong> {formatPickupDate(pickupDate)}</div>}
            </div>
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border, #e8e4de)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--cherry, #c05)" }}>${effectivePrice}</span>
            </div>
          </div>
        )}
      </div>

      {/* DATE PICKER MODAL */}
      {showDatePicker && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDatePicker(false); }}
        >
          <div style={{
            background: "#fff",
            borderRadius: "1.25rem 1.25rem 0 0",
            padding: "1.75rem 1.5rem calc(1.75rem + env(safe-area-inset-bottom))",
            width: "100%", maxWidth: 520,
            boxSizing: "border-box",
          }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#ddd", margin: "0 auto 1.5rem" }} />

            <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.1rem" }}>Pick your date</h3>
            <p style={{ margin: "0 0 1.25rem", fontSize: "0.83rem", opacity: 0.55 }}>
              Please allow at least 3 days notice. Weekend spots fill quickly!
            </p>

            <input
              type="date"
              value={tempDate}
              min={getMinDate()}
              onChange={(e) => setTempDate(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "0.85rem 1rem", fontSize: "1rem",
                border: "1.5px solid var(--border, #e8e4de)", borderRadius: "0.65rem",
                background: "#fafafa", outline: "none",
                marginBottom: "1.25rem",
                colorScheme: "light",
              }}
            />

            {tempDate && (
              <div style={{
                padding: "0.75rem 1rem", borderRadius: "0.5rem",
                background: "#fff8f8", border: "1px solid #fdd",
                fontSize: "0.88rem", fontWeight: 600, marginBottom: "1rem",
                color: "var(--cherry, #c05)",
              }}>
                📅 {formatPickupDate(tempDate)}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.65rem" }}>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{
                  flex: 1, padding: "0.85rem", fontWeight: 600, fontSize: "0.95rem",
                  borderRadius: "999px", border: "1.5px solid var(--border, #e8e4de)",
                  background: "#fff", cursor: "pointer", color: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!tempDate) return;
                  setPickupDate(tempDate);
                  setShowDatePicker(false);
                  setTimeout(() => themeRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
                }}
                disabled={!tempDate}
                style={{
                  flex: 2, padding: "0.85rem", fontWeight: 700, fontSize: "0.95rem",
                  borderRadius: "999px", border: "none",
                  background: tempDate ? "var(--cherry, #c05)" : "#ccc",
                  color: "#fff", cursor: tempDate ? "pointer" : "not-allowed",
                }}
              >
                Confirm Date ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BUTTON */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        padding: "0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid var(--border, #e8e4de)",
      }}>
        {!pickupDate ? (
          <button
            onClick={() => { setTempDate(""); setShowDatePicker(true); }}
            style={{
              width: "100%", maxWidth: 480, display: "block", margin: "0 auto",
              padding: "0.9rem 1.5rem", fontSize: "1rem", fontWeight: 700,
              borderRadius: "999px", border: "none", cursor: "pointer",
              background: "var(--cherry, #c05)", color: "#fff",
              transition: "background 0.2s",
            }}
          >
            Reserve Your Date ✨
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!isComplete}
            style={{
              width: "100%", maxWidth: 480, display: "block", margin: "0 auto",
              padding: "0.9rem 1.5rem", fontSize: "1rem", fontWeight: 700,
              borderRadius: "999px", border: "none", cursor: isComplete ? "pointer" : "not-allowed",
              background: isComplete ? "var(--cherry, #c05)" : "#ccc",
              color: "#fff",
              transition: "background 0.2s",
            }}
          >
            {added ? "Added to cart ✓" : isComplete ? "Add to Cart ✨" : "Complete your selections above"}
          </button>
        )}
      </div>

      <V2Footer />
    </>
  );
}
