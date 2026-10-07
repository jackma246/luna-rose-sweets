import type { Metadata } from "next";
import { DEFAULT_PARTY_SET_SIZE_ID, isPartySetSizeId } from "@/data/partySet";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import PartySetBuilder from "./PartySetBuilder";

export const metadata: Metadata = pageMetadata({
  title: `Build a Party Dessert Set · ${SITE_NAME}`,
  description:
    "Build a curated dessert table package with custom color matching included. Choose Classic Treats, limited Premium Bakes, and optional premium customization.",
  path: "/products/party-set",
  image: "/images/treat-boxes/party-set-large.jpeg",
});

export default async function PartySetPage({
  searchParams,
}: {
  searchParams: Promise<{ size?: string | string[] }>;
}) {
  const { size } = await searchParams;
  const initialSizeId = isPartySetSizeId(size) ? size : DEFAULT_PARTY_SET_SIZE_ID;
  // key: following a ?size= link while already on this page starts the builder at that size.
  return <PartySetBuilder key={initialSizeId} initialSizeId={initialSizeId} />;
}
