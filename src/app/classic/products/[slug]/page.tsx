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
  const [designNote, setDesignNote] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [inspirationImages, setInspirationImages] = useState<Array<{ name: string; type: string; size: number; dataUrl: string }>>([]);

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-heading mb-4">
          Product Not Found
        </h1>
        <Link href="/classic/products" className="text-accent hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const p = product;
  const variant = p.variants[selectedVariant];
  const displayImage = variant?.image || p.image || null;
  const addonPriceAdd = p.addons?.reduce((sum, addon) => sum + (selectedAddons[addon.label] ? (addon.priceAdd ?? 0) : 0), 0) ?? 0;
  const effectivePrice = variant ? variant.price + addonPriceAdd : 0;

  function buildCartNote(): string | undefined {
    const parts: string[] = [];
    const addonLabels = p.addons
      ?.filter((addon) => selectedAddons[addon.label])
      .map((addon) => `${addon.label} (${addon.price})`)
      .join(", ");
    if (addonLabels) parts.push(`Add-ons: ${addonLabels}`);
    if (inspirationImages.length > 0) {
      parts.push(`Inspiration photos: ${inspirationImages.map((img) => img.name).join(", ")}`);
    }
    const note = designNote.trim();
    if (note) parts.push(`Cake design request: ${note}`);
    return parts.length > 0 ? parts.join(" | ") : undefined;
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

  function handleAddToCart() {
    if (!variant || p.enquireOnly) return;
    addItem(
      {
        productSlug: p.slug,
        variantLabel: variant.label,
        name: p.name,
        price: effectivePrice,
        image: p.image,
        note: buildCartNote(),
        inspirationImages: inspirationImages.length > 0 ? inspirationImages : undefined,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href="/classic/products"
        className="inline-flex items-center gap-2 text-foreground/60 hover:text-heading text-sm transition-colors duration-200 group"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1">
          &larr;
        </span>
        Back to Products
      </Link>

      {/* Category — on its own line below back link */}
      <span className="block text-accent font-medium text-xs uppercase tracking-[0.15em] mt-3 mb-6">
        {p.category}
      </span>

      {/* Two-column layout: photo left, info right (stacks on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left — Photo (sticky so it stays visible while scrolling to variants) */}
        <div className="self-start pb-2">
        <div className="aspect-[16/9] md:aspect-square rounded-2xl overflow-hidden relative shadow-lg">
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
        </div>

        {/* Right — Info */}
        <div>
          {/* Name */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-heading mb-4 leading-tight">
            {p.name}
          </h1>

          {/* Description — kept short */}
          <p className="text-foreground/75 leading-relaxed mb-4">
            {p.description.length > 160
              ? p.description.slice(0, 160).replace(/\s+\S*$/, "") + "..."
              : p.description}
          </p>

          {/* More details toggle */}
          {p.details && (
            <div className="mb-6">
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

          {/* Pricing Add-ons */}
          {p.addons && p.addons.length > 0 && (
            <div className="mb-6 space-y-4">
              <div className="p-4 rounded-xl bg-accent/8 border border-accent/20">
                <p className="text-xs font-semibold text-heading uppercase tracking-wider mb-3">Customization Add-ons</p>
                <ul className="space-y-1.5">
                  {p.addons.map((addon, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-foreground/70">{addon.label}</span>
                      <span className="font-medium text-heading">{addon.price}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-foreground/50 mt-3 italic">
                  Please consult with us for custom design details and final pricing.
                </p>
              </div>

            </div>
          )}

          {/* Options / Variants */}
          {p.enquireOnly ? (
            <Link
              href="/classic/contact"
              className="btn-primary inline-block bg-mint text-white font-semibold px-10 py-3.5 rounded-full"
            >
              Enquire Now
            </Link>
          ) : p.variants.length > 0 ? (
            <div className="space-y-5">
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
                  ${effectivePrice.toFixed(2)}
                </p>
              )}

              {p.addons?.some((addon) => typeof addon.priceAdd === "number") && (
                <div>
                  <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-2">
                    Add Options
                  </label>
                  <div className="space-y-2">
                    {p.addons.filter((addon) => typeof addon.priceAdd === "number").map((addon) => (
                      <button
                        key={addon.label}
                        type="button"
                        onClick={() => setSelectedAddons((prev) => ({ ...prev, [addon.label]: !prev[addon.label] }))}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                          selectedAddons[addon.label]
                            ? "border-accent bg-accent/10 shadow-sm"
                            : "border-accent/15 hover:border-accent/40 bg-white/50"
                        }`}
                      >
                        <span className="font-medium text-heading">{addon.label}</span>
                        <span className="float-right font-bold text-heading">{addon.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {p.slug.includes("cake") && (
                <div>
                  <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-2">
                    Inspiration Photos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => void handleInspirationFiles(e.target.files)}
                    className="w-full border border-accent/30 rounded-xl px-4 py-3 bg-white text-foreground text-sm"
                  />
                  <p className="text-xs text-foreground/45 mt-1">Optional: upload reference photos for the design. You can still order without photos.</p>
                  {inspirationImages.length > 0 && (
                    <p className="text-xs text-foreground/60 mt-2">Selected: {inspirationImages.map((img) => img.name).join(", ")}</p>
                  )}
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-heading uppercase tracking-wider mb-2">
                      Describe Your Cake
                    </label>
                    <textarea
                      value={designNote}
                      onChange={(e) => setDesignNote(e.target.value)}
                      placeholder="Tell us your theme, colors, writing, characters, or any design details you want..."
                      rows={4}
                      className="w-full border border-accent/30 rounded-xl px-4 py-3 bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                    />
                    <p className="text-xs text-foreground/45 mt-1">Optional, but helpful for custom designs.</p>
                  </div>
                </div>
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
                {added ? "Added to Cart \u2713" : `Add to Cart · $${(effectivePrice * quantity).toFixed(2)}`}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
