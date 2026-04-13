import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import AnimatedHero from "@/components/AnimatedHero";
import ScrollReveal from "@/components/ScrollReveal";
import InstaGrid from "@/components/InstaGrid";

const featured = products.filter((p) =>
  [
    "medium-party-set",
    "cakesicles",
    "cakepops",
    "gift-half-dozen-box",
    "cakepop-bouquet",
    "party-custom-cake",
  ].includes(p.slug)
);

export default function Home() {
  return (
    <div>
      {/* Hero — split layout with animated entrance */}
      <AnimatedHero />

      {/* Best sellers — pink tinted background */}
      <section className="relative bg-accent/10 overflow-hidden">
        {/* Floating confetti */}
        <div className="absolute top-10 left-[7%] text-mint/30 text-lg float-decor select-none">&#x2665;</div>
        <div className="absolute top-20 right-[10%] w-3 h-3 rounded-full bg-accent/20 float-decor-delayed" />
        <div className="absolute bottom-16 left-[15%] text-mint/20 text-sm float-decor select-none">&#x2726;</div>
        <div className="absolute bottom-10 right-[8%] w-2 h-2 rounded-full bg-mint/20 float-decor" />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-chocolate text-center mb-2 tracking-tight">
              Best Sellers
            </h2>
            <p className="text-chocolate/40 text-center mb-4 text-sm tracking-wide uppercase">
              Our most-loved treats
            </p>
            <div className="flex justify-center gap-1 mb-10">
              <span className="text-accent text-xs">&#x2665;</span>
              <span className="text-mint text-xs">&#x2665;</span>
              <span className="text-accent text-xs">&#x2665;</span>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
                className="inline-block bg-mint text-white font-bold px-10 py-3 rounded-full hover:bg-chocolate transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                View All Products
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* About / Made with Love — mint tinted */}
      <section className="relative overflow-hidden bg-mint/10">
        {/* Floating confetti */}
        <div className="absolute top-8 left-[10%] w-3 h-3 rounded-full bg-accent/30 float-decor" />
        <div className="absolute top-20 right-[15%] w-2 h-2 rounded-full bg-mint/30 float-decor-delayed" />
        <div className="absolute bottom-12 left-[20%] w-2.5 h-2.5 rounded-full bg-accent/20 float-decor" />
        <div className="absolute top-16 left-[50%] text-accent/20 text-lg float-decor-delayed select-none">&#x2665;</div>
        <div className="absolute bottom-20 right-[25%] text-mint/20 text-sm float-decor select-none">&#x2726;</div>

        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-chocolate mb-2 tracking-tight">
              Homemade from Scratch
            </h2>
            <div className="flex justify-center gap-1.5 mb-6">
              <span className="text-accent">&#x2726;</span>
              <span className="text-mint">&#x2726;</span>
              <span className="text-accent">&#x2726;</span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <p className="text-chocolate/60 leading-relaxed text-lg mb-6">
              Every treat is handcrafted with premium chocolate and the
              finest ingredients. Perfect for birthdays, weddings, baby showers,
              and every celebration in between.
            </p>
            <h3 className="font-serif text-xl md:text-2xl font-bold text-chocolate mb-3 tracking-tight">
              The Finest Ingredients
            </h3>
            <p className="text-chocolate/60 leading-relaxed text-lg">
              We believe great treats start with great ingredients. From rich
              Belgian chocolate and real vanilla to fresh seasonal fruits and
              premium butter, every component is carefully sourced for quality
              and flavour. No shortcuts, no artificial substitutes — just honest,
              homemade goodness in every bite.
            </p>
            <Link
              href="/about"
              className="inline-block mt-8 bg-accent text-chocolate font-bold px-8 py-3 rounded-full hover:bg-chocolate hover:text-white transition-all duration-300"
            >
              Learn more about us
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Instagram row — cream background */}
      <section className="bg-cream/40">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-2xl font-bold text-chocolate mb-2">
              @dipsprinkle
            </h2>
            <p className="text-chocolate/40 text-sm mb-8">
              Follow along for sweet inspiration
            </p>
          </ScrollReveal>
          <InstaGrid />
        </div>
      </section>
    </div>
  );
}
