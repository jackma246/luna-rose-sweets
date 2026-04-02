import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-section-banner text-nav-text text-center py-8 rounded-lg mb-10">
        <h1 className="font-serif text-4xl font-bold">About Dip & Sprinkle</h1>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="bg-card-bg rounded-lg p-8 mb-8">
          <h2 className="font-serif text-2xl font-bold text-heading mb-4">
            Our Story
          </h2>
          <p className="text-foreground/80 leading-relaxed mb-4">
            Dip & Sprinkle was born from a passion for creating beautiful,
            delicious sweet treats that bring joy to every occasion. What started as a
            hobby of dipping and decorating treats for friends and family quickly
            blossomed into a full-fledged dessert business.
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
              <span className="text-mint font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Madeleines</strong> — Delicate French
                cakes dipped in premium chocolate
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-mint font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Cake Pops</strong> — Fun, colourful,
                and perfect for any celebration
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-mint font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Rice Krispies & Pretzels</strong> —
                Dipped, drizzled, and decorated with sprinkles
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-mint font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Butter Cookies & Marshmallows</strong> —
                Sweet bites coated in chocolate goodness
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-mint font-bold mt-0.5">&#x2022;</span>
              <span>
                <strong className="text-heading">Oreo Pops & More</strong> — Custom
                treat boxes curated for any event
              </span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/products"
            className="inline-block bg-mint text-white font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            View Our Products
          </Link>
        </div>
      </div>
    </div>
  );
}
