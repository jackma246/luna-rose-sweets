import type { Metadata } from "next";
import { DEFAULT_PARTY_SET_SIZE_ID, isPartySetSizeId } from "@/data/partySet";
import { pageMetadata, SITE_NAME } from "@/lib/seo";
import PartySetBuilder from "./PartySetBuilder";

export const metadata: Metadata = pageMetadata({
  title: `Build a Party Dessert Set · ${SITE_NAME}`,
  description:
    "Build a dessert table party set: choose a table size, your treat mix and design style - cake pops, cakesicles, pretzels and more, styled in your colours.",
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
