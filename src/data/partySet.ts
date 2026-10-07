/**
 * Party Set builder options and pricing rules.
 *
 * Shared by the builder page (what the customer sees) and the order API (which recomputes the price
 * server-side), so the two can never disagree about what a set costs.
 */
import { getProductBySlug } from "@/data/products";

const partySetVariants = getProductBySlug("party-set")!.variants;
const setPrice = (keyword: string): number =>
  partySetVariants.find((v) => v.label.toLowerCase().startsWith(keyword))?.price ?? 0;
const cakeProduct = getProductBySlug("party-layer-cake")!;
const twoTierCakeProduct = getProductBySlug("party-two-tier-cake")!;

export const PARTY_SET_SIZES = [
  {
    id: "mini",
    label: "Mini Dessert Table",
    pcs: 48,
    treatCount: 4,
    premiumTreatLimit: 1,
    price: setPrice("mini"),
    badge: null as string | null,
    badgeColor: "",
    desc: "A thoughtfully curated dessert spread for intimate celebrations or a simple, elegant display.",
    subDesc: "Recommended for about 12-18 guests.",
    previewImg: "/images/brand-spread-new.png",
    previewLabel: "Mini Dessert Table",
  },
  {
    id: "classic",
    label: "Classic Dessert Table",
    pcs: 60,
    treatCount: 5,
    premiumTreatLimit: 1,
    price: setPrice("classic"),
    badge: "♥ Most Recommended",
    badgeColor: "var(--cherry, #c05)",
    desc: "A beautifully balanced dessert table with enough variety to create a full, polished look without going overboard.",
    subDesc: "Recommended for about 18-25 guests.",
    previewImg: "/images/brand-spread-new.png",
    previewLabel: "Classic Dessert Table",
  },
  {
    id: "signature",
    label: "Signature Dessert Table",
    pcs: 96,
    treatCount: 6,
    premiumTreatLimit: 2,
    price: setPrice("signature"),
    badge: "✦ Best Value",
    badgeColor: "var(--pine)",
    desc: "A fuller dessert-table experience with more variety, premium treat options, and a beautiful photo-ready presentation.",
    subDesc: "Recommended for approximately 30–45 guests depending on how many desserts you’d like per guest.",
    previewImg: "/images/treat-boxes/party-set-large.jpeg",
    previewLabel: "Signature Dessert Table",
  },
  {
    id: "luxe",
    label: "Luxe Dessert Table",
    pcs: 120,
    treatCount: 7,
    premiumTreatLimit: 3,
    price: setPrice("luxe"),
    badge: "Luxury Style",
    badgeColor: "var(--cherry, #c05)",
    desc: "A generous, statement-making dessert spread designed for larger celebrations and a luxurious, abundant table.",
    subDesc: "Recommended for about 45-60 guests.",
    previewImg: "/images/treat-boxes/party-set-large.jpeg",
    previewLabel: "Luxe Dessert Table",
  },
];

export type PartySetSize = (typeof PARTY_SET_SIZES)[number];

export const DEFAULT_PARTY_SET_SIZE_ID = "mini";

export function isPartySetSizeId(value: unknown): value is string {
  return typeof value === "string" && PARTY_SET_SIZES.some((s) => s.id === value);
}

export type PartySetTreatCategory = "classic" | "premium";

export const TREAT_OPTIONS: Array<{ id: string; label: string; category: PartySetTreatCategory; note?: string; sizeIds?: string[] }> = [
  { id: "cake-pops", label: "Cake Pops", category: "classic" },
  { id: "cakesicles", label: "Cakesicles", category: "classic" },
  { id: "madeleines", label: "Madeleines", category: "classic" },
  { id: "caramel-pretzel-rods", label: "Pretzel Rods", category: "classic" },
  { id: "twisted-pretzel", label: "Twisted Pretzels", category: "classic" },
  { id: "oreos", label: "Chocolate Covered Oreos", category: "classic" },
  { id: "rice-krispies", label: "Rice Krispies Treats", category: "classic" },
  { id: "gummi-candy-skewers", label: "Candy Kabobs", category: "classic" },
  { id: "macarons", label: "Macarons", category: "premium", note: "Basic round macarons with event color matching included" },
  { id: "bakery-cookies", label: "3 oz Bakery Cookies", category: "premium", note: "Large bakery-style cookies; flavors may rotate based on availability" },
];

