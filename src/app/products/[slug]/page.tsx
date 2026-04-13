"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getProductBySlug } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage() {
  const params = useParams();
  const product = getProductBySlug(params.slug as string);
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-heading mb-4">
          Product Not Found
        </h1>
        <Link href="/products" className="text-accent hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const p = product;
  const variant = p.variants[selectedVariant];
  const displayImage = variant?.image || p.image || null;

  function handleAddToCart() {
    if (!variant || p.enquireOnly) return;
    addItem(
      {
        productSlug: p.slug,
        variantLabel: variant.label,
        name: p.name,
        price: variant.price,
        image: p.image,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-foreground/60 hover:text-heading text-sm mb-8 transition-colors duration-200 group"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1">
          &larr;
        </span>
        Back to Products
      </Link>

      {/* Category */}
      <span className="inline-block text-accent font-medium text-xs uppercase tracking-[0.15em] mb-2">
        {p.category}
      </span>

      {/* Name */}
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-heading mb-6 leading-tight">
        {p.name}
      </h1>

      {/* Photo — changes when a different variant is selected */}
      <div className="aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden relative shadow-lg mb-8">
        {displayImage ? (
          <Image
            key={displayImage}
            src={displayImage}
            alt={p.name}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-light to-accent/20 flex items-center justify-center text-6xl">
            🍰
          </div>
        )}
      </div>

      {/* Description — kept short */}
      <p className="text-foreground/75 leading-relaxed text-lg mb-4 max-w-3xl">
        {p.description.length > 160
          ? p.description.slice(0, 160).replace(/\s+\S*$/, "") + "..."
          : p.description}
      </p>

      {/* More details toggle */}
      {p.details && (
        <div className="mb-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium text-heading hover:text-accent transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${showDetails ? "rotate-90" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            More details
          </button>
          {showDetails && (
            <div className="mt-3 pl-6 border-l-2 border-accent/20">
              <p className="text-foreground/55 text-sm leading-relaxed">
                {p.details}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Options / Variants */}
      {p.enquireOnly ? (
        <Link
          href="/contact"
          className="btn-primary inline-block bg-mint text-white font-semibold px-10 py-3.5 rounded-full"
        >
          Enquire Now
        </Link>
      ) : p.variants.length > 0 ? (
        <div className="max-w-lg space-y-5">
          {/* Variant selector */}
          {p.variants.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-2">
                Select Option
              </label>
              <div className="space-y-2">
                {p.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedVariant === i
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-accent/15 hover:border-accent/40 bg-white/50"
                    }`}
                  >
                    <span className="font-medium text-heading">{v.label}</span>
                    <span className="float-right font-bold text-heading">
                      ${v.price.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price for single variant */}
          {p.variants.length === 1 && (
            <p className="text-3xl font-bold text-heading">
              ${variant.price.toFixed(2)}
            </p>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <label className="text-xs font-semibold text-heading uppercase tracking-wider">
              Qty
            </label>
            <div className="flex items-center rounded-xl overflow-hidden border-2 border-accent/20">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2.5 hover:bg-accent/10 transition-colors font-medium"
              >
                &minus;
              </button>
              <span className="px-5 py-2.5 min-w-[3.5rem] text-center font-semibold text-heading bg-white/50">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2.5 hover:bg-accent/10 transition-colors font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className={`btn-primary w-full font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 ${
              added
                ? "bg-green-600 text-white"
                : "bg-mint text-white"
            }`}
          >
            {added ? "Added to Cart \u2713" : "Add to Cart"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
