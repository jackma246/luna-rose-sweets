import Link from "next/link";
import Image from "next/image";
import V2Header from "../components/V2Header";
import V2Footer from "../components/V2Footer";

export default function V2About() {
  return (
    <>
      <V2Header current="about" />

      <section className="editorial">
        <div className="kicker">Our Story</div>
        <h1>
          Before crossing the ocean, <em>I spent years</em> doing what I loved most.
        </h1>
        <p className="lede">
          Before crossing the ocean to call America home, I spent years in South Korea doing what I loved most — decorating cakes.
        </p>

        <div className="hero-img">
          <Image
            src="/images/brand-spread.jpg"
            alt="A spread of Dip & Sprinkle treats"
            width={1200}
            height={680}
          />
        </div>

        <p>
          What started as a quiet passion grew into a craft I dedicated myself to fully. In Korea, I worked as a professional cake decorator, pouring care and creativity into every design, every layer, every detail. It was there that I learned that baking is never just about the dessert — it&rsquo;s about the moment it&rsquo;s made for, and the people it&rsquo;s made with.
        </p>
        <p>
          When I moved to the United States, I brought that love with me. New country, same heart.
        </p>

        <h2>
          Crafted with <em>care and technique.</em>
        </h2>
        <p>
          Over the years, I&rsquo;ve developed a wide range of creams — each with its own unique texture and flavor — so that every cake feels just as special on the inside as it looks on the outside. I also specialize in delicate custom color matching, carefully crafting each shade to bring your vision to life exactly as you imagined it.
        </p>
        <p>
          And because we&rsquo;re in California, I know the heat is real. That&rsquo;s why I&rsquo;ve perfected creams that hold up beautifully in warm weather, so your cake stays picture-perfect even at outdoor events — no melting, no stress, just a beautiful celebration.
        </p>

        <h2>
          Made with <em>devotion.</em>
        </h2>
        <p>
          Today, every creation from our kitchen carries that same devotion — handcrafted with the techniques I refined in Korea and the warmth I&rsquo;ve always put into this work. Whether it&rsquo;s a birthday, a wedding, or just a reason to celebrate, I&rsquo;m so glad you&rsquo;re here to share it with me.
        </p>

        <div className="cta-row">
          <Link href="/products" className="btn btn-primary">
            Shop the collection →
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Say hello
          </Link>
        </div>
      </section>

      <V2Footer />
    </>
  );
}
