import type { Metadata } from "next";
import { isDateKey } from "@/lib/businessDate";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import ContactForm from "./ContactForm";

export const metadata: Metadata = pageMetadata({
  title: `Contact & Custom Orders · ${SITE_NAME}`,
  description:
    "Planning a wedding, shower, corporate event or birthday? Tell us your date, guest count and theme and we'll reply with a sketch and a quote.",
  path: "/contact",
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const { date } = await searchParams;
  // The date picker re-checks lead time and blocked days once availability loads.
  return <ContactForm initialDate={isDateKey(date) ? date : ""} />;
}
