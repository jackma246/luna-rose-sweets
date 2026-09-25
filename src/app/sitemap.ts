import type { MetadataRoute } from "next";
import { visibleProducts } from "@/data/products";
import { ingredientPages } from "@/data/ingredients";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path}`;
  // The shop lists some products under two categories; each product page appears once.
  const productSlugs = Array.from(new Set(visibleProducts.map((p) => p.slug))).filter((slug) => slug !== "party-set");
  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/products"), changeFrequency: "weekly", priority: 0.9 },
    { url: url("/products/party-set"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/party"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/contact"), changeFrequency: "yearly", priority: 0.7 },
    ...productSlugs.map((slug) => ({ url: url(`/products/${slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...ingredientPages.map((p) => ({ url: url(`/ingredients/${p.slug}`), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