export function treatOptionsForSize(sizeId: string) {
  return TREAT_OPTIONS.filter((t) => !t.sizeIds || t.sizeIds.includes(sizeId));
}

export function getPremiumTreatCount(selectedTreats: string[]): number {
  return selectedTreats.filter((id) => TREAT_OPTIONS.find((t) => t.id === id)?.category === "premium").length;
}

export const DESIGN_TIERS = [
  { id: "custom", label: "Custom Design Included", desc: "Event color matching, coordinated sprinkles and drizzle, simple piping, chocolate decorations, pearls, sparkle, small accents, and simple themed details", priceLabel: "Included", priceAdd: 0, popular: true },
  { id: "premium", label: "Premium Customization", desc: "For detailed characters, sculpted elements, intricate piping, detailed florals, monograms, edible images, multiple handmade chocolate elements, custom macaron shapes, or highly detailed themed designs", priceLabel: "", priceAddBySize: { mini: 15, classic: 20, signature: 25, luxe: 30 }, popular: false },
];

export type PartySetDesignTier = (typeof DESIGN_TIERS)[number];

const HAND_TIED_BOWS_ELIGIBLE_TREATS = new Set(["cakesicles", "cake-pops", "rice-krispies", "gummi-candy-skewers"]);
export const HAND_TIED_BOWS_PRICE_PER_DOZEN = 10;
const PORTABLE_HOLDER_ELIGIBLE_TREATS = new Set(["cake-pops", "cakesicles"]);
export const PORTABLE_HOLDER_PRICE_PER_BOX = 3;
export const WRAPPING_PRICE_PER_DOZEN = 3;
export const BOXED_WRAPPING_PRICE_PER_DOZEN = 5;
export const PARTY_TRAY_RENTAL_SETUP_PRICE = 70;

export const CAKE_OPTIONS = [
  { id: "none", label: "No cake", priceAdd: 0, desc: "Treats only" },
  { id: "6-inch", label: "Add 6\" Cake", priceAdd: 75, desc: "Starting at +$75" },
  { id: "8-inch", label: "Add 8\" Cake", priceAdd: 125, desc: "Starting at +$125" },
];

export const PARTY_FAVOR_OPTIONS = [
  {
    id: "royal-icing-sugar-cookies",
    label: "Royal Icing Sugar Cookies — starting at $50/dozen",
    priceAdd: 50,
    desc: "Party favor add-on. Basic designs start at $50 per dozen; detailed custom designs may cost more. Please attach inspiration photos below.",
  },
];

const TWO_TIER_DESIGN_TIERS = twoTierCakeProduct.designTiers?.filter((tier) => tier.priceAdd > 0).map((tier) => ({
  label: tier.name,
  price: tier.priceLabel,
  priceAdd: tier.priceAdd as number | undefined,
})) ?? [];

export const PARTY_SET_CAKE_ADDONS: Array<{ label: string; price: string; priceAdd?: number }> = [
  ...(cakeProduct.addons ?? []),
  ...TWO_TIER_DESIGN_TIERS,
];

export function getDesignPriceAdd(design: PartySetDesignTier | undefined, sizeId: string): number {
  if (!design) return 0;
  if ("priceAddBySize" in design && design.priceAddBySize) {
    return design.priceAddBySize[sizeId as keyof typeof design.priceAddBySize] ?? 0;
  }
  return "priceAdd" in design ? design.priceAdd : 0;
}

export function getHandTiedBowsPrice(selectedTreats: string[]): number {
  return selectedTreats.filter((id) => HAND_TIED_BOWS_ELIGIBLE_TREATS.has(id)).length * HAND_TIED_BOWS_PRICE_PER_DOZEN;
}

export function getPortableHolderBoxCount(selectedTreats: string[]): number {
  return selectedTreats.filter((id) => PORTABLE_HOLDER_ELIGIBLE_TREATS.has(id)).length;
}

export function getPortableHolderPrice(selectedTreats: string[]): number {
  return getPortableHolderBoxCount(selectedTreats) * PORTABLE_HOLDER_PRICE_PER_BOX;
}

export function getPartySetDozens(size: PartySetSize): number {
  return size.pcs / 12;
}

export type WrappingOption = "" | "wrapped" | "boxed";

export function getWrappingPrice(size: PartySetSize, wrapping: string, selectedTreats: string[]): number {
  const dozens = getPartySetDozens(size);
  if (wrapping === "wrapped") return dozens * WRAPPING_PRICE_PER_DOZEN;
  if (wrapping === "boxed") return getPortableHolderBoxCount(selectedTreats) * BOXED_WRAPPING_PRICE_PER_DOZEN;
  return 0;
}

