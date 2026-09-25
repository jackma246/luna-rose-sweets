import Link from "next/link";
import V2Header from "./V2Header";
import V2Footer from "./V2Footer";

/** Branded 404 body, shared by the (site) not-found boundary and the app-wide fallback. */
export default function NotFoundContent() {
  return (
    <>
      <V2Header />
      <section className="editorial">
        <div className="kicker">404</div>
        <h1>
          Not <em>found</em>
        </h1>
        <p className="lede">We couldn&rsquo;t find that page. It may have moved, or the treat is no longer on the menu.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <Link href="/products" className="btn btn-primary">
            Browse the shop →
          </Link>
          <Link href="/" className="btn btn-ghost">
            Back home
          </Link>
        </div>
      </section>
      <V2Footer />
    </>
  );
}
