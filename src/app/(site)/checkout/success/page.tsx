import Link from "next/link";

export default function CheckoutSuccess() {
  return (
    <section className="cart-empty">
      <h1>
        Thank <em>you!</em>
      </h1>
      <p>
        Your order came through. We&rsquo;re starting on your sweet treats
        today — you&rsquo;ll get a confirmation email shortly.
      </p>
      <Link href="/products" className="btn btn-primary">
        Keep browsing →
      </Link>
    </section>
  );
}