/** Everything the customer chose in the builder - stored on the cart line so the server can re-price it. */
export interface PartySetSelection {
  kind: "party-set";
  sizeId: string;
  treats: string[];
  designTier: string;
  handTiedBows: boolean;
  portableHolderBoxes: boolean;
  wrapping: WrappingOption;
  cakeOptionId: string;
  cakeAddons: string[];
  partyFavors: Array<{ id: string; quantity: number }>;
  trayRentalSetup: boolean;
}

export type PartySetPrice =
  | { ok: true; unitPrice: number; size: PartySetSize }
  | { ok: false; error: string };

/**
 * Price one party set from the builder selection, enforcing the same rules the builder UI does.
 * Returns an error for selections the UI cannot produce (wrong treat count, unknown ids, ...).
 */
export function pricePartySet(sel: PartySetSelection): PartySetPrice {
  const size = PARTY_SET_SIZES.find((s) => s.id === sel.sizeId);
  if (!size) return { ok: false, error: "Unknown party set size." };

  const allowedTreats = new Set(treatOptionsForSize(size.id).map((t) => t.id));
  const treats = sel.treats;
  if (new Set(treats).size !== treats.length || treats.some((t) => !allowedTreats.has(t))) {
    return { ok: false, error: "Invalid treat selection for this party set." };
  }
  if (treats.length !== size.treatCount) {
    return { ok: false, error: `The ${size.label} needs exactly ${size.treatCount} treat types.` };
  }
  if (getPremiumTreatCount(treats) > size.premiumTreatLimit) {
    return { ok: false, error: `The ${size.label} includes up to ${size.premiumTreatLimit} Premium Bake selection${size.premiumTreatLimit === 1 ? "" : "s"}.` };
  }

  const design = DESIGN_TIERS.find((d) => d.id === sel.designTier);
  if (!design) return { ok: false, error: "Choose a customization option for the party set." };

  const holderBoxCount = getPortableHolderBoxCount(treats);
  if (sel.wrapping !== "" && sel.wrapping !== "wrapped" && sel.wrapping !== "boxed") {
    return { ok: false, error: "Invalid packaging option." };
  }
  if (sel.wrapping === "boxed" && holderBoxCount === 0) {
    return { ok: false, error: "Boxed wrapping needs Cake Pops or Cakesicles in the set." };
  }

  const cakeOption = CAKE_OPTIONS.find((c) => c.id === sel.cakeOptionId);
  if (!cakeOption) return { ok: false, error: "Invalid cake option." };
  const cakeAddonLabels = new Set(PARTY_SET_CAKE_ADDONS.map((a) => a.label));
  if (new Set(sel.cakeAddons).size !== sel.cakeAddons.length || sel.cakeAddons.some((l) => !cakeAddonLabels.has(l))) {
    return { ok: false, error: "Invalid cake add-on." };
  }
  if (cakeOption.id === "none" && sel.cakeAddons.length > 0) {
    return { ok: false, error: "Cake add-ons need a cake." };
  }
  const cakeAddonPrice = PARTY_SET_CAKE_ADDONS
    .filter((a) => sel.cakeAddons.includes(a.label))
    .reduce((sum, a) => sum + (a.priceAdd ?? 0), 0);

  let favorPrice = 0;
  for (const favor of sel.partyFavors) {
    const option = PARTY_FAVOR_OPTIONS.find((o) => o.id === favor.id);
    if (!option || !Number.isInteger(favor.quantity) || favor.quantity < 0 || favor.quantity > 99) {
      return { ok: false, error: "Invalid party favor selection." };
    }
    favorPrice += option.priceAdd * favor.quantity;
  }

  const unitPrice =
    size.price +
    getDesignPriceAdd(design, size.id) +
    (sel.handTiedBows ? getHandTiedBowsPrice(treats) : 0) +
    (sel.portableHolderBoxes && holderBoxCount > 0 ? getPortableHolderPrice(treats) : 0) +
    getWrappingPrice(size, sel.wrapping, treats) +
    cakeOption.priceAdd +
    (cakeOption.id === "none" ? 0 : cakeAddonPrice) +
    favorPrice +
    (sel.trayRentalSetup ? PARTY_TRAY_RENTAL_SETUP_PRICE : 0);

  return { ok: true, unitPrice, size };
}
