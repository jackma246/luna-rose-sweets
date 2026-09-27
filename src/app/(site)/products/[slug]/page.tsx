import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/data/products";
import { pageMetadata, snippet, SITE_NAME } from "@/lib/seo";
import ProductDetailClient from "./ProductDetailClient";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: `Not found · ${SITE_NAME}` };
  return pageMetadata({
    title: `${product.name} · ${SITE_NAME}`,
    description: snippet(product.description),
    path: `/products/${product.slug}`,
    image: product.image ?? product.variants[0]?.image,
    noIndex: product.hidden,
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  // Unknown slugs get a real 404 (status and page), not a "not found" message on a 200.
  if (!getProductBySlug(slug)) notFound();
  return <ProductDetailClient slug={slug} />;
}
