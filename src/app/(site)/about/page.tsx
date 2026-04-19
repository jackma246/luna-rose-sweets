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
          A small kitchen, <em>one steady hand,</em> and a lot of sprinkles.
        </h1>
        <p className="lede">
          Dip &amp; Sprinkle began as a weekend habit — dipping little cakes
          for friends, showing up at birthdays with a tray and a ribbon —
          and quietly grew into something bigger.
        </p>

        <div className="hero-img">
          <Image
            src="/images/brand-spread.jpg"
            alt="A spread of Dip & Sprinkle treats"
            width={1200}
            height={680}
          />
        </div>

        <h2>
          Made <em>by hand,</em> the day they ship.
        </h2>
        <p>
          Every treat starts in our studio kitchen with premium Belgian
          chocolate, grass-fed butter, and real Madagascar vanilla. We dip each
          piece by hand and finish every box with the kind of care we&rsquo;d
          want for our own table.
        </p>
        <p>
          Nothing is frozen. Nothing is factory-made. Just small batches,
          baked the week of your event.
        </p>

        <h2>
          What we <em>make.</em>
        </h2>
        <p>
          Cake pops &amp; cakesicles, chocolate-dipped madeleines, tray-baked
          brownies, cupcakes, cookie boxes, custom cakes, and seasonal
          treats. If you have a party, a wedding, a shower, or just a
          Tuesday that needs sprinkles — we can dress it up.
        </p>

        <h2>
          The <em>finest</em> ingredients.
        </h2>
        <p>
          We source premium Belgian chocolate, European butter, real vanilla,
          and fresh seasonal fruit. No shortcuts, no artificial substitutes.
          Just honest, homemade goodness in every bite.
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
