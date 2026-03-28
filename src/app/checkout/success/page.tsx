import Link from "next/link";

export default function CheckoutSuccess() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="font-serif text-3xl font-bold text-heading mb-4">
        Thank You for Your Order!
      </h1>
      <p className="text-foreground/70 mb-8 leading-relaxed">
        Your payment was successful. We&apos;ll start preparing your sweet treats right
        away. You&apos;ll receive a confirmation email shortly.
      </p>
      <Link
        href="/products"
        className="inline-block bg-accent text-nav-text font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
