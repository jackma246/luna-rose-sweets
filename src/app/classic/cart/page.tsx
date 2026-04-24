"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, FormEvent } from "react";
import { useCart } from "@/context/CartContext";

type Status = "idle" | "form" | "sending" | "sent" | "error";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [neededDate, setNeededDate] = useState("");
  const [message, setMessage] = useState("");

  const minDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

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

  if (items.length === 0 && status !== "sent") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-heading mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-foreground/60 mb-8">
          Looks like you haven&apos;t added any sweet treats yet!
        </p>
        <Link
          href="/classic/products"
          className="inline-block bg-accent text-nav-text font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl font-bold text-heading mb-8">
        Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
      </h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={`${item.productSlug}-${item.variantLabel}`}
            className="flex items-center gap-4 bg-card-bg rounded-lg p-4"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-pink-light flex items-center justify-center text-2xl">🍰</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-heading">{item.name}</h3>
              <p className="text-sm text-foreground/60">{item.variantLabel}</p>
              <p className="font-medium text-heading mt-1">
                ${item.price.toFixed(2)}
              </p>
              {item.note && (
                <div className="mt-2 text-xs text-foreground/60 bg-accent/10 rounded-lg px-3 py-2 border border-accent/20">
                  <span className="font-semibold text-heading">Design Note: </span>
                  {item.note}
                </div>
              )}
            </div>

            <div className="flex items-center border border-accent/30 rounded-lg overflow-hidden">
              <button
                onClick={() =>
                  updateQuantity(item.productSlug, item.variantLabel, item.quantity - 1)
                }
                className="px-3 py-1.5 hover:bg-accent/10 transition-colors text-sm"
              >
                -
              </button>
              <span className="px-3 py-1.5 min-w-[2.5rem] text-center text-sm">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.productSlug, item.variantLabel, item.quantity + 1)
                }
                className="px-3 py-1.5 hover:bg-accent/10 transition-colors text-sm"
              >
                +
              </button>
            </div>

            <p className="font-bold text-heading min-w-[5rem] text-right">
              ${(item.price * item.quantity).toFixed(2)}
            </p>

            <button
              onClick={() => removeItem(item.productSlug, item.variantLabel)}
              className="text-foreground/40 hover:text-red-500 transition-colors p-1"
              aria-label="Remove item"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Total & Checkout */}
      <div className="mt-8 bg-card-bg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-medium text-heading">Total</span>
          <span className="text-2xl font-bold text-heading">
            ${totalPrice.toFixed(2)}
          </span>
        </div>
        <button
          onClick={() => setStatus("form")}
          className="w-full bg-accent text-nav-text font-bold py-3.5 rounded-full text-lg hover:opacity-90 transition-opacity"
        >
          Request Order
        </button>
        <p className="text-xs text-foreground/50 text-center mt-3 leading-relaxed">
          We&apos;ll email you back within 24 hours to confirm availability and payment.
        </p>
        <Link
          href="/classic/products"
          className="block text-center text-accent hover:underline mt-4 text-sm"
        >
          Continue Shopping
        </Link>
      </div>

      {(status === "form" || status === "sending" || status === "sent" || status === "error") && (
        <div
          className="fixed inset-0 z-[600] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-7 w-full max-w-lg">
            {status === "sent" ? (
              <div className="text-center">
                <div className="text-5xl mb-3">💌</div>
                <h3 className="font-serif text-2xl font-bold text-heading mb-2">Thanks — we&apos;ve got it.</h3>
                <p className="text-foreground/70 mb-6">
                  We&apos;ll email you back within 24 hours to confirm availability and payment.
                </p>
                <Link
                  href="/classic/products"
                  onClick={closeModal}
                  className="inline-block bg-accent text-nav-text font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
                >
                  Keep browsing
                </Link>
              </div>
            ) : (
              <form onSubmit={submitRequest} className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-heading">Request your order</h3>
                <p className="text-sm text-foreground/60">
                  Drop your details — we&apos;ll email you back to confirm and take payment manually.
                </p>

                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={status === "sending"}
                    className="w-full border border-accent/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === "sending"}
                    className="w-full border border-accent/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    Phone <span className="text-foreground/40 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={status === "sending"}
                    className="w-full border border-accent/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    When do you need it?
                  </label>
                  <input
                    type="date"
                    value={neededDate}
                    onChange={(e) => setNeededDate(e.target.value)}
                    min={minDate}
                    required
                    disabled={status === "sending"}
                    className="w-full border border-accent/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                  <p className="text-xs text-foreground/50 mt-1">Minimum 3 days notice.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading mb-1.5">
                    Notes <span className="text-foreground/40 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={status === "sending"}
                    rows={3}
                    placeholder="Pickup date, theme, anything else…"
                    className="w-full border border-accent/30 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent/50 resize-vertical"
                  />
                </div>

                {status === "error" && (
                  <p className="text-red-600 text-sm">
                    Something went wrong — please try again or email supportdipsprinkle@gmail.com directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-accent text-nav-text font-bold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Send request"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={status === "sending"}
                  className="w-full text-sm text-foreground/50 hover:underline"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
