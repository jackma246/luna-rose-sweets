"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AnimatedHero() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("hero-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = "Handcrafted Desserts for Every Celebration".split(" ");

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div
        ref={sectionRef}
        className="hero-section grid grid-cols-1 md:grid-cols-2 gap-0 rounded-lg overflow-hidden"
      >
        {/* Image with subtle zoom */}
        <div className="relative aspect-square md:aspect-auto md:min-h-[480px] overflow-hidden">
          <Image
            src="/images/cake-pops-hero.png"
            alt="Handcrafted cake pops and chocolate-covered strawberries"
            fill
            className="object-cover hero-image"
            priority
          />
        </div>

        {/* Text with staggered word animation */}
        <div className="flex flex-col items-center justify-center text-center px-8 py-14 md:py-20 bg-background">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-heading mb-4 tracking-tight leading-snug">
            {words.map((word, i) => (
              <span
                key={i}
                className="hero-word inline-block mr-[0.3em]"
                style={{ transitionDelay: `${200 + i * 80}ms` }}
              >
                {word}
              </span>
            ))}
          </h1>
          <p
            className="hero-paragraph text-foreground/70 text-base md:text-lg max-w-sm mb-8 leading-relaxed"
          >
            Premium cake pops, chocolate-covered strawberries, and bespoke
            treats made with love.
          </p>
          <Link
            href="/products"
            className="hero-cta border border-heading text-heading font-semibold px-10 py-3.5 rounded-sm hover:bg-heading hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
