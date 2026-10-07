"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import {
  BOXED_WRAPPING_PRICE_PER_DOZEN,
  CAKE_OPTIONS,
  DESIGN_TIERS,
  PARTY_FAVOR_OPTIONS,
  PARTY_SET_CAKE_ADDONS,
  PARTY_SET_SIZES as SIZES,
  PARTY_TRAY_RENTAL_SETUP_PRICE,
  TREAT_OPTIONS,
  WRAPPING_PRICE_PER_DOZEN,
  getDesignPriceAdd,
  getHandTiedBowsPrice,
  getPartySetDozens,
  getPremiumTreatCount,
  getPortableHolderBoxCount,
  getPortableHolderPrice,
  getWrappingPrice,
  pricePartySet,
  type PartySetSelection,
  type WrappingOption,
} from "@/data/partySet";
import { PHOTO_ACCEPT, readPickedPhotos } from "@/lib/photoInput";
import V2Header from "../../components/V2Header";
import V2Footer from "../../components/V2Footer";

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

/**
 * Party set builder. The server page reads ?size= and passes it in, so the server render and the first
 * client render agree (reading window.location during render caused a hydration mismatch).
 */
export default function PartySetBuilder({ initialSizeId }: { initialSizeId: string }) {
  const [sizeId, setSizeId] = useState(initialSizeId);
  const [treats, setTreats] = useState<string[]>([]);
  const [designTier, setDesignTier] = useState("custom");
  const [handTiedBows, setHandTiedBows] = useState(false);
  const [portableHolderBoxes, setPortableHolderBoxes] = useState(false);
  const [wrappingOption, setWrappingOption] = useState<WrappingOption>("");
  const [cakeOptionId, setCakeOptionId] = useState("none");
  const [selectedCakeAddons, setSelectedCakeAddons] = useState<Record<string, boolean>>({});
  const [partyFavorQuantities, setPartyFavorQuantities] = useState<Record<string, number>>({});
  const [partyTrayRentalSetup, setPartyTrayRentalSetup] = useState(false);
  const [themeNote, setThemeNote] = useState("");
  const [inspirationImages, setInspirationImages] = useState<Array<{ name: string; type: string; size: number; dataUrl: string }>>([]);
  const inspirationInputRef = useRef<HTMLInputElement | null>(null);
  const [photoMessage, setPhotoMessage] = useState<string | null>(null);
  const [quantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  const size = SIZES.find((s) => s.id === sizeId)!;
  const requiredTreats = size.treatCount;
  const availableTreatOptions = TREAT_OPTIONS.filter((t) => !t.sizeIds || t.sizeIds.includes(sizeId));
  const classicTreatOptions = availableTreatOptions.filter((t) => t.category === "classic");
  const premiumTreatOptions = availableTreatOptions.filter((t) => t.category === "premium");
  const premiumTreatCount = getPremiumTreatCount(treats);
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
  const selectedPartyFavorItems = PARTY_FAVOR_OPTIONS
    .map((option) => ({ ...option, quantity: partyFavorQuantities[option.label] ?? 0 }))
    .filter((option) => option.quantity > 0);
  const partyFavorPrice = selectedPartyFavorItems.reduce((sum, option) => sum + option.priceAdd * option.quantity, 0);
  const partyTrayRentalSetupPrice = partyTrayRentalSetup ? PARTY_TRAY_RENTAL_SETUP_PRICE : 0;
  const effectivePrice = size.price + designPriceAdd + handTiedBowsPrice + portableHolderPrice + wrappingPrice + cakePrice + partyFavorPrice + partyTrayRentalSetupPrice;

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
      let keptPremiumTreats = 0;
      const treatsWithinPremiumLimit = validTreats.filter((id) => {
        const isPremium = TREAT_OPTIONS.find((t) => t.id === id)?.category === "premium";
        if (!isPremium) return true;
        keptPremiumTreats += 1;
        return keptPremiumTreats <= nextSize.premiumTreatLimit;
      });
      const nextTreats = treatsWithinPremiumLimit.length > nextSize.treatCount ? treatsWithinPremiumLimit.slice(0, nextSize.treatCount) : treatsWithinPremiumLimit;
      if (getPortableHolderBoxCount(nextTreats) === 0) setPortableHolderBoxes(false);
      if (getPortableHolderBoxCount(nextTreats) === 0) setWrappingOption((current) => current === "boxed" ? "" : current);
      return nextTreats;
    });
  }

  const isComplete = treats.length >= requiredTreats;

  function scrollToMissing() {
    let id = "";
    if (treats.length < requiredTreats) id = "step-treats";

    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getMissingLabel(): string {
    if (treats.length < requiredTreats) {
      const need = requiredTreats - treats.length;
      return `Select ${need} more treat ${need === 1 ? "type" : "types"}`;
    }

    return "";
  }

  function toggleTreat(id: string) {
    setTreats((prev) => {
      const option = TREAT_OPTIONS.find((t) => t.id === id);
      if (!prev.includes(id) && option?.category === "premium" && getPremiumTreatCount(prev) >= size.premiumTreatLimit) return prev;
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
    const { photos, message } = await readPickedPhotos(fileList);
    setPhotoMessage(message);
    setInspirationImages(photos);
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
      parts.push(`Party favors: ${selectedPartyFavorItems.map((option) => `${option.label} ×${option.quantity} dozen (+$${option.priceAdd * option.quantity})`).join(", ")}`);
    }
    if (partyTrayRentalSetup) parts.push(`Add-ons: Party tray rental & set up assistant (+$${PARTY_TRAY_RENTAL_SETUP_PRICE})`);
    if (themeNote.trim()) parts.push(`Theme/Notes: ${themeNote.trim()}`);
    if (inspirationImages.length > 0) parts.push(`Inspiration photos: ${inspirationImages.map((img) => img.name).join(", ")}`);
    return parts.join(" | ");
  }

  function buildSelection(): PartySetSelection {
    return {
      kind: "party-set",
      sizeId,
      treats,
      designTier,
      handTiedBows,
      portableHolderBoxes: portableHolderBoxesActive,
      wrapping: wrappingOption,
      cakeOptionId: cakeOption.id,
      cakeAddons: cakeOption.id === "none" ? [] : selectedCakeAddonItems.map((addon) => addon.label),
      partyFavors: selectedPartyFavorItems.map((option) => ({ id: option.id, quantity: option.quantity })),
      trayRentalSetup: partyTrayRentalSetup,
    };
  }

  function handleAddToCart() {
    if (!isComplete) return;
    const selection = buildSelection();
    // Same pricing function the order API uses, so the cart shows exactly what the server will charge.
    const priced = pricePartySet(selection);
    addItem({
      productSlug: "party-set",
      variantLabel: size.label,
      name: `Party Set — ${size.label}`,
      price: priced.ok ? priced.unitPrice : effectivePrice,
      image: "/images/brand-spread-new.png",
      note: buildCartNote(),
      selection,
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
            Curated treats with custom color matching &amp; coordinated design included.
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
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Choose your Dessert Table size</span>
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
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Choose your treats — pick {requiredTreats}</span>
          </div>
          <p style={{ margin: "0 0 0.85rem", fontSize: "0.82rem", opacity: 0.6 }}>
            Select {requiredTreats} types for your {size.label}. We&apos;ll balance the quantity to create a full and beautiful set.
          </p>
          {[
            { title: "Classic Treats", subtitle: "Choose freely from these dessert-table favorites", options: classicTreatOptions },
            { title: "Premium Bakes", subtitle: `Choose up to ${size.premiumTreatLimit} for this package`, options: premiumTreatOptions },
          ].map((group, groupIndex) => (
            <div key={group.title} style={{ marginTop: groupIndex === 0 ? 0 : "1.2rem" }}>
              <div style={{ marginBottom: "0.55rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: groupIndex === 1 ? "var(--cherry, #c05)" : "inherit" }}>{group.title}</div>
                <div style={{ fontSize: "0.76rem", opacity: 0.55, marginTop: "0.15rem" }}>{group.subtitle}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {group.options.map((t) => {
                  const active = treats.includes(t.id);
                  const premiumLimitReached = t.category === "premium" && premiumTreatCount >= size.premiumTreatLimit;
                  const disabled = !active && (treats.length >= requiredTreats || premiumLimitReached);
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
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <Check active={active} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{t.label}</div>
                          {t.note && <div style={{ fontSize: "0.76rem", opacity: 0.55, marginTop: "0.15rem", lineHeight: 1.45 }}>{t.note}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <p style={{ margin: "0.65rem 0 0", fontSize: "0.76rem", opacity: 0.6, lineHeight: 1.5 }}>
            Premium Bakes are included within the package limit. Additional premium selections may require a custom quote.
          </p>
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

        {/* STEP 3: Customization */}
        <div id="step-design" style={sectionStyle}>
          <div style={stepHead}>
            <span style={stepLabel}>Step 3</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Choose colors &amp; customization</span>
          </div>
          <p style={{ margin: "0 0 0.85rem", fontSize: "0.82rem", opacity: 0.65, lineHeight: 1.55 }}>
            Custom color matching &amp; coordinated design included. Select Premium Customization only when your requested design requires significantly more detailed, labor-intensive work.
          </p>
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
                          Included
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
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Optional upgrades &amp; add-ons</span>
          </div>
          <div
            style={handTiedBows ? cardActive : card}
            onClick={() => setHandTiedBows((selected) => !selected)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Check active={handTiedBows} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>Hand Tied Bows</div>
                <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>+$10 per dozen for Cakesicles, Cake Pops, or Rice Krispies</div>
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
              { id: "wrapped" as const, label: "Individually Wrapped", desc: "+$3 per dozen", price: getPartySetDozens(size) * WRAPPING_PRICE_PER_DOZEN },
              { id: "boxed" as const, label: "Individually Wrapped in Boxes", desc: "+$5 per box for Cake Pops or Cakesicles only", price: getPortableHolderBoxCount(treats) * BOXED_WRAPPING_PRICE_PER_DOZEN, requiresEligibleTreat: true },
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

          <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border, #e8e4de)" }}>
            <div style={stepHead}>
              <span style={stepLabel}>Step 5</span>
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Cake centerpiece &amp; party favors <span style={{ fontWeight: 400, opacity: 0.45, fontSize: "0.82rem" }}>(optional)</span></span>
            </div>
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
                <div style={{ fontSize: "0.78rem", opacity: 0.6, lineHeight: 1.5 }}>Cake prices are starting prices. Final pricing may vary based on design complexity.</div>
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
                const quantity = partyFavorQuantities[option.label] ?? 0;
                return (
                  <div
                    key={option.id}
                    style={quantity > 0 ? cardActive : card}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <Check active={quantity > 0} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{option.label}</div>
                        <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>{option.desc}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexShrink: 0 }}>
                        <button
                          type="button"
                          aria-label={`Decrease ${option.label}`}
                          onClick={() => setPartyFavorQuantities((prev) => ({ ...prev, [option.label]: Math.max(0, (prev[option.label] ?? 0) - 1) }))}
                          style={{ width: 28, height: 28, borderRadius: 99, border: "1px solid var(--border, #e8e4de)", background: "#fff", cursor: "pointer" }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: "4.5rem", textAlign: "center", fontSize: "0.82rem", fontWeight: 700, color: quantity > 0 ? "var(--cherry, #c05)" : "inherit" }}>
                          {quantity} dozen
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase ${option.label}`}
                          onClick={() => setPartyFavorQuantities((prev) => ({ ...prev, [option.label]: (prev[option.label] ?? 0) + 1 }))}
                          style={{ width: 28, height: 28, borderRadius: 99, border: "1px solid var(--border, #e8e4de)", background: "#fff", cursor: "pointer" }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{ ...(partyTrayRentalSetup ? cardActive : card), marginTop: "1rem" }}
            onClick={() => setPartyTrayRentalSetup((selected) => !selected)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Check active={partyTrayRentalSetup} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>Party tray rental & set up assistant</div>
                <div style={{ fontSize: "0.78rem", opacity: 0.55 }}>Rental trays and setup assistance for your dessert table</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", flexShrink: 0, color: "var(--cherry, #c05)" }}>
                +${PARTY_TRAY_RENTAL_SETUP_PRICE}
              </div>
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div style={sectionStyle}>
          <div style={stepHead}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Colors, flavors &amp; inspiration <span style={{ fontWeight: 400, opacity: 0.45, fontSize: "0.82rem" }}>(optional)</span></span>
          </div>
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", opacity: 0.6 }}>
            Tell us your theme, colors, flavor preferences, or overall vibe
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
            accept={PHOTO_ACCEPT}
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
          {photoMessage && (
            <p role="alert" style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "var(--cherry, #c05)" }}>
              {photoMessage}
            </p>
          )}
        </div>

        {/* Important Notes */}
        <div style={{ ...sectionStyle, background: "var(--surface, #faf9f7)", borderRadius: "0.65rem", padding: "1rem 1.15rem", border: "1px solid var(--border, #e8e4de)" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, opacity: 0.5, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Good to know</div>
          <ul style={{ margin: 0, padding: "0 0 0 1rem", fontSize: "0.82rem", opacity: 0.65, lineHeight: 1.7 }}>
            <li>Custom color matching and coordinated design are included in every Party Set</li>
            <li>Premium Customization is only for labor-intensive details such as characters, sculpted elements, intricate piping, detailed florals, monograms, edible images, or custom shapes</li>
            <li>Final pricing for highly detailed custom work depends on the requested design</li>
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
              {selectedPartyFavorItems.length > 0 && <div><strong>Party favors:</strong> {selectedPartyFavorItems.map((option) => `${option.label} ×${option.quantity} dozen (+$${option.priceAdd * option.quantity})`).join(", ")}</div>}
              {partyTrayRentalSetup && <div><strong>Add-on:</strong> Party tray rental & set up assistant (+${PARTY_TRAY_RENTAL_SETUP_PRICE})</div>}
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
          {added ? "Added to cart ✓" : isComplete ? `Add to Cart · $${effectivePrice}` : getMissingLabel()}
        </button>
      </div>

      <V2Footer />
    </>
  );
}
