"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { useCart } from "@/context/CartContext";
import V2Header from "../components/V2Header";
import V2Footer from "../components/V2Footer";

type Status = "idle" | "form" | "sending" | "sent" | "error";

export default function V2CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [neededDate, setNeededDate] = useState("");
  const [message, setMessage] = useState("");
  const [minDate] = useState(() => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

  async function submitRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/request-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalPrice,
          customer: {
            name,
            email,
            phone: phone || undefined,
            neededDate: neededDate || undefined,
            message: message || undefined,
          },
        }),
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  function closeModal() {
    if (status === "sending") return;
    if (status === "sent") clearCart();
    setStatus("idle");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.7rem 0.85rem",
    fontSize: "0.9rem",
    borderRadius: "0.55rem",
    border: "1.5px solid var(--border, #e8e4de)",
    background: "#fff",
    color: "inherit",
    marginBottom: "0.9rem",
    fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 600,
    marginBottom: "0.3rem",
    letterSpacing: "0.02em",
  };

  if (items.length === 0 && status !== "sent") {
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
                  : "Quoted on confirmation"}
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
              onClick={() => setStatus("form")}
              className="btn btn-primary"
            >
              Request Order →
            </button>
            <p style={{ marginTop: 10, fontSize: 12, opacity: 0.55, textAlign: "center", lineHeight: 1.5 }}>
              We&rsquo;ll email you back within 24 hours to confirm availability, pickup/delivery, and payment.
            </p>
            <Link href="/products" className="keep-shopping">
              ← Keep shopping
            </Link>
          </aside>
        </div>
      </section>

      {(status === "form" || status === "sending" || status === "sent" || status === "error") && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 600,
            background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{
            background: "#fff",
            borderRadius: "1.25rem 1.25rem 0 0",
            padding: "1.75rem 1.5rem calc(1.75rem + env(safe-area-inset-bottom))",
            width: "100%", maxWidth: 520, boxSizing: "border-box",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#ddd", margin: "0 auto 1.5rem" }} />

            {status === "sent" ? (
              <div style={{ textAlign: "center", padding: "0.5rem 0 1rem" }}>
                <h3 style={{ margin: "0 0 0.6rem", fontSize: "1.25rem" }}>Thanks — we&rsquo;ve got it.</h3>
                <p style={{ margin: "0 0 1.5rem", fontSize: "0.9rem", opacity: 0.7, lineHeight: 1.55 }}>
                  We&rsquo;ll email you back within 24 hours to confirm availability and payment.
                </p>
                <Link href="/products" className="btn btn-primary" onClick={closeModal}>
                  Keep browsing →
                </Link>
              </div>
            ) : (
              <form onSubmit={submitRequest}>
                <h3 style={{ margin: "0 0 0.35rem", fontSize: "1.1rem" }}>Request your order</h3>
                <p style={{ margin: "0 0 1.1rem", fontSize: "0.83rem", opacity: 0.6, lineHeight: 1.55 }}>
                  Drop your details — we&rsquo;ll email you back to confirm and take payment manually.
                </p>

                <label style={labelStyle}>Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={status === "sending"}
                  placeholder="Sam Rivera"
                  style={inputStyle}
                />

                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "sending"}
                  placeholder="sam@hello.com"
                  style={inputStyle}
                />

                <label style={labelStyle}>Phone <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={status === "sending"}
                  placeholder="(408) 555-0100"
                  style={inputStyle}
                />

                <label style={labelStyle}>When do you need it?</label>
                <input
                  type="date"
                  value={neededDate}
                  onChange={(e) => setNeededDate(e.target.value)}
                  min={minDate}
                  required
                  disabled={status === "sending"}
                  style={inputStyle}
                />
                <p style={{ fontSize: "0.72rem", opacity: 0.55, margin: "-0.6rem 0 0.9rem" }}>
                  Minimum 3 days notice. Larger orders may need more — we&rsquo;ll confirm.
                </p>

                <label style={labelStyle}>Notes <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={status === "sending"}
                  placeholder="Pickup date, theme, anything else…"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
                />

                {status === "error" && (
                  <p style={{ color: "var(--cherry, #c05)", fontSize: "0.82rem", margin: "0 0 0.75rem" }}>
                    Something went wrong — please try again or email supportdipsprinkle@gmail.com directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
                >
                  {status === "sending" ? "Sending…" : "Send request →"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={status === "sending"}
                  style={{ width: "100%", background: "none", border: "none", fontSize: "0.82rem", opacity: 0.45, cursor: "pointer", marginTop: "0.65rem" }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <V2Footer />
    </>
  );
}
