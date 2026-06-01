"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { getProductBySlug } from "@/data/products";
import { useCart } from "@/context/CartContext";
import V2Header from "../../components/V2Header";
import V2Footer from "../../components/V2Footer";

const _partySetVariants = getProductBySlug("party-set")!.variants;
const _setPrice = (keyword: string): number =>
  _partySetVariants.find((v) => v.label.toLowerCase().startsWith(keyword))?.price ?? 0;
const _cakeProduct = getProductBySlug("party-layer-cake")!;
const _twoTierCakeProduct = getProductBySlug("party-two-tier-cake")!;

const SIZES = [
  {
    id: "mini",
    label: "Mini Dessert Table",
    pcs: 48,
    treatCount: 4,
    price: _setPrice("mini"),
    badge: null as string | null,
    badgeColor: "",
    desc: "A clean, minimal setup for smaller gatherings.",
    subDesc: "Recommended for about 12-18 guests.",
    previewImg: "/images/brand-spread-new.png",
    previewLabel: "Mini Dessert Table",
  },
  {
    id: "classic",
    label: "Classic Dessert Table",
    pcs: 60,
    treatCount: 5,
    price: _setPrice("classic"),
    badge: "♥ Most recommended",
    badgeColor: "var(--cherry, #c05)",
    desc: "A nicely filled table that still feels simple and elegant.",
    subDesc: "Recommended for about 18-25 guests.",
    previewImg: "/images/brand-spread-new.png",
    previewLabel: "Classic Dessert Table",
  },
  {
    id: "signature",
    label: "Signature Dessert Table",
    pcs: 96,
    treatCount: 6,
    price: _setPrice("signature"),
    badge: "✦ Best value",
    badgeColor: "var(--pine)",
    desc: "A full wow, so pretty dessert table look that photographs beautifully.",
    subDesc: "Recommended for about 30-45 guests.",
    previewImg: "/images/treat-boxes/party-set-large.jpeg",
    previewLabel: "Signature Dessert Table",
  },
  {
    id: "luxe",
    label: "Luxe Dessert Table",
    pcs: 120,
    treatCount: 7,
    price: _setPrice("luxe"),
    badge: "Luxury style",
    badgeColor: "var(--cherry, #c05)",
    desc: "A fuller luxury style dessert table for larger celebrations.",
    subDesc: "Recommended for about 45-60 guests.",
    previewImg: "/images/treat-boxes/party-set-large.jpeg",
    previewLabel: "Luxe Dessert Table",
  },
];

const TREAT_OPTIONS = [
  { id: "cake-pops", label: "Cake Pops" },
  { id: "cakesicles", label: "Cakesicles" },
  { id: "cupcakes", label: "Cupcakes" },
  { id: "dubai-chocolate-brownie-shooter-cups", label: "Dubai Chocolate Brownie Shooter Cups" },
  { id: "madeleines", label: "Madeleines", sizeIds: ["mini", "classic", "signature", "luxe"] },
  { id: "caramel-pretzel-rods", label: "Pretzel Rods" },
  { id: "twisted-pretzel", label: "Twisted Pretzel" },
  { id: "oreos", label: "Chocolate sandwich cookies (Oreos®️)" },
  { id: "rice-krispies", label: "Rice Krispies", sizeIds: ["mini", "classic", "signature", "luxe"] },
  { id: "gummi-candy-skewers", label: "Gummi Candy Skewers" },
];


const DESIGN_TIERS = [
  { id: "classic", label: "Classic", desc: "Clean coating, drizzle, simple accents", priceLabel: "Included", priceAdd: 0, popular: false },
  { id: "enhanced", label: "Enhanced", desc: "Layered drizzle, coordinated colors, premium details", priceLabel: "", priceAddBySize: { mini: 25, classic: 30, signature: 35, luxe: 45 }, popular: true },
  { id: "signature", label: "Signature", desc: "Full custom — sculpted cake pop shapes (e.g. martini glass, s'more, cappuccino, pineapple, Pinocchio, teddy bear), piped decorations, or engraved monograms/initials.", priceLabel: "", priceAddBySize: { mini: 45, classic: 55, signature: 70, luxe: 85 }, popular: false },
];

