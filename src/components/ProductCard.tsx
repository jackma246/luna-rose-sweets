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
      className="group block"
    >
      <div className="aspect-square overflow-hidden relative mb-4">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-pink-light flex items-center justify-center text-4xl">
            🍰
          </div>
        )}
      </div>
      <h3 className="font-serif text-heading text-center text-base font-bold">
        {product.name}
      </h3>
      {startingPrice !== null ? (
        <p className="text-foreground/60 text-center mt-1 text-sm">
          {product.variants.length > 1 ? "From " : ""}${startingPrice.toFixed(2)}
        </p>
      ) : product.enquireOnly ? (
        <p className="text-accent text-center mt-1 text-sm">Enquire for pricing</p>
      ) : null}
    </Link>
  );
}
