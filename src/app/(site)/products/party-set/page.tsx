"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CAKE_FLAVOURS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import V2Header from "../../components/V2Header";
import V2Footer from "../../components/V2Footer";

interface TreatOpt {
  name: string;
  exclusiveWith?: string[];
  maxCount?: number;
}

interface DesignTier {
  name: string;
  description: string;
  priceLabel: string;
  priceAdd: number;
  popular?: boolean;
}

interface PartySize {
  id: string;
  label: string;
  pcs: number;
  badge: string;
  badgeColor: string;
  price: number;
  description: string;
  maxTreats: number;
  treats: TreatOpt[];
  fixedFlavour: boolean;
  designTiers: DesignTier[];
}

const FLAVOUR_ADDON_PRICE = 12;
const VANILLA_DESC =
  "Made with premium Madagascar and Mexican vanilla in our own custom blend, with real vanilla beans included.";

const PARTY_SIZES: PartySize[] = [
  {
    id: "small",
    label: "Small Set",
    pcs: 36,
    badge: "Starter",
    badgeColor: "#8a8a8a",
    price: 135,
    description: "A sweet and simple option for intimate gatherings.",
    maxTreats: 3,
    treats: [
      { name: "Cake Pop", exclusiveWith: ["Cakesicle"] },
      { name: "Cakesicle", exclusiveWith: ["Cake Pop"] },
      { name: "Twisted Pretzel", maxCount: 3 },
      { name: "초코쿠키(오레오®️)", maxCount: 3 },
      { name: "Marshmallow", maxCount: 3 },
    ],
    fixedFlavour: true,
    designTiers: [
      { name: "Basic Design", description: "2 colors · basic coating · drizzle (1–2 styles) · sprinkle / pearl / glitter · simple pattern", priceLabel: "Included", priceAdd: 0 },
      { name: "+3rd Color", description: "Everything in Basic plus one additional color", priceLabel: "+$10", priceAdd: 10 },
      { name: "Basic Custom", description: "Pattern add-on for a more personalized look", priceLabel: "+$15", priceAdd: 15 },
      { name: "Medium Custom", description: "Themed styling — baby shower, birthday, seasonal palettes", priceLabel: "+$25", priceAdd: 25, popular: true },
      { name: "Full Custom", description: "Characters, intricate details, and elaborate custom work", priceLabel: "+$40", priceAdd: 40 },
    ],
  },
  {
    id: "medium",
    label: "Medium Set",
    pcs: 48,
    badge: "Most Popular",
    badgeColor: "var(--cherry, #c05)",
    price: 185,
    description: "Our most popular choice for a balanced and polished dessert table.",
    maxTreats: 4,
    treats: [
      { name: "Cake Pop", maxCount: 2 },
      { name: "Cakesicle", maxCount: 1 },
      { name: "Caramel Pretzel Rod", maxCount: 4 },
      { name: "초코쿠키(오레오®️)", maxCount: 4 },
      { name: "Rice Krispies", maxCount: 4 },
      { name: "Marshmallow", maxCount: 4 },
    ],
    fixedFlavour: true,
    designTiers: [
      { name: "Basic Design", description: "3 colors · drizzle + pattern mix · sprinkle / pearl / glitter · simple theme feel", priceLabel: "Included", priceAdd: 0 },
      { name: "+4th Color", description: "Everything in Basic plus one additional color", priceLabel: "+$10", priceAdd: 10 },
      { name: "Basic Custom", description: "Pattern add-on for a more personalized look", priceLabel: "+$20", priceAdd: 20 },
      { name: "Medium Custom", description: "Stronger themed styling — cohesive event aesthetics", priceLabel: "+$30", priceAdd: 30, popular: true },
      { name: "Full Custom", description: "Characters, intricate details, and elaborate custom work", priceLabel: "+$45", priceAdd: 45 },
    ],
  },
  {
    id: "large",
    label: "Large Set",
    pcs: 96,
    badge: "Best Value",
    badgeColor: "#2a7a5e",
    price: 310,
    description: "Perfect for larger celebrations with more variety and visual impact.",
    maxTreats: 8,
    treats: [
      { name: "Cake Pop", maxCount: 4 },
      { name: "Cakesicle", maxCount: 1 },
      { name: "Caramel Pretzel Rod", maxCount: 8 },
      { name: "초코쿠키(오레오®️)", maxCount: 8 },
      { name: "Rice Krispies", maxCount: 8 },
      { name: "Marshmallow", maxCount: 8 },
    ],
    fixedFlavour: false,
    designTiers: [
      { name: "Basic Design", description: "3–4 colors · varied drizzle + pattern mix · sprinkle / pearl / glitter · 1–2 simple custom points (e.g. initials, number, simple topper)", priceLabel: "Included", priceAdd: 0 },
      { name: "+5th Color", description: "Everything in Basic plus one additional color", priceLabel: "+$10", priceAdd: 10 },
      { name: "Basic Custom", description: "Pattern add-on for a more personalized look", priceLabel: "+$25", priceAdd: 25 },
      { name: "Medium Custom", description: "Stronger themed styling — cohesive event aesthetics with elevated details", priceLabel: "+$40", priceAdd: 40, popular: true },
      { name: "Full Custom", description: "Characters, intricate details, and elaborate custom work throughout", priceLabel: "+$60", priceAdd: 60 },
    ],
  },
];

