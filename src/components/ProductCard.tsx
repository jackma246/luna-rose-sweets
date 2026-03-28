import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  const startingPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((v) => v.price))
      : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="product-card group block rounded-2xl overflow-hidden glass-card"
    >
      <div className="aspect-square overflow-hidden relative">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="product-image object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-light to-accent/20 flex items-center justify-center text-4xl">
            🍰
          </div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-heading/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.enquireOnly && (
          <span className="absolute top-3 right-3 bg-accent/90 text-nav-text text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
            Custom
          </span>
        )}
      </div>
      <div className="p-5 text-center">
        <h3 className="font-serif font-bold text-heading text-lg leading-tight">
          {product.name}
        </h3>
        {startingPrice !== null ? (
          <p className="text-foreground/60 mt-2 text-sm font-medium">
            {product.variants.length > 1 ? "From " : ""}
            <span className="text-heading text-base">${startingPrice.toFixed(2)}</span>
          </p>
        ) : product.enquireOnly ? (
          <p className="text-accent font-medium mt-2 text-sm">Enquire for pricing</p>
        ) : null}
      </div>
    </Link>
  );
}
