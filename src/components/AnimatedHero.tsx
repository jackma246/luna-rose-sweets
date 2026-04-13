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

  const words = "Chocolate Dipped Sweet Treats & Baked Goods".split(" ");

  return (
    <section className="relative overflow-hidden">
      {/* Confetti sprinkles scattered around hero */}
      <div className="absolute top-6 left-[8%] text-accent text-xl float-decor select-none">&#x2665;</div>
      <div className="absolute top-16 right-[12%] text-mint text-sm float-decor-delayed select-none">&#x2665;</div>
      <div className="absolute bottom-20 left-[5%] text-accent/40 text-lg float-decor select-none">&#x2726;</div>
      <div className="absolute top-32 right-[6%] text-mint/50 text-2xl float-decor select-none">&#x2022;</div>
      <div className="absolute bottom-16 right-[18%] text-accent/50 text-xs float-decor-delayed select-none">&#x2726;</div>
      <div className="absolute top-10 left-[35%] w-2 h-2 rounded-full bg-mint/30 float-decor-delayed" />
      <div className="absolute bottom-24 left-[45%] w-1.5 h-1.5 rounded-full bg-accent/40 float-decor" />
      <div className="absolute top-24 right-[30%] w-2.5 h-2.5 rounded-full bg-cream float-decor" />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div
          ref={sectionRef}
          className="hero-section grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-lg"
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
          <div className="relative flex flex-col items-center justify-center text-center px-8 py-14 md:py-20 bg-pink-light/30">
            {/* Mini confetti inside text panel */}
            <div className="absolute top-4 right-6 text-mint/40 text-xs">&#x2665;</div>
            <div className="absolute bottom-6 left-8 text-accent/30 text-sm">&#x2726;</div>
            <div className="absolute top-12 left-6 w-1.5 h-1.5 rounded-full bg-mint/30" />

            <h1 className="font-serif text-3xl md:text-4xl font-bold text-chocolate mb-4 tracking-tight leading-snug">
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
            <p className="hero-paragraph text-chocolate/60 text-base md:text-lg max-w-sm mb-8 leading-relaxed">
              Madeleines, Cake Pops, Rice Krispies, Pretzels, Butter Cookies,
              Marshmallows, Oreo Pops & More! Homemade from scratch.
            </p>
            <Link
              href="/products"
              className="hero-cta bg-mint text-white font-bold px-10 py-3.5 rounded-full hover:bg-chocolate hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 text-lg"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
