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
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-section-banner via-section-banner to-accent/80" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <p className="text-nav-text/70 font-medium text-sm uppercase tracking-[0.2em] mb-3">
                Handcrafted with love
              </p>
              <h1 className="font-serif text-5xl md:text-6xl font-bold text-nav-text mb-5 leading-tight">
                Luna Rose
                <br />
                <span className="text-white/90">Sweets</span>
              </h1>
              <p className="text-nav-text/85 text-lg max-w-md mx-auto md:mx-0 mb-8 leading-relaxed">
                Beautiful cake pops, chocolate-covered strawberries, and bespoke
                desserts for every celebration.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Link
                  href="/products"
                  className="btn-primary bg-white text-heading font-semibold px-8 py-3.5 rounded-full"
                >
                  Shop Now
                </Link>
                <Link
                  href="/contact"
                  className="border-2 border-white/60 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/10 transition-colors duration-300"
                >
                  Custom Orders
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-square relative">
                  <Image
                    src="/images/strawberry-tower.jpg"
                    alt="Strawberry tower"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3] relative">
                  <Image
                    src="/images/treat-box.jpg"
                    alt="Treat box"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-[4/3] relative">
                  <Image
                    src="/images/birthday-basket.jpg"
                    alt="Birthday basket"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg aspect-square relative">
                  <Image
                    src="/images/platter.jpg"
                    alt="Chocolate platter"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-2">
            Most Popular
          </p>
          <h2 className="font-serif text-4xl font-bold text-heading">
            Our Best Sellers
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="btn-primary inline-block bg-accent text-nav-text font-semibold px-10 py-3.5 rounded-full"
          >
            View All Products
          </Link>
        </div>
      </section>

      {/* About snippet */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-card-bg" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-2">
            Our Story
          </p>
          <h2 className="font-serif text-4xl font-bold text-heading mb-6">
            Made with Love
          </h2>
          <p className="text-foreground/70 leading-relaxed max-w-2xl mx-auto text-lg">
            At Luna Rose Sweets, every dessert is handcrafted with the finest
            ingredients and decorated with care. From cake pops to
            chocolate-covered strawberries, we create beautiful treats perfect
            for birthdays, weddings, baby showers, and every celebration in
            between.
          </p>
          <Link
            href="/about"
            className="inline-block mt-8 text-heading font-semibold hover:text-accent transition-colors duration-300 group"
          >
            Learn more about us{" "}
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* Instagram banner */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-accent font-medium text-sm uppercase tracking-[0.15em] mb-2">
            Follow Us
          </p>
          <h2 className="font-serif text-3xl font-bold text-heading mb-3">
            @lunarosesweets
          </h2>
          <p className="text-foreground/60 mb-8">
            See our latest creations on Instagram
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              "/images/platter.jpg",
              "/images/treat-box.jpg",
              "/images/birthday-basket.jpg",
              "/images/strawberry-tower.jpg",
              "/images/strawberry-heart.jpg",
            ].map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden relative group"
              >
                <Image
                  src={src}
                  alt="Instagram post"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-heading/0 group-hover:bg-heading/20 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
