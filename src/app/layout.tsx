import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Dip & Sprinkle",
  description:
    "Handmade cake pops, cakesicles & little bakes — crafted in small batches for birthdays, weddings, and every celebration in between.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
