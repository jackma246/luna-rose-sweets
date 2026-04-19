"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import V2Header from "../components/V2Header";
import V2Footer from "../components/V2Footer";

export default function V2CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Checkout isn't available right now.");
        setSubmitting(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
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
              onClick={handleCheckout}
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? "Redirecting…" : "Checkout →"}
            </button>
            {error && (
              <p
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: "var(--cherry)",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}
            <Link href="/products" className="keep-shopping">
              ← Keep shopping
            </Link>
          </aside>
        </div>
      </section>

      <V2Footer />
    </>
  );
}
