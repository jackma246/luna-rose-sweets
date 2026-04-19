"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-heading mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-foreground/60 mb-8">
          Looks like you haven&apos;t added any sweet treats yet!
        </p>
        <Link
          href="/products"
          className="inline-block bg-accent text-nav-text font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  async function handleCheckout() {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
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
          onClick={handleCheckout}
          className="w-full bg-accent text-nav-text font-bold py-3.5 rounded-full text-lg hover:opacity-90 transition-opacity"
        >
          Proceed to Checkout
        </button>
        <Link
          href="/products"
          className="block text-center text-accent hover:underline mt-4 text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
