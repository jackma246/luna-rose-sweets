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
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-accent/15">
        <div className="aspect-square overflow-hidden relative">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-pink-light/40 flex items-center justify-center text-4xl">
              🍰
            </div>
          )}
        </div>
        <div className="p-4 text-center">
          <h3 className="font-serif text-chocolate text-base font-bold">
            {product.name}
          </h3>
          {product.subtitle && (
            <p className="text-chocolate/40 text-xs mt-0.5">{product.subtitle}</p>
          )}
          {startingPrice !== null ? (
            <p className="text-chocolate/50 mt-1 text-sm">
              {product.variants.length > 1 ? "From " : ""}${startingPrice.toFixed(2)}
            </p>
          ) : product.enquireOnly ? (
            <p className="text-mint font-medium mt-1 text-sm">Enquire for pricing</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
