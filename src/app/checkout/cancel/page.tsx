import Link from "next/link";

export default function CheckoutCancel() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-6">😔</div>
      <h1 className="font-serif text-3xl font-bold text-heading mb-4">
        Checkout Cancelled
      </h1>
      <p className="text-foreground/70 mb-8 leading-relaxed">
        Your order was not completed. Your cart items are still saved if you&apos;d like
        to try again.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/cart"
          className="inline-block bg-accent text-nav-text font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Back to Cart
        </Link>
        <Link
          href="/products"
          className="inline-block border-2 border-accent text-accent font-medium px-8 py-3 rounded-full hover:bg-accent/10 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
