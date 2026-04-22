"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import V2Header from "../components/V2Header";
import V2Footer from "../components/V2Footer";

export default function V2CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  function buildOrderText(): string {
    const lines: string[] = ["Hi! I'd like to place an order 🎀\n"];
    for (const item of items) {
      lines.push(`• ${item.name} (${item.variantLabel}) ×${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`);
      if (item.flavour) lines.push(`  Flavour: ${item.flavour}`);
      if (item.note) lines.push(`  Details: ${item.note}`);
    }
    lines.push(`\nTotal: $${totalPrice.toFixed(2)}`);
    return lines.join("\n");
  }

  async function handleRequestOrder() {
    const text = buildOrderText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    setShowModal(true);
  }

  function openInstagram() {
    window.open("https://ig.me/m/dipsprinkle", "_blank");
  }

  if (items.length === 0) {
    return (
      <>
        <V2Header />
        <section className="cart-empty">
          <h1>
            A <em>sweet</em> emptiness.
          </h1>
          <p>Your cart&rsquo;s looking a little lonely. Let&rsquo;s fix that.</p>
          <Link href="/products" className="btn btn-primary">
            Browse the collection →
          </Link>
        </section>
        <V2Footer />
      </>
    );
  }

  const shippingThreshold = 85;
  const qualifiesForFreeShipping = totalPrice >= shippingThreshold;
  const toFreeShipping = Math.max(0, shippingThreshold - totalPrice);

  return (
    <>
      <V2Header />

      <section className="cart-wrap">
        <h1>
          Your <em>basket</em>
        </h1>

        <div className="cart-grid">
          <div className="cart-items">
            {items.map((item) => (
              <article
                key={`${item.productSlug}-${item.variantLabel}`}
                className="cart-item"
              >
                <div className="thumb-img">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={240}
                      height={240}
                    />
                  )}
                </div>
                <div className="info">
                  <h4>{item.name}</h4>
                  <div className="opt">{item.variantLabel}</div>
                  {item.flavour && (
                    <div className="opt" style={{ opacity: 0.75 }}>Flavour: {item.flavour}</div>
                  )}
                  <div className="row">
                    <div className="qty">
                      <button
                        aria-label="Decrease"
                        onClick={() =>
                          updateQuantity(
                            item.productSlug,
                            item.variantLabel,
                            item.quantity - 1
                          )
                        }
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label="Increase"
                        onClick={() =>
                          updateQuantity(
                            item.productSlug,
                            item.variantLabel,
                            item.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="remove"
                      onClick={() =>
                        removeItem(item.productSlug, item.variantLabel)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="line-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </article>
            ))}
          </div>

          <aside className="cart-summary">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {qualifiesForFreeShipping
                  ? "Free"
                  : "Calculated at checkout"}
              </span>
            </div>
            {!qualifiesForFreeShipping && (
              <div className="summary-row" style={{ color: "var(--cherry)", fontSize: 13 }}>
                <span>
                  Add ${toFreeShipping.toFixed(2)} for free shipping
                </span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleRequestOrder}
              className="btn btn-primary"
            >
              Request Order →
            </button>
            <p style={{ marginTop: 10, fontSize: 12, opacity: 0.55, textAlign: "center", lineHeight: 1.5 }}>
              Once we review your request, we&rsquo;ll follow up within 1 hour with availability and next steps for payment.
            </p>
            <Link href="/products" className="keep-shopping">
              ← Keep shopping
            </Link>
          </aside>
        </div>
      </section>

      {/* Order Request Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 600,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: "#fff",
            borderRadius: "1.25rem 1.25rem 0 0",
            padding: "1.75rem 1.5rem calc(1.75rem + env(safe-area-inset-bottom))",
            width: "100%", maxWidth: 520, boxSizing: "border-box",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#ddd", margin: "0 auto 1.5rem" }} />
            <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.1rem" }}>
              {copied ? "✅ Order details copied!" : "Ready to request?"}
            </h3>
            <p style={{ margin: "0 0 1rem", fontSize: "0.83rem", opacity: 0.6, lineHeight: 1.55 }}>
              {copied
                ? "Paste the order details into the Instagram DM and we'll get back to you within 1 hour."
                : "Open Instagram and send us a DM with your order details."}
            </p>
            <div style={{
              background: "var(--surface, #faf9f7)", borderRadius: "0.65rem",
              border: "1px solid var(--border, #e8e4de)",
              padding: "0.85rem 1rem", fontSize: "0.8rem", lineHeight: 1.7,
              whiteSpace: "pre-wrap", marginBottom: "1.25rem",
              fontFamily: "monospace", maxHeight: 180, overflowY: "auto",
            }}>
              {buildOrderText()}
            </div>
            <div style={{ display: "flex", gap: "0.65rem", marginBottom: "0.65rem" }}>
              <button
                onClick={async () => {
                  try { await navigator.clipboard.writeText(buildOrderText()); setCopied(true); } catch {}
                }}
                style={{
                  flex: 1, padding: "0.85rem", fontWeight: 600, fontSize: "0.9rem",
                  borderRadius: "999px", border: "1.5px solid var(--border, #e8e4de)",
                  background: "#fff", cursor: "pointer", color: "inherit",
                }}
              >
                {copied ? "Copied ✓" : "Copy details"}
              </button>
              <button
                onClick={openInstagram}
                style={{
                  flex: 2, padding: "0.85rem", fontWeight: 700, fontSize: "0.9rem",
                  borderRadius: "999px", border: "none",
                  background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
                  color: "#fff", cursor: "pointer",
                }}
              >
                Open Instagram DM →
              </button>
            </div>
            <button
              onClick={() => setShowModal(false)}
              style={{ width: "100%", background: "none", border: "none", fontSize: "0.82rem", opacity: 0.45, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <V2Footer />
    </>
  );
}
