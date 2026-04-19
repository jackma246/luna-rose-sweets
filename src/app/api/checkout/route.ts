import { NextRequest, NextResponse } from "next/server";

// NOTE: Install stripe with `npm install stripe` and add your secret key to .env.local
// STRIPE_SECRET_KEY=sk_test_...
// NEXT_PUBLIC_URL=http://localhost:3000

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env.local",
          url: null,
        },
        { status: 500 }
      );
    }

    // Dynamic import so the app works even without stripe installed
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map(
        (item: { name: string; variantLabel: string; price: number; quantity: number; note?: string }) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${item.name} — ${item.variantLabel}`,
              description: item.note ? `Design Note: ${item.note}` : undefined,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })
      ),
      mode: "payment",
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
