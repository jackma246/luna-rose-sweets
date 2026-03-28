import Link from "next/link";
import Image from "next/image";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const featured = products.filter((p) =>
  [
    "cake-pops",
    "strawberries",
    "cakesicles",
    "large-treat-box",
    "chocolate-box",
    "brownie-box",
  ].includes(p.slug)
);

export default function Home() {
  return (
    <div>
      {/* Hero — full-width image with simple centered text */}
      <section className="relative">
        <div className="relative w-full h-[70vh] min-h-[500px]">
          <Image
            src="/images/strawberry-tower.jpg"
            alt="Luna Rose Sweets"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-heading/30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              Luna Rose Sweets
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-lg mb-8">
              Handcrafted cake pops, chocolate-covered strawberries, and bespoke
              desserts for every celebration.
            </p>
            <Link
              href="/products"
              className="bg-white text-heading font-semibold px-10 py-3.5 rounded-sm hover:bg-nav-text transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-serif text-3xl font-bold text-heading text-center mb-12">
          Best Sellers
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block border-2 border-heading text-heading font-semibold px-10 py-3 rounded-sm hover:bg-heading hover:text-white transition-colors"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* Simple about section */}
      <section className="border-t border-accent/20">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="font-serif text-3xl font-bold text-heading mb-5">
            Made with Love
          </h2>
          <p className="text-foreground/70 leading-relaxed text-lg">
            Every dessert is handcrafted with premium Belgian chocolate and the
            finest ingredients. Perfect for birthdays, weddings, baby showers,
            and every celebration in between.
          </p>
          <Link
            href="/about"
            className="inline-block mt-8 text-heading font-medium underline underline-offset-4 hover:text-accent transition-colors"
          >
            Learn more about us
          </Link>
        </div>
      </section>

      {/* Instagram row */}
      <section className="border-t border-accent/20">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-2xl font-bold text-heading mb-8">
            @lunarosesweets
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              "/images/platter.jpg",
              "/images/treat-box.jpg",
              "/images/birthday-basket.jpg",
              "/images/strawberry-tower.jpg",
              "/images/strawberry-heart.jpg",
            ].map((src, i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden relative group"
              >
                <Image
                  src={src}
                  alt="Instagram post"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
