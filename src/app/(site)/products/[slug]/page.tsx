"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getProductBySlug } from "@/data/products";
import { useCart } from "@/context/CartContext";
import V2Header from "../../components/V2Header";
import V2Footer from "../../components/V2Footer";

export default function V2ProductDetail() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const product = getProductBySlug(slug);

  const { addItem } = useCart();
  const [variantIdx, setVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedFlavour, setSelectedFlavour] = useState<string>("");
  const [treatCounts, setTreatCounts] = useState<Record<string, number>>({});
  const [selectedDesignTier, setSelectedDesignTier] = useState<string>("");

  const images = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.image) list.push(product.image);
    for (const v of product.variants) {
      if (v.image && !list.includes(v.image)) list.push(v.image);
    }
    return list;
  }, [product]);

  const [mainImgIdx, setMainImgIdx] = useState(0);

  if (!product) {
    return (
      <>
        <V2Header />
        <section className="editorial">
          <h1>Not <em>found</em></h1>
          <p style={{ textAlign: "center" }}>We couldn&rsquo;t find that treat.</p>
          <div className="cta-row">
            <Link href="/products" className="btn btn-primary">Back to shop →</Link>
          </div>
        </section>
        <V2Footer />
      </>
    );
  }

  const variant = product.variants[variantIdx];
  const mainImage = images[mainImgIdx] ?? product.image;
  const maxTreats = product.maxTreats ?? 3;

  const totalTreatsSelected = Object.values(treatCounts).reduce((s, c) => s + c, 0);
  const designPriceAdd = product.designTiers?.find((t) => t.name === selectedDesignTier)?.priceAdd ?? 0;
  const effectivePrice = variant ? variant.price + designPriceAdd : 0;

  function getTreatCount(name: string) {
    return treatCounts[name] ?? 0;
  }

  function addTreat(treatName: string) {
    if (!product!.treats) return;
    const treatDef = product!.treats.find((t) => t.name === treatName)!;
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
    if (!product!.treats) return true;
    const treatDef = product!.treats.find((t) => t.name === treatName)!;
    const currentCount = getTreatCount(treatName);
    if (currentCount >= (treatDef.maxCount ?? 1)) return true;
    if (totalTreatsSelected >= maxTreats) return true;
    if (treatDef.exclusiveWith?.some((ex) => (treatCounts[ex] ?? 0) > 0)) return true;
    return false;
  }

  function buildTreatsLabel(): string {
    if (!product!.treats) return "";
    return product!.treats
      .filter((t) => (treatCounts[t.name] ?? 0) > 0)
      .map((t) => {
        const count = treatCounts[t.name] ?? 0;
        return count > 1 ? `${t.name} ×${count}` : t.name;
      })
      .join(", ");
  }

  function buildCartNote(): string {
    const parts: string[] = [];
    const treatsLabel = buildTreatsLabel();
    if (treatsLabel) parts.push(`Treats: ${treatsLabel}`);
    if (selectedDesignTier) {
      const tier = product!.designTiers!.find((t) => t.name === selectedDesignTier)!;
      parts.push(`Design: ${tier.name}${tier.priceAdd > 0 ? ` (${tier.priceLabel})` : ""}`);
    }
    return parts.join(" | ");
  }

  function handleAddToCart() {
    if (!variant || product?.enquireOnly) return;
    if (product!.flavours && product!.flavours.length > 0 && !selectedFlavour) {
      alert("Please select a flavour before adding to cart.");
      return;
    }
    if (product!.treats && totalTreatsSelected < maxTreats) {
      alert(`Please select ${maxTreats} treat dozen(s) before adding to cart.`);
      return;
    }
    if (product!.designTiers && !selectedDesignTier) {
      alert("Please select a design tier before adding to cart.");
      return;
    }
    const note = buildCartNote();
    addItem(
      {
        productSlug: product!.slug,
        variantLabel: variant.label,
        name: product!.name,
        price: effectivePrice,
        image: variant.image ?? product!.image,
        flavour: selectedFlavour || undefined,
        note: note || undefined,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const priceLabel = product.enquireOnly
    ? "Enquire for pricing"
    : variant
    ? `$${effectivePrice.toFixed(2)}`
    : "—";

  return (
    <>
      <V2Header current="shop" />

      <section className="pd">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <Link href="/products">Shop</Link>
          <span className="sep">/</span>
          <span>{product.name}</span>
        </nav>

        <div className="pd-grid">
          <div className="pd-gallery">
            <div className="pd-thumbs">
              {images.map((src, i) => (
                <button
                  key={src}
                  className={`pd-thumb${i === mainImgIdx ? " active" : ""}`}
                  onClick={() => setMainImgIdx(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <Image src={src} alt="" width={120} height={120} />
                </button>
              ))}
            </div>
            <div className="pd-main">
              {product.enquireOnly && <div className="tag">Made to order</div>}
              {mainImage && (
                <Image src={mainImage} alt={product.name} width={800} height={1000} priority />
              )}
            </div>
          </div>

          <div className="pd-details">
            <div className="cat">{product.category}</div>
            <h1>{product.name}</h1>
            <div className="price">{priceLabel}</div>
            <p className="lede">{product.description}</p>

            {product.enquireOnly ? (
              <div>
                <Link href="/contact" className="btn btn-primary">
                  Enquire about this →
                </Link>
                <div className="pd-note">
                  ~ we&rsquo;ll reply with a sketch and quote within 48 hours
                </div>
              </div>
            ) : (
              product.variants.length > 0 && (
                <>
                  {/* ── Fixed flavour note ── */}
                  {product.fixedFlavour && (
                    <div style={{ marginBottom: "1.5rem", padding: "0.85rem 1rem", background: "var(--surface, #faf9f7)", borderRadius: "0.5rem", border: "1px solid var(--border, #e8e4de)" }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.55, marginBottom: "0.3rem" }}>Flavour</p>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>Classic Vanilla</p>
                      <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", opacity: 0.65, lineHeight: 1.5 }}>{product.fixedFlavour}</p>
                      <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", opacity: 0.5, fontStyle: "italic" }}>Flavour is fixed for this set and cannot be changed.</p>
                    </div>
                  )}

                  {/* ── Flavour selector ── */}
                  {product.flavours && product.flavours.length > 0 && (
                    <div className="options" style={{ marginBottom: "1.5rem" }}>
                      <h4>Choose your flavour</h4>
                      <div className="option-grid" style={{ gap: "0.5rem" }}>
                        {product.flavours.map((f) => (
                          <button
                            key={f.name}
                            className={`option${selectedFlavour === f.name ? " active" : ""}`}
                            onClick={() => setSelectedFlavour(f.name)}
                            style={{ textAlign: "left", flexDirection: "column", alignItems: "flex-start", gap: "0.2rem" }}
                          >
                            <span style={{ fontWeight: 600 }}>{f.name}</span>
                            <small style={{ fontWeight: 400, opacity: 0.7, whiteSpace: "normal", lineHeight: 1.4, fontSize: "0.78rem" }}>{f.description}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Treat selector ── */}
                  {product.treats && product.treats.length > 0 && (
                    <div className="options" style={{ marginBottom: "1.5rem" }}>
                      <h4>
                        Choose {maxTreats} dozen
                        <span style={{ fontWeight: 400, fontSize: "0.82rem", opacity: 0.6, marginLeft: "0.5rem" }}>
                          ({totalTreatsSelected}/{maxTreats} selected)
                        </span>
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {product.treats.map((t) => {
                          const count = getTreatCount(t.name);
                          const canAdd = !isTreatAddDisabled(t.name);
                          const maxCount = t.maxCount ?? 1;
                          return (
                            <div
                              key={t.name}
                              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                            >
                              <button
                                className={`option${count > 0 ? " active" : ""}`}
                                onClick={() => count > 0 ? removeTreat(t.name) : addTreat(t.name)}
                                style={{
                                  flex: 1,
                                  textAlign: "left",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  gap: "0.15rem",
                                  opacity: (!canAdd && count === 0) ? 0.35 : 1,
                                  cursor: (!canAdd && count === 0) ? "not-allowed" : "pointer",
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
                                {t.exclusiveWith && count === 0 && (
                                  <small style={{ fontWeight: 400, opacity: 0.55, fontSize: "0.74rem" }}>
                                    Cannot combine with {t.exclusiveWith.join(" or ")}
                                  </small>
                                )}
                                {maxCount > 1 && (
                                  <small style={{ fontWeight: 400, opacity: 0.55, fontSize: "0.74rem" }}>
                                    Up to {maxCount} dozen
                                  </small>
                                )}
                              </button>
                              {/* Extra "+1 dozen" button for treats with maxCount > 1 */}
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

                  {/* ── Design tier selector ── */}
                  {product.designTiers && product.designTiers.length > 0 && (
                    <div className="options" style={{ marginBottom: "1.5rem" }}>
                      <h4>Choose your design</h4>
                      <div className="option-grid" style={{ gap: "0.5rem" }}>
                        {product.designTiers.map((tier) => (
                          <button
                            key={tier.name}
                            className={`option${selectedDesignTier === tier.name ? " active" : ""}`}
                            onClick={() => setSelectedDesignTier(tier.name)}
                            style={{ textAlign: "left", flexDirection: "column", alignItems: "flex-start", gap: "0.2rem" }}
                          >
                            <span style={{ fontWeight: 600, display: "flex", justifyContent: "space-between", width: "100%" }}>
                              {tier.name}
                              <span>{tier.priceLabel}</span>
                            </span>
                            <small style={{ fontWeight: 400, opacity: 0.65, whiteSpace: "normal", lineHeight: 1.4, fontSize: "0.78rem" }}>{tier.description}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Order summary preview ── */}
                  {product.treats && (selectedFlavour || totalTreatsSelected > 0 || selectedDesignTier) && (
                    <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "var(--surface, #faf9f7)", borderRadius: "0.5rem", border: "1px solid var(--border, #e8e4de)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                      <p style={{ margin: 0, fontWeight: 600, marginBottom: "0.25rem", opacity: 0.55, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your selection</p>
                      {selectedFlavour && <p style={{ margin: 0 }}><strong>Flavour:</strong> {selectedFlavour}</p>}
                      {totalTreatsSelected > 0 && <p style={{ margin: 0 }}><strong>Treats:</strong> {buildTreatsLabel()}</p>}
                      {selectedDesignTier && (
                        <p style={{ margin: 0 }}>
                          <strong>Design:</strong> {selectedDesignTier}
                          {designPriceAdd > 0 && <span style={{ opacity: 0.65 }}> (+${designPriceAdd})</span>}
                        </p>
                      )}
                    </div>
                  )}

                  {/* ── Size / variant selector ── */}
                  {product.variants.length > 1 && (
                    <div className="options">
                      <h4>Size / Option</h4>
                      <div className="option-grid">
                        {product.variants.map((v, i) => (
                          <button
                            key={v.label}
                            className={`option${i === variantIdx ? " active" : ""}`}
                            onClick={() => {
                              setVariantIdx(i);
                              const imgIdx = images.findIndex((s) => s === v.image);
                              if (imgIdx >= 0) setMainImgIdx(imgIdx);
                            }}
                          >
                            {v.label}
                            <small>${v.price.toFixed(2)}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

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
                  <div className="pd-note">
                    ~ ships in a cushioned box, wrapped with a hand-tied ribbon
                  </div>
                </>
              )
            )}

            {product.details && (
              <div className="accordion">
                <details open>
                  <summary>The details</summary>
                  <p>{product.details}</p>
                </details>
                <details>
                  <summary>Shipping &amp; delivery</summary>
                  <p>
                    Orders placed by Thursday noon ship Friday with weekend
                    delivery. Local pickup available from our studio Mon–Sat.
                    Free delivery on orders over $85.
                  </p>
                </details>
                <details>
                  <summary>How to store &amp; serve</summary>
                  <p>
                    Best enjoyed within 5 days. Store at room temperature in
                    the original box. We don&rsquo;t freeze our treats — and
                    neither should you.
                  </p>
                </details>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile-only sticky add-to-cart bar */}
      {!product.enquireOnly && variant && (
        <div className="pd-sticky-cta" aria-hidden="false">
          <div className="pd-sticky-cta-inner">
            <div className="pd-sticky-summary">
              <span className="pd-sticky-name">{product.name}</span>
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