const stepLabelStyle: React.CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  opacity: 0.35,
  flexShrink: 0,
};

const stepHeadStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "0.6rem",
  marginBottom: "0.75rem",
};

const sectionStyle: React.CSSProperties = {
  marginBottom: "2rem",
  paddingBottom: "2rem",
  borderBottom: "1px solid var(--border, #e8e4de)",
};

function RadioDot({ active }: { active: boolean }) {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: active ? "5px solid var(--cherry, #c05)" : "2px solid #ccc",
        flexShrink: 0,
        marginTop: 2,
        transition: "border 0.15s",
      }}
    />
  );
}

export default function PartySetPage() {
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [treatCounts, setTreatCounts] = useState<Record<string, number>>({});
  const [colorNote, setColorNote] = useState<string>("");
  const [selectedDesignTier, setSelectedDesignTier] = useState<string>("");
  const [selectedFlavour, setSelectedFlavour] = useState<string>("");
  const [secondFlavour, setSecondFlavour] = useState<string>("");
  const [themeNote, setThemeNote] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  const size = PARTY_SIZES.find((s) => s.id === selectedSizeId);
  const maxTreats = size?.maxTreats ?? 0;
  const totalTreatsSelected = Object.values(treatCounts).reduce((s, c) => s + c, 0);
  const designPriceAdd = size?.designTiers.find((t) => t.name === selectedDesignTier)?.priceAdd ?? 0;
  const flavourAddonAdd = secondFlavour ? FLAVOUR_ADDON_PRICE : 0;
  const effectivePrice = (size?.price ?? 0) + designPriceAdd + flavourAddonAdd;

  function selectSize(id: string) {
    setSelectedSizeId(id);
    setTreatCounts({});
    setSelectedDesignTier("");
    setSelectedFlavour("");
    setSecondFlavour("");
  }

  function getTreatCount(name: string) {
    return treatCounts[name] ?? 0;
  }

  function addTreat(treatName: string) {
    if (!size) return;
    const treatDef = size.treats.find((t) => t.name === treatName)!;
    const currentCount = getTreatCount(treatName);
    const maxCount = treatDef.maxCount ?? 1;
    if (currentCount >= maxCount) return;
    if (totalTreatsSelected >= maxTreats) return;
    if (treatDef.exclusiveWith?.some((ex) => (treatCounts[ex] ?? 0) > 0)) return;
    setTreatCounts((prev) => ({ ...prev, [treatName]: currentCount + 1 }));
  }

  function removeTreat(treatName: string) {
    const currentCount = getTreatCount(treatName);
    if (currentCount <= 0) return;
    setTreatCounts((prev) => ({ ...prev, [treatName]: currentCount - 1 }));
  }

  function isTreatAddDisabled(treatName: string): boolean {
    if (!size) return true;
    const treatDef = size.treats.find((t) => t.name === treatName)!;
    const currentCount = getTreatCount(treatName);
    if (currentCount >= (treatDef.maxCount ?? 1)) return true;
    if (totalTreatsSelected >= maxTreats) return true;
    if (treatDef.exclusiveWith?.some((ex) => (treatCounts[ex] ?? 0) > 0)) return true;
    return false;
  }

  function buildTreatsLabel(): string {
    if (!size) return "";
    return size.treats
      .filter((t) => (treatCounts[t.name] ?? 0) > 0)
      .map((t) => {
        const count = treatCounts[t.name] ?? 0;
        return count > 1 ? `${t.name} ×${count}` : t.name;
      })
      .join(", ");
  }

  const primaryFlavour = size?.fixedFlavour ? "Classic Vanilla" : selectedFlavour;
  const isComplete =
    !!size &&
    totalTreatsSelected >= maxTreats &&
    !!selectedDesignTier &&
    (size.fixedFlavour || !!selectedFlavour);

  function handleAddToCart() {
    if (!size) { alert("Please select a set size."); return; }
    if (totalTreatsSelected < maxTreats) { alert(`Please select ${maxTreats} treat dozen(s).`); return; }
    if (!selectedDesignTier) { alert("Please select a design option."); return; }
    if (!size.fixedFlavour && !selectedFlavour) { alert("Please select a flavour."); return; }

    const noteParts: string[] = [];
    noteParts.push(`Treats: ${buildTreatsLabel()}`);
    if (colorNote.trim()) noteParts.push(`Color: ${colorNote.trim()}`);
    const tierInfo = size.designTiers.find((t) => t.name === selectedDesignTier)!;
    noteParts.push(`Design: ${tierInfo.name}${tierInfo.priceAdd > 0 ? ` (${tierInfo.priceLabel})` : ""}`);
    if (secondFlavour) {
      noteParts.push(`Flavour: ${primaryFlavour} + ${secondFlavour} (50/50 split, +$${FLAVOUR_ADDON_PRICE})`);
    } else {
      noteParts.push(`Flavour: ${primaryFlavour}`);
    }
    if (themeNote.trim()) noteParts.push(`Theme/Notes: ${themeNote.trim()}`);

    addItem(
      {
        productSlug: selectedSizeId,
        variantLabel: `${size.label} (${size.pcs} pcs)`,
        name: "Party Set",
        price: effectivePrice,
        image: "/images/brand-spread.jpg",
        flavour: primaryFlavour || undefined,
        note: noteParts.join(" | "),
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <V2Header current="shop" />

      <section className="pd">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <Link href="/products">Shop</Link>
          <span className="sep">/</span>
          <span>Party Set</span>
        </nav>

        <div className="pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main">
              <Image
                src="/images/brand-spread.jpg"
                alt="A beautifully arranged party treat set"
                width={800}
                height={1000}
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="pd-details">
            <div className="cat">Party Sets</div>
            <h1>Party Set</h1>

            <div
              className="price"
              style={{ fontSize: size ? "1.5rem" : "1rem", opacity: size ? 1 : 0.4 }}
            >
              {size ? `$${effectivePrice.toFixed(2)}` : "Select a size to see pricing →"}
            </div>

            <p className="lede">
              Each set includes a coordinated selection of chocolate-covered treats with a polished, party-ready finish.
            </p>

            {/* ── Step 1: Set Size ── */}
            <div style={sectionStyle}>
              <div style={stepHeadStyle}>
                <span style={stepLabelStyle}>01</span>
                <h4 style={{ margin: 0 }}>Choose Your Set Size</h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {PARTY_SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectSize(s.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.85rem",
                      padding: "0.9rem 1rem",
                      borderRadius: "0.55rem",
                      border: selectedSizeId === s.id
                        ? "2px solid var(--cherry, #c05)"
                        : "1px solid var(--border, #e8e4de)",
                      background: selectedSizeId === s.id ? "#fff8f8" : "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <RadioDot active={selectedSizeId === s.id} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.label}</span>
                        <span style={{ fontSize: "0.78rem", opacity: 0.5 }}>{s.pcs} pcs</span>
                        <span style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          padding: "0.15rem 0.55rem",
                          borderRadius: "999px",
                          background: s.badgeColor,
                          color: "#fff",
                        }}>
                          {s.badge}
                        </span>
                        <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: "0.95rem" }}>
                          ${s.price}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.81rem", opacity: 0.6, marginTop: "0.25rem", lineHeight: 1.45 }}>
                        {s.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <p style={{ marginTop: "0.7rem", fontSize: "0.8rem", opacity: 0.5, fontStyle: "italic", lineHeight: 1.5, margin: "0.7rem 0 0" }}>
                Not sure which size to choose? Medium is our most popular option, and Large is the best value for bigger celebrations.
              </p>
            </div>

            {/* ── Step 2: Treat Types ── */}
            {size && (
              <div style={sectionStyle}>
                <div style={stepHeadStyle}>
                  <span style={stepLabelStyle}>02</span>
                  <h4 style={{ margin: 0 }}>
                    Choose Your Treat Types
                    <span style={{ fontWeight: 400, fontSize: "0.82rem", opacity: 0.55, marginLeft: "0.5rem" }}>
                      ({totalTreatsSelected}/{maxTreats} selected)
                    </span>
                  </h4>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {size.treats.map((t) => {
                    const count = getTreatCount(t.name);
                    const canAdd = !isTreatAddDisabled(t.name);
                    const maxCount = t.maxCount ?? 1;
                    return (
                      <div key={t.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button
                          className={`option${count > 0 ? " active" : ""}`}
                          onClick={() => (count > 0 ? removeTreat(t.name) : addTreat(t.name))}
                          style={{
                            flex: 1,
                            textAlign: "left",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: "0.15rem",
                            opacity: !canAdd && count === 0 ? 0.32 : 1,
                            cursor: !canAdd && count === 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          <span style={{ fontWeight: 600, display: "flex", justifyContent: "space-between", width: "100%" }}>
                            {t.name}
                            {count > 0 && (
                              <span style={{ background: "var(--cherry, #c05)", color: "#fff", borderRadius: "999px", padding: "0 0.45rem", fontSize: "0.75rem", fontWeight: 700 }}>
                                ×{count}
                              </span>
                            )}
                          </span>
                          <small style={{ fontWeight: 400, opacity: 0.5, fontSize: "0.74rem" }}>
                            Up to {maxCount} dozen
                            {t.exclusiveWith && count === 0 && ` · Cannot combine with ${t.exclusiveWith.join(" or ")}`}
                          </small>
                        </button>
                        {count > 0 && count < maxCount && canAdd && (
                          <button
                            className="option"
                            onClick={() => addTreat(t.name)}
                            style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                          >
                            +1 dozen
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {totalTreatsSelected > 0 && (
                  <p style={{ marginTop: "0.6rem", fontSize: "0.82rem", opacity: 0.65 }}>
                    Selected: {buildTreatsLabel()}
                  </p>
                )}
              </div>
            )}

            {/* ── Step 3: Color Palette ── */}
            {size && (
              <div style={sectionStyle}>
                <div style={stepHeadStyle}>
                  <span style={stepLabelStyle}>03</span>
                  <h4 style={{ margin: 0 }}>Color Palette</h4>
                </div>
                <p style={{ margin: "0 0 0.6rem", fontSize: "0.82rem", opacity: 0.65, lineHeight: 1.5 }}>
                  Describe your preferred colors and we&rsquo;ll match the aesthetic of your event.
                </p>
                <input
                  type="text"
                  value={colorNote}
                  onChange={(e) => setColorNote(e.target.value)}
                  placeholder="e.g. dusty rose, ivory, gold accents"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border, #e8e4de)",
                    fontSize: "0.9rem",
                    background: "#fff",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            )}

            {/* ── Step 4: Design Upgrade ── */}
            {size && (
              <div style={sectionStyle}>
                <div style={stepHeadStyle}>
                  <span style={stepLabelStyle}>04</span>
                  <h4 style={{ margin: 0 }}>Design Upgrade</h4>
                </div>
                <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", opacity: 0.65, lineHeight: 1.5 }}>
                  Create a more elevated dessert table with an upgraded design finish.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  {size.designTiers.map((tier) => (
                    <button
                      key={tier.name}
                      onClick={() => setSelectedDesignTier(tier.name)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                        padding: "0.8rem 1rem",
                        borderRadius: "0.55rem",
                        border: selectedDesignTier === tier.name
                          ? "2px solid var(--cherry, #c05)"
                          : "1px solid var(--border, #e8e4de)",
                        background: selectedDesignTier === tier.name ? "#fff8f8" : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <RadioDot active={selectedDesignTier === tier.name} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>{tier.name}</span>
                          {tier.popular && (
                            <span style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              padding: "0.15rem 0.55rem",
                              borderRadius: "999px",
                              background: "var(--cherry, #c05)",
                              color: "#fff",
                            }}>
                              Most Popular
                            </span>
                          )}
                          <span style={{
                            marginLeft: "auto",
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            color: tier.priceAdd > 0 ? "var(--cherry, #c05)" : "inherit",
                          }}>
                            {tier.priceLabel}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: "0.25rem", lineHeight: 1.5 }}>
                          {tier.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <p style={{ marginTop: "0.6rem", fontSize: "0.75rem", opacity: 0.45, fontStyle: "italic", lineHeight: 1.5 }}>
                  Included designs are based on a semi-custom style. Highly detailed custom artwork, character designs, and logos are not included unless separately approved.
                </p>
              </div>
            )}

            {/* ── Step 5: Flavor Option ── */}
            {size && (
              <div style={sectionStyle}>
                <div style={stepHeadStyle}>
                  <span style={stepLabelStyle}>05</span>
                  <h4 style={{ margin: 0 }}>Flavor Option</h4>
                </div>
                <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", opacity: 0.65, lineHeight: 1.5 }}>
                  Add a second flavor for variety — perfect for sharing and dessert tables.
                </p>

                {/* Fixed flavour note (Small / Medium) */}
                {size.fixedFlavour && (
                  <div style={{ padding: "0.85rem 1rem", background: "var(--surface, #faf9f7)", borderRadius: "0.5rem", border: "1px solid var(--border, #e8e4de)", marginBottom: "0.85rem" }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.5, marginBottom: "0.3rem" }}>Flavour</p>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>Classic Vanilla</p>
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", opacity: 0.6, lineHeight: 1.5 }}>{VANILLA_DESC}</p>
                    <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", opacity: 0.45, fontStyle: "italic" }}>
                      Flavour is fixed for this set and cannot be changed.
                    </p>
                  </div>
                )}

                {/* Free flavour selector (Large) */}
                {!size.fixedFlavour && (
                  <div style={{ marginBottom: "0.85rem" }}>
                    <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "0.85rem" }}>Choose your flavour</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {CAKE_FLAVOURS.map((f) => (
                        <button
                          key={f.name}
                          className={`option${selectedFlavour === f.name ? " active" : ""}`}
                          onClick={() => {
                            setSelectedFlavour(f.name);
                            if (secondFlavour === f.name) setSecondFlavour("");
                          }}
                          style={{ textAlign: "left", flexDirection: "column", alignItems: "flex-start", gap: "0.15rem" }}
                        >
                          <span style={{ fontWeight: 600 }}>{f.name}</span>
                          <small style={{ fontWeight: 400, opacity: 0.65, whiteSpace: "normal", lineHeight: 1.4, fontSize: "0.78rem" }}>{f.description}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2nd flavour upgrade card */}
                {(size.fixedFlavour || (!size.fixedFlavour && selectedFlavour)) && (
                  <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <button
                        className={`option${!secondFlavour ? " active" : ""}`}
                        onClick={() => setSecondFlavour("")}
                        style={{ textAlign: "left", flexDirection: "column", alignItems: "flex-start", gap: "0.15rem" }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          1 flavor{" "}
                          <span style={{ fontWeight: 400, opacity: 0.5, fontSize: "0.8rem" }}>(기본)</span>
                        </span>
                        <small style={{ fontWeight: 400, opacity: 0.6, fontSize: "0.78rem" }}>
                          {size.fixedFlavour ? "Classic Vanilla only" : `${selectedFlavour} only`}
                        </small>
                      </button>

                      <div style={{
                        borderRadius: "0.55rem",
                        border: secondFlavour ? "2px solid var(--cherry, #c05)" : "1px solid var(--border, #e8e4de)",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          padding: "0.7rem 1rem 0.55rem",
                          background: secondFlavour ? "#fff8f8" : "var(--surface, #faf9f7)",
                          borderBottom: "1px solid var(--border, #e8e4de)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>2 flavors</span>
                            <span style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              letterSpacing: "0.04em",
                              padding: "0.15rem 0.55rem",
                              borderRadius: "999px",
                              background: "var(--cherry, #c05)",
                              color: "#fff",
                            }}>
                              추천 ⭐
                            </span>
                            <span style={{ fontSize: "0.78rem", opacity: 0.45, marginLeft: "auto" }}>
                              +${FLAVOUR_ADDON_PRICE} · 50/50 split
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", opacity: 0.6, marginTop: "0.2rem" }}>
                            More variety &amp; crowd-friendly
                          </div>
                        </div>
                        <div style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem", background: "#fff" }}>
                          {(size.fixedFlavour
                            ? CAKE_FLAVOURS.filter((f) => f.name !== "Classic Vanilla")
                            : CAKE_FLAVOURS.filter((f) => f.name !== selectedFlavour)
                          ).map((f) => (
                            <button
                              key={f.name}
                              className={`option${secondFlavour === f.name ? " active" : ""}`}
                              onClick={() => setSecondFlavour(secondFlavour === f.name ? "" : f.name)}
                              style={{ textAlign: "left", flexDirection: "column", alignItems: "flex-start", gap: "0.15rem" }}
                            >
                              <span style={{ fontWeight: 600 }}>{f.name}</span>
                              <small style={{ fontWeight: 400, opacity: 0.65, whiteSpace: "normal", lineHeight: 1.4, fontSize: "0.78rem" }}>{f.description}</small>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {secondFlavour && (
                      <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", opacity: 0.65 }}>
                        {size.fixedFlavour ? "Classic Vanilla" : selectedFlavour} + {secondFlavour} — 50/50 split
                      </p>
                    )}
                    <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", opacity: 0.45, fontStyle: "italic" }}>
                      Two-flavor orders are split evenly. Custom quantity splits are not available.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 6: Theme / Inspiration Notes ── */}
            {size && (
              <div style={{ ...sectionStyle }}>
                <div style={stepHeadStyle}>
                  <span style={stepLabelStyle}>06</span>
                  <h4 style={{ margin: 0 }}>
                    Theme / Inspiration Notes
                    <span style={{ fontWeight: 400, fontSize: "0.82rem", opacity: 0.45, marginLeft: "0.4rem" }}>(optional)</span>
                  </h4>
                </div>
                <p style={{ margin: "0 0 0.6rem", fontSize: "0.82rem", opacity: 0.65, lineHeight: 1.5 }}>
                  Tell us about your event — theme, aesthetic, or any specific design ideas you have in mind.
                </p>
                <textarea
                  value={themeNote}
                  onChange={(e) => setThemeNote(e.target.value)}
                  placeholder="e.g. Boho baby shower, terracotta and eucalyptus, no characters — clean elegant style"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border, #e8e4de)",
                    fontSize: "0.9rem",
                    background: "#fff",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.5,
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            )}

            {/* ── Step 7: Important Notes ── */}
            {size && (
              <div style={{ marginBottom: "1.75rem", padding: "0.85rem 1rem", background: "var(--surface, #faf9f7)", borderRadius: "0.55rem", border: "1px solid var(--border, #e8e4de)" }}>
                <div style={stepHeadStyle}>
                  <span style={stepLabelStyle}>07</span>
                  <h4 style={{ margin: 0, fontSize: "0.85rem" }}>Important Notes</h4>
                </div>
                <ul style={{ margin: 0, padding: "0 0 0 1.1rem", fontSize: "0.8rem", opacity: 0.65, lineHeight: 1.7 }}>
                  <li>Included designs are based on a semi-custom style.</li>
                  <li>Highly detailed custom artwork, character designs, and logos are not included unless separately approved.</li>
                  <li>Two-flavor orders are split evenly. Custom quantity splits are not available.</li>
                  <li>Please allow 3–7 days notice depending on set size.</li>
                </ul>
              </div>
            )}

            {/* ── Order Summary ── */}
            {isComplete && (
              <div style={{
                marginBottom: "1.25rem",
                padding: "1rem 1.1rem",
                background: "var(--surface, #faf9f7)",
                borderRadius: "0.6rem",
                border: "1px solid var(--border, #e8e4de)",
                fontSize: "0.85rem",
                lineHeight: 1.7,
              }}>
                <p style={{ margin: "0 0 0.4rem", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.45 }}>
                  Your Order Summary
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Set Size:</strong> {size!.label} — {size!.pcs} pcs
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Treats:</strong> {buildTreatsLabel()}
                </p>
                {colorNote.trim() && (
                  <p style={{ margin: 0 }}>
                    <strong>Color Palette:</strong> {colorNote}
                  </p>
                )}
                <p style={{ margin: 0 }}>
                  <strong>Design:</strong> {selectedDesignTier}
                  {designPriceAdd > 0 && <span style={{ opacity: 0.55 }}> (+${designPriceAdd})</span>}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Flavour:</strong>{" "}
                  {primaryFlavour}
                  {secondFlavour && ` + ${secondFlavour} (50/50 split)`}
                </p>
                {themeNote.trim() && (
                  <p style={{ margin: 0 }}>
                    <strong>Notes:</strong> {themeNote}
                  </p>
                )}
                <div style={{
                  marginTop: "0.65rem",
                  paddingTop: "0.65rem",
                  borderTop: "1px solid var(--border, #e8e4de)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}>
                  <span>Total</span>
                  <span>${(effectivePrice * quantity).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* ── Qty + Add to Cart ── */}
            {size && (
              <>
                <div className="qty-row">
                  <div className="qty">
                    <button aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                    <span>{quantity}</span>
                    <button aria-label="Increase quantity" onClick={() => setQuantity((q) => q + 1)}>+</button>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center" }}
                    onClick={handleAddToCart}
                  >
                    {added ? "Added ✓" : `Add to cart · $${(effectivePrice * quantity).toFixed(2)}`}
                  </button>
                </div>
                <div className="pd-note" style={{ marginTop: "0.75rem" }}>
                  ~ Designed to make your dessert table feel complete.
                </div>
              </>
            )}

            {!size && (
              <div style={{ padding: "1rem", borderRadius: "0.5rem", border: "1px dashed var(--border, #e8e4de)", textAlign: "center", color: "var(--text-muted, #999)", fontSize: "0.85rem" }}>
                Select a set size above to begin customizing your order.
              </div>
            )}

            {/* Accordion */}
            <div className="accordion" style={{ marginTop: "1.75rem" }}>
              <details open>
                <summary>The details</summary>
                <p>
                  All cake are handcrafted in small batches using premium Belgian chocolate and real vanilla beans, real fruits.
                  Each set is boxed and ribbon-tied for a polished, party-ready presentation.
                </p>
              </details>
              <details>
                <summary>Shipping &amp; delivery</summary>
                <p>
                  Orders placed by Thursday noon ship Friday with weekend delivery. Local pickup available from our studio Mon–Sat.
                  Free delivery on orders over $85. Please allow 3–7 days notice depending on your set size.
                </p>
              </details>
              <details>
                <summary>How to store &amp; serve</summary>
                <p>
                  Best enjoyed within 5 days. Store at room temperature in the original box. We don&rsquo;t freeze our treats — and neither should you.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky bar */}
      {size && (
        <div className="pd-sticky-cta">
          <div className="pd-sticky-cta-inner">
            <div className="pd-sticky-summary">
              <span className="pd-sticky-name">Party Set — {size.label}</span>
              <span className="pd-sticky-price">${(effectivePrice * quantity).toFixed(2)}</span>
            </div>
            <div className="pd-sticky-row">
              <div className="qty">
                <button aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button aria-label="Increase quantity" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
                onClick={handleAddToCart}
              >
                {added ? "Added ✓" : "Add to cart"}
              </button>
            </div>
          </div>
        </div>
      )}

      <V2Footer />
    </>
  );
}
