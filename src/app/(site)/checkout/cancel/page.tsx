import Link from "next/link";

export default function CheckoutCancel() {
  return (
    <section className="cart-empty">
      <h1>
        Checkout <em>cancelled.</em>
      </h1>
      <p>No worries — your cart is still here whenever you&rsquo;re ready.</p>
      <div
        style={{
          display: "flex",
          gap: 14,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Link href="/cart" className="btn btn-primary">
          Back to cart
        </Link>
        <Link href="/products" className="btn btn-ghost">
          Keep browsing
        </Link>
      </div>
    </section>
  );
}