const HAND_TIED_BOWS_ELIGIBLE_TREATS = new Set([
  "cakesicles",
  "cake-pops",
  "rice-krispies",
  "gummi-candy-skewers",
]);
const HAND_TIED_BOWS_PRICE_PER_DOZEN = 10;
const PORTABLE_HOLDER_ELIGIBLE_TREATS = new Set(["cake-pops", "cakesicles"]);
const PORTABLE_HOLDER_PRICE_PER_BOX = 3;
const WRAPPING_PRICE_PER_DOZEN = 3;
const BOXED_WRAPPING_PRICE_PER_DOZEN = 5;

const CAKE_OPTIONS = [
  { id: "none", label: "No cake", priceAdd: 0, desc: "Treats only" },
  { id: "6-inch", label: "Add 6\" Cake", priceAdd: 75, desc: "Starting at +$75" },
  { id: "8-inch", label: "Add 8\" Cake", priceAdd: 125, desc: "Starting at +$125" },
];

const PARTY_FAVOR_OPTIONS = [
  { id: "royal-icing-sugar-cookies", label: "3.5\" Royal Icing Sugar Cookies (1 Dozen)", priceAdd: 50, desc: "+$50" },
];

const CAKE_ADDONS = _cakeProduct.addons ?? [];
const TWO_TIER_DESIGN_TIERS = _twoTierCakeProduct.designTiers?.filter((tier) => tier.priceAdd > 0).map((tier) => ({
  label: tier.name,
  price: tier.priceLabel,
  priceAdd: tier.priceAdd,
})) ?? [];
const PARTY_SET_CAKE_ADDONS = [...CAKE_ADDONS, ...TWO_TIER_DESIGN_TIERS];

function getDesignPriceAdd(design: (typeof DESIGN_TIERS)[number] | undefined, sizeId: string): number {
  if (!design) return 0;
  if ("priceAddBySize" in design && design.priceAddBySize) {
    return design.priceAddBySize[sizeId as keyof typeof design.priceAddBySize] ?? 0;
  }
  return "priceAdd" in design ? design.priceAdd : 0;
}

function getHandTiedBowsPrice(selectedTreats: string[]): number {
  return selectedTreats.filter((id) => HAND_TIED_BOWS_ELIGIBLE_TREATS.has(id)).length * HAND_TIED_BOWS_PRICE_PER_DOZEN;
}

function getPortableHolderBoxCount(selectedTreats: string[]): number {
  return selectedTreats.filter((id) => PORTABLE_HOLDER_ELIGIBLE_TREATS.has(id)).length;
}

function getPortableHolderPrice(selectedTreats: string[]): number {
  return getPortableHolderBoxCount(selectedTreats) * PORTABLE_HOLDER_PRICE_PER_BOX;
}

function getPartySetDozens(size: (typeof SIZES)[number]): number {
  return size.pcs / 12;
}

function getWrappingPrice(size: (typeof SIZES)[number], wrapping: string, selectedTreats: string[]): number {
  const dozens = getPartySetDozens(size);
  if (wrapping === "wrapped") return dozens * WRAPPING_PRICE_PER_DOZEN;
  if (wrapping === "boxed") return getPortableHolderBoxCount(selectedTreats) * BOXED_WRAPPING_PRICE_PER_DOZEN;
  return 0;
}

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

function getInitialSizeId(): string {
  if (typeof window === "undefined") return "mini";
  const requested = new URLSearchParams(window.location.search).get("size");
  return requested && SIZES.some((s) => s.id === requested) ? requested : "mini";
}

