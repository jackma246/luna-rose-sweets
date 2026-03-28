import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-section-banner text-nav-text text-center py-8 rounded-lg mb-10">
        <h1 className="font-serif text-4xl font-bold">About Luna Rose Sweets</h1>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-card-bg rounded-lg p-8 mb-8">
          <h2 className="font-serif text-2xl font-bold text-heading mb-4">
            Our Story
          </h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            Luna Rose Sweets was born from a passion for creating beautiful,
            delicious desserts that bring joy to every occasion. What started as a
            hobby of making treats for friends and family quickly blossomed into a
            full-fledged dessert business.
          </p>
          <p className="text-foreground/80 leading-relaxed">
            Every product is handmade with love using only the finest ingredients,
            including premium Belgian chocolate. We take pride in our attention to
            detail and our ability to customise each order to match your vision
            perfectly.
          </p>
        </div>

        <div className="bg-card-bg rounded-lg p-8 mb-8">
          <h2 className="font-serif text-2xl font-bold text-heading mb-4">
            What We Offer
          </h2>
          <ul className="space-y-3 text-foreground/80">
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Cake Pops</strong> — Our signature
                product, available in Vanilla and Chocolate Fudge flavours
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Chocolate Strawberries</strong> —
                Personalised with colours, toppings, and edible wafer toppers
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Cakesicles</strong> — Freshly baked
                cake coated in Belgian chocolate
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Custom Treat Boxes</strong> — Curated
                collections for any event or celebration
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Brownies & Cookies</strong> — Gooey,
                loaded, and available in countless flavours
              </span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="inline-block bg-accent text-nav-text font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            View Our Products
          </Link>
        </div>
      </div>
    </div>
  );
}
