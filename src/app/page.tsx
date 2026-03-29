import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import AnimatedHero from "@/components/AnimatedHero";
import ScrollReveal from "@/components/ScrollReveal";
import InstaGrid from "@/components/InstaGrid";

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
      {/* Hero — split layout with animated entrance */}
      <AnimatedHero />

      {/* Best sellers */}
      <section className="section-curve max-w-6xl mx-auto px-6 pt-14 pb-20">
        <ScrollReveal>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-heading text-center mb-3 tracking-tight">
            Best Sellers
          </h2>
          <p className="text-foreground/50 text-center mb-12 text-sm tracking-wide uppercase">
            Our most-loved treats
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product, i) => (
            <ScrollReveal key={product.slug} delay={i * 80}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={400}>
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-block border-2 border-heading text-heading font-semibold px-10 py-3 rounded-sm hover:bg-heading hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              View All Products
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* About section with floating decoration */}
      <section className="relative overflow-hidden">
        {/* Decorative floating dots */}
        <div className="absolute top-8 left-[10%] w-3 h-3 rounded-full bg-pink-light/60 float-decor" />
        <div className="absolute top-20 right-[15%] w-2 h-2 rounded-full bg-accent/40 float-decor-delayed" />
        <div className="absolute bottom-12 left-[20%] w-2.5 h-2.5 rounded-full bg-pink-light/50 float-decor" />

        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-heading mb-2 tracking-tight">
              Made with Love
            </h2>
            <div className="w-12 h-0.5 bg-accent/50 mx-auto mb-6" />
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className="text-foreground/70 leading-relaxed text-lg">
              Every dessert is handcrafted with premium Belgian chocolate and the
              finest ingredients. Perfect for birthdays, weddings, baby showers,
              and every celebration in between.
            </p>
            <Link
              href="/about"
              className="inline-block mt-8 text-heading font-medium underline underline-offset-4 decoration-accent/40 hover:decoration-heading transition-colors"
            >
              Learn more about us
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Instagram row */}
      <section className="bg-card-bg/50">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-2xl font-bold text-heading mb-2">
              @lunarosesweets
            </h2>
            <p className="text-foreground/50 text-sm mb-8">
              Follow along for sweet inspiration
            </p>
          </ScrollReveal>
          <InstaGrid />
        </div>
      </section>
    </div>
  );
}