export default function PartySetPage() {
  const [sizeId, setSizeId] = useState(getInitialSizeId);
  const [treats, setTreats] = useState<string[]>([]);
  const [designTier, setDesignTier] = useState("");
  const [handTiedBows, setHandTiedBows] = useState(false);
  const [portableHolderBoxes, setPortableHolderBoxes] = useState(false);
  const [wrappingOption, setWrappingOption] = useState("");
  const [cakeOptionId, setCakeOptionId] = useState("none");
  const [selectedCakeAddons, setSelectedCakeAddons] = useState<Record<string, boolean>>({});
  const [selectedPartyFavors, setSelectedPartyFavors] = useState<Record<string, boolean>>({});
  const [themeNote, setThemeNote] = useState("");
  const [inspirationImages, setInspirationImages] = useState<Array<{ name: string; type: string; size: number; dataUrl: string }>>([]);
  const inspirationInputRef = useRef<HTMLInputElement | null>(null);
  const [quantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  const size = SIZES.find((s) => s.id === sizeId)!;
  const requiredTreats = size.treatCount;
  const availableTreatOptions = TREAT_OPTIONS.filter((t) => !t.sizeIds || t.sizeIds.includes(sizeId));
  const design = DESIGN_TIERS.find((d) => d.id === designTier);
  const designPriceAdd = getDesignPriceAdd(design, sizeId);
  const designPriceLabel = designPriceAdd > 0 ? `+$${designPriceAdd}` : "Included";
  const handTiedBowsPrice = handTiedBows ? getHandTiedBowsPrice(treats) : 0;
  const portableHolderBoxCount = getPortableHolderBoxCount(treats);
  const portableHolderBoxesActive = portableHolderBoxes && portableHolderBoxCount > 0;
  const portableHolderPrice = portableHolderBoxesActive ? getPortableHolderPrice(treats) : 0;
  const wrappingPrice = getWrappingPrice(size, wrappingOption, treats);
  const wrappingLabel = wrappingOption === "wrapped" ? "Individually Wrapped" : wrappingOption === "boxed" ? "Individually Wrapped in Boxes" : "";
  const cakeOption = CAKE_OPTIONS.find((option) => option.id === cakeOptionId) ?? CAKE_OPTIONS[0];
  const selectedCakeAddonItems = PARTY_SET_CAKE_ADDONS.filter((addon) => selectedCakeAddons[addon.label]);
  const cakeAddonPrice = selectedCakeAddonItems.reduce((sum, addon) => sum + (addon.priceAdd ?? 0), 0);
  const cakePrice = cakeOption.priceAdd + (cakeOption.id === "none" ? 0 : cakeAddonPrice);
  const selectedPartyFavorItems = PARTY_FAVOR_OPTIONS.filter((option) => selectedPartyFavors[option.label]);
  const partyFavorPrice = selectedPartyFavorItems.reduce((sum, option) => sum + option.priceAdd, 0);
  const effectivePrice = size.price + designPriceAdd + handTiedBowsPrice + portableHolderPrice + wrappingPrice + cakePrice + partyFavorPrice;

  function handleSizeChange(nextSizeId: string) {
    const nextSize = SIZES.find((s) => s.id === nextSizeId)!;
    const nextAvailableTreatIds = new Set(
      TREAT_OPTIONS
        .filter((t) => !t.sizeIds || t.sizeIds.includes(nextSizeId))
        .map((t) => t.id)
    );

    setSizeId(nextSizeId);
    setTreats((prev) => {
      const validTreats = prev.filter((t) => nextAvailableTreatIds.has(t));
      const nextTreats = validTreats.length > nextSize.treatCount ? validTreats.slice(0, nextSize.treatCount) : validTreats;
      if (getPortableHolderBoxCount(nextTreats) === 0) setPortableHolderBoxes(false);
      if (getPortableHolderBoxCount(nextTreats) === 0) setWrappingOption((current) => current === "boxed" ? "" : current);
      return nextTreats;
    });
  }

  const isComplete =
    treats.length >= requiredTreats &&
    designTier !== "";

  function scrollToMissing() {
    let id = "";
    if (treats.length < requiredTreats) id = "step-treats";
    else if (!designTier) id = "step-design";
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getMissingLabel(): string {
    if (treats.length < requiredTreats) {
      const need = requiredTreats - treats.length;
      return `Select ${need} more treat ${need === 1 ? "type" : "types"}`;
    }
    if (!designTier) return "Choose a design style";
    return "";
  }

  function toggleTreat(id: string) {
    setTreats((prev) => {
      const nextTreats = prev.includes(id)
        ? prev.filter((t) => t !== id)
        : prev.length >= requiredTreats
          ? prev
          : [...prev, id];
      if (getPortableHolderBoxCount(nextTreats) === 0) setPortableHolderBoxes(false);
      if (getPortableHolderBoxCount(nextTreats) === 0) setWrappingOption((current) => current === "boxed" ? "" : current);
      return nextTreats;
    });
  }

  async function handleInspirationFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/")).slice(0, 5);
    const images = await Promise.all(
      files.map(
        (file) =>
          new Promise<{ name: string; type: string; size: number; dataUrl: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataUrl: String(reader.result) });
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );
    setInspirationImages(images);
  }

  function buildCartNote() {
    const parts: string[] = [];
    parts.push(`Size: ${size.label}`);
    parts.push(`Treats: ${treats.map((id) => TREAT_OPTIONS.find((t) => t.id === id)!.label).join(", ")}`);
    parts.push(`Design: ${design?.label ?? ""}${designPriceAdd > 0 ? ` (${designPriceLabel})` : ""}`);
    if (handTiedBows) parts.push(`Add-ons: Hand Tied Bows (+$${handTiedBowsPrice})`);
    if (portableHolderBoxesActive) parts.push(`Add-ons: Portable Cake Pop Holder Standing Boxes (${portableHolderBoxCount} box${portableHolderBoxCount === 1 ? "" : "es"}, +$${portableHolderPrice})`);
    if (wrappingOption) parts.push(`Packaging: ${wrappingLabel} (+$${wrappingPrice})`);
    if (cakeOption.id !== "none") {
      parts.push(`Cake: ${cakeOption.label} (+$${cakeOption.priceAdd})`);
      if (selectedCakeAddonItems.length > 0) {
        parts.push(`Cake add-ons: ${selectedCakeAddonItems.map((addon) => `${addon.label}${addon.priceAdd ? ` (+$${addon.priceAdd})` : ""}`).join(", ")}`);
      }
    }
    if (selectedPartyFavorItems.length > 0) {
      parts.push(`Party favors: ${selectedPartyFavorItems.map((option) => `${option.label} (+$${option.priceAdd})`).join(", ")}`);
    }
    if (themeNote.trim()) parts.push(`Theme/Notes: ${themeNote.trim()}`);
    if (inspirationImages.length > 0) parts.push(`Inspiration photos: ${inspirationImages.map((img) => img.name).join(", ")}`);
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
      inspirationImages: inspirationImages.length > 0 ? inspirationImages : undefined,
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
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>6ft Dessert Table Guide</span>
          </div>
          <p style={{ margin: "0 0 0.85rem", fontSize: "0.82rem", opacity: 0.6, lineHeight: 1.6 }}>
            For a standard 6ft party table, choose the size that best matches your guest count and the look you want.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {SIZES.map((s) => (
              <div
                key={s.id}
                style={sizeId === s.id ? cardActive : card}
                onClick={() => handleSizeChange(s.id)}
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
        <div id="step-treats" style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 2</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Choose your treat mix — pick {requiredTreats}</span>
          </div>
          <p style={{ margin: "0 0 0.85rem", fontSize: "0.82rem", opacity: 0.6 }}>
            Select {requiredTreats} types for your {size.label}. We&apos;ll balance the quantity to create a full and beautiful set.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            {availableTreatOptions.map((t) => {
              const active = treats.includes(t.id);
              const disabled = !active && treats.length >= requiredTreats;
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
          {treats.length < requiredTreats ? (
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--cherry, #c05)" }}>
              Please select {requiredTreats - treats.length} more {requiredTreats - treats.length === 1 ? "type" : "types"} to continue.
            </p>
          ) : (
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--cherry, #c05)" }}>
              All {requiredTreats} types selected ✓
            </p>
          )}
        </div>

        {/* STEP 3: Design Style */}
        <div id="step-design" style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 3</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Design style</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {DESIGN_TIERS.map((d) => {
              const priceAdd = getDesignPriceAdd(d, sizeId);
              const priceLabel = priceAdd > 0 ? `+$${priceAdd}` : "Included";
              return (
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
                          ♥ Most loved
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.8rem", opacity: 0.6 }}>{d.desc}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, color: priceAdd > 0 ? "var(--cherry, #c05)" : "inherit", opacity: priceAdd === 0 ? 0.55 : 1 }}>
                    {priceLabel}
                  </div>
                </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 4: Add-ons */}
        <div style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 4</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Add-ons <span style={{ fontWeight: 400, opacity: 0.45, fontSize: "0.82rem" }}>(optional)</span></span>
          </div>
          <div
            style={handTiedBows ? cardActive : card}
            onClick={() => setHandTiedBows((selected) => !selected)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Check active={handTiedBows} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>Hand Tied Bows</div>
                <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>+$10 per dozen for Cakesicles, Cake Pops, Rice Krispies, or Gummi Candy Skewers</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, color: "var(--cherry, #c05)" }}>
                +${getHandTiedBowsPrice(treats)}
              </div>
            </div>
          </div>
          <div
            style={{
              ...(portableHolderBoxesActive ? cardActive : card),
              opacity: portableHolderBoxCount > 0 ? 1 : 0.5,
              cursor: portableHolderBoxCount > 0 ? "pointer" : "not-allowed",
              marginTop: "0.65rem",
            }}
            onClick={() => {
              if (portableHolderBoxCount === 0) return;
              setPortableHolderBoxes((selected) => !selected);
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Check active={portableHolderBoxesActive} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>Portable Cake Pop Holder Standing Boxes</div>
                <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>+$3 per box for Cake Pops or Cakesicles only</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, color: "var(--cherry, #c05)" }}>
                +${getPortableHolderPrice(treats)}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", marginTop: "0.65rem" }}>
            {[
              { id: "wrapped", label: "Individually Wrapped", desc: "+$3 per dozen", price: getPartySetDozens(size) * WRAPPING_PRICE_PER_DOZEN },
              { id: "boxed", label: "Individually Wrapped in Boxes", desc: "+$5 per box for Cake Pops or Cakesicles only", price: getPortableHolderBoxCount(treats) * BOXED_WRAPPING_PRICE_PER_DOZEN, requiresEligibleTreat: true },
            ].map((option) => {
              const active = wrappingOption === option.id;
              const disabled = Boolean(option.requiresEligibleTreat && portableHolderBoxCount === 0);
              return (
                <div
                  key={option.id}
                  style={{
                    ...(active ? cardActive : card),
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  onClick={() => {
                    if (disabled) return;
                    setWrappingOption((current) => current === option.id ? "" : option.id);
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Check active={active} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{option.label}</div>
                      <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>{option.desc}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, color: "var(--cherry, #c05)" }}>
                      +${option.price}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, opacity: 0.5, marginBottom: "0.55rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cake centerpiece</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {CAKE_OPTIONS.map((option) => {
                const active = cakeOptionId === option.id;
                return (
                  <div
                    key={option.id}
                    style={active ? cardActive : card}
                    onClick={() => {
                      setCakeOptionId(option.id);
                      if (option.id === "none") setSelectedCakeAddons({});
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Dot active={active} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{option.label}</div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>{option.desc}</div>
                      </div>
                      {option.priceAdd > 0 && (
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, color: "var(--cherry, #c05)" }}>
                          +${option.priceAdd}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {cakeOption.id !== "none" && (
              <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, opacity: 0.55 }}>Cake add-ons</div>
                {PARTY_SET_CAKE_ADDONS.map((addon) => {
                  const active = Boolean(selectedCakeAddons[addon.label]);
                  const priceAdd = addon.priceAdd ?? 0;
                  return (
                    <div
                      key={addon.label}
                      style={active ? cardActive : card}
                      onClick={() => setSelectedCakeAddons((prev) => ({ ...prev, [addon.label]: !prev[addon.label] }))}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Check active={active} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{addon.label}</div>
                          <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>{addon.price}</div>
                        </div>
                        {priceAdd > 0 && (
                          <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, color: "var(--cherry, #c05)" }}>
                            +${priceAdd}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, opacity: 0.5, marginBottom: "0.55rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Party favors</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {PARTY_FAVOR_OPTIONS.map((option) => {
                const active = Boolean(selectedPartyFavors[option.label]);
                return (
                  <div
                    key={option.id}
                    style={active ? cardActive : card}
                    onClick={() => setSelectedPartyFavors((prev) => ({ ...prev, [option.label]: !prev[option.label] }))}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Check active={active} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{option.label}</div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>{option.desc}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, color: "var(--cherry, #c05)" }}>
                        +${option.priceAdd}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 5: Theme Notes */}
        <div style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 5</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Theme &amp; inspiration <span style={{ fontWeight: 400, opacity: 0.45, fontSize: "0.82rem" }}>(optional)</span></span>
          </div>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", opacity: 0.6 }}>
            Tell us your theme, colors, or overall vibe
          </p>
          <textarea
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
          <input
            ref={inspirationInputRef}
            type="file"
            accept="image/*"
            multiple
            aria-label="Choose inspiration photos"
            onChange={(e) => void handleInspirationFiles(e.target.files)}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => inspirationInputRef.current?.click()}
            style={{
              width: "100%", marginTop: "0.75rem", padding: "0.75rem 1rem",
              fontSize: "0.92rem", fontWeight: 700, borderRadius: "0.5rem",
              border: "1px solid var(--border, #e8e4de)", background: "#fff",
              color: "inherit", cursor: "pointer",
            }}
          >
            Choose Photos
          </button>
          {inspirationImages.length > 0 && (
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", opacity: 0.65 }}>
              Selected: {inspirationImages.map((img) => img.name).join(", ")}
            </p>
          )}
        </div>

        {/* STEP 6: Important Notes */}
        <div style={{ ...sectionStyle, background: "var(--surface, #faf9f7)", borderRadius: "0.65rem", padding: "1rem 1.15rem", border: "1px solid var(--border, #e8e4de)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, opacity: 0.5, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Good to know</div>
          <ul style={{ margin: 0, padding: "0 0 0 1rem", fontSize: "0.82rem", opacity: 0.65, lineHeight: 1.7 }}>
            <li>Designs are semi-custom based on your selected palette</li>
            <li>Detailed character or logo designs require custom approval</li>
            <li>Please allow 3–7 days notice depending on set size</li>
          </ul>
        </div>

        {/* URGENCY */}
        <div style={{ textAlign: "center", padding: "0.5rem 0 1rem", fontSize: "0.85rem", opacity: 0.7 }}>
          Weekend spots fill quickly — order by Thursday to secure your pickup.
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
              <div><strong>Design:</strong> {design?.label}{designPriceAdd > 0 ? ` (${designPriceLabel})` : ""}</div>
              {handTiedBows && <div><strong>Add-on:</strong> Hand Tied Bows (+${handTiedBowsPrice})</div>}
              {portableHolderBoxesActive && <div><strong>Add-on:</strong> Portable Cake Pop Holder Standing Boxes ({portableHolderBoxCount} box{portableHolderBoxCount === 1 ? "" : "es"}, +${portableHolderPrice})</div>}
              {wrappingOption && <div><strong>Packaging:</strong> {wrappingLabel} (+${wrappingPrice})</div>}
              {cakeOption.id !== "none" && <div><strong>Cake:</strong> {cakeOption.label} (+${cakeOption.priceAdd})</div>}
              {cakeOption.id !== "none" && selectedCakeAddonItems.length > 0 && (
                <div><strong>Cake add-ons:</strong> {selectedCakeAddonItems.map((addon) => `${addon.label}${addon.priceAdd ? ` (+$${addon.priceAdd})` : ""}`).join(", ")}</div>
              )}
              {selectedPartyFavorItems.length > 0 && <div><strong>Party favors:</strong> {selectedPartyFavorItems.map((option) => `${option.label} (+$${option.priceAdd})`).join(", ")}</div>}
              {themeNote && <div><strong>Theme:</strong> {themeNote}</div>}
              {inspirationImages.length > 0 && <div><strong>Inspiration photos:</strong> {inspirationImages.map((img) => img.name).join(", ")}</div>}
            </div>
            <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border, #e8e4de)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--cherry, #c05)" }}>${effectivePrice}</span>
            </div>
          </div>
        )}
      </div>

      {/* STICKY BUTTON */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        padding: "0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom))",
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid var(--border, #e8e4de)",
      }}>
        <button
          onClick={isComplete ? handleAddToCart : scrollToMissing}
          style={{
            width: "100%", maxWidth: 480, display: "block", margin: "0 auto",
            padding: "0.9rem 1.5rem", fontSize: "1rem", fontWeight: 700,
            borderRadius: "999px", border: "none", cursor: "pointer",
            background: isComplete ? "var(--cherry, #c05)" : "#bbb",
            color: "#fff",
            transition: "background 0.2s",
          }}
        >
          {added ? "Added to cart ✓" : isComplete ? "Add to Cart" : getMissingLabel()}
        </button>
      </div>

      <V2Footer />
    </>
  );
}
