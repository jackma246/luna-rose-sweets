import type { Metadata } from "next";

export const SITE_NAME = "Dip & Sprinkle";
const DEFAULT_SITE_URL = "https://dipsprinkle.com";

/**
 * Absolute site origin from an env value. Accepts a bare host ("dipsprinkle.com",
 * which is how production has it configured) by assuming https, and falls back to
 * the default rather than crashing the build on anything unparseable.
 */
export function normalizeSiteUrl(raw: string | undefined | null): string {
  const value = (raw ?? "").trim();
  if (!value) return DEFAULT_SITE_URL;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_URL || process.env.APP_URL);
export const DEFAULT_OG_IMAGE = "/images/brand-spread.jpg";
export const DEFAULT_DESCRIPTION =
  "Handmade cake pops, cakesicles & little bakes - crafted in small batches in San Jose for birthdays, weddings, and every celebration in between.";

/** Trim long product copy to a search-snippet-sized description. */
export function snippet(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

/**
 * Per-page metadata with canonical URL and Open Graph / Twitter cards. Child openGraph objects replace
 * the parent's wholesale in Next, so every page gets a complete set here.
 */
export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [{ url: image, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
