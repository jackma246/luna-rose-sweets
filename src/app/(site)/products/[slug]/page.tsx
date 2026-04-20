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
  const [selectedTreats, setSelectedTreats] = useState<string[]>([]);
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

  const designPriceAdd =
    product.designTiers?.find((t) => t.name === selectedDesignTier)?.priceAdd ?? 0;
  const effectivePrice = variant ? variant.price + designPriceAdd : 0;

  function toggleTreat(treatName: string) {
    setSelectedTreats((prev) => {
      if (prev.includes(treatName)) return prev.filter((t) => t !== treatName);
      if (prev.length >= maxTreats) return prev;
      const treatDef = product!.treats!.find((t) => t.name === treatName);
      if (treatDef?.exclusiveWith?.some((ex) => prev.includes(ex))) return prev;
      return [...prev, treatName];
    });
  }

  function isTreatDisabled(treatName: string): boolean {
    if (selectedTreats.includes(treatName)) return false;
    if (selectedTreats.length >= maxTreats) return true;
    const treatDef = product!.treats!.find((t) => t.name === treatName);
    return !!treatDef?.exclusiveWith?.some((ex) => selectedTreats.includes(ex));
  }

  function buildCartNote(): string {
    const parts: string[] = [];
    if (selectedTreats.length > 0) parts.push(`Treats: ${selectedTreats.join(", ")}`);
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
    if (product!.treats && selectedTreats.length < maxTreats) {
      alert(`Please select ${maxTreats} treats before adding to cart.`);
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
                        Choose {maxTreats} treats
                        <span style={{ fontWeight: 400, fontSize: "0.82rem", opacity: 0.6, marginLeft: "0.5rem" }}>
                          ({selectedTreats.length}/{maxTreats} selected)
                        </span>
                      </h4>
                      <div className="option-grid" style={{ gap: "0.5rem" }}>
                        {product.treats.map((t) => {
                          const disabled = isTreatDisabled(t.name);
                          const selected = selectedTreats.includes(t.name);
                          return (
                            <button
                              key={t.name}
                              className={`option${selected ? " active" : ""}`}
                              onClick={() => !disabled && toggleTreat(t.name)}
                              style={{
                                opacity: disabled ? 0.35 : 1,
                                cursor: disabled ? "not-allowed" : "pointer",
                                textAlign: "left",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: "0.15rem",
                              }}
                              aria-disabled={disabled}
                            >
                              <span style={{ fontWeight: 600 }}>{t.name}</span>
                              {t.exclusiveWith && (
                                <small style={{ fontWeight: 400, opacity: 0.6, fontSize: "0.75rem" }}>
                                  Cannot be combined with {t.exclusiveWith.join(" or ")}
                                </small>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {selectedTreats.length > 0 && (
                        <p style={{ marginTop: "0.5rem", fontSize: "0.82rem", opacity: 0.7 }}>
                          Selected: {selectedTreats.join(", ")}
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
                              <span style={{ color: tier.priceAdd === 0 ? "var(--cherry, #c05)" : undefined }}>
                                {tier.priceLabel}
                              </span>
                            </span>
                            <small style={{ fontWeight: 400, opacity: 0.65, whiteSpace: "normal", lineHeight: 1.4, fontSize: "0.78rem" }}>{tier.description}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Order summary preview ── */}
                  {product.treats && (selectedFlavour || selectedTreats.length > 0 || selectedDesignTier) && (
                    <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "var(--surface, #faf9f7)", borderRadius: "0.5rem", border: "1px solid var(--border, #e8e4de)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                      <p style={{ margin: 0, fontWeight: 600, marginBottom: "0.25rem", opacity: 0.6, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your selection</p>
                      {selectedFlavour && <p style={{ margin: 0 }}><strong>Flavour:</strong> {selectedFlavour}</p>}
                      {selectedTreats.length > 0 && <p style={{ margin: 0 }}><strong>Treats:</strong> {selectedTreats.join(", ")}</p>}
                      {selectedDesignTier && (
                        <p style={{ margin: 0 }}>
                          <strong>Design:</strong> {selectedDesignTier}
                          {designPriceAdd > 0 && <span style={{ opacity: 0.7 }}> (+${designPriceAdd})</span>}
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
