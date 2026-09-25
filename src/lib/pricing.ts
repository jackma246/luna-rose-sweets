/**
 * Cart line pricing, shared by the product page (display) and the order API (authoritative recompute).
 *
 * The client sends the structured selection it priced; the server re-prices it from src/data and never
 * trusts the client's number.
 */
import { CAKE_FLAVOURS, type Product, type ProductAddon } from "@/data/products";
import { pricePartySet, type PartySetSelection } from "@/data/partySet";

export interface ProductSelection {
  kind: "product";
  flavour?: string;
  /** 50/50 flavour split, for products with flavourAddonPrice. */
  secondFlavour?: string;
  designTier?: string;
  addons: Array<{ label: string; quantity: number }>;
}

export type LineSelection = ProductSelection | PartySetSelection;

export type LinePrice = { ok: true; unitPrice: number; quoteAddons: string[] } | { ok: false; error: string };

const FIXED_FLAVOUR_BASE = "Classic Vanilla";
const EXCLUSIVE_ADDONS = ["Individually Wrapped", "Individually Wrapped in Boxes"];
export const MAX_ADDON_QUANTITY = 99;

/** Add-ons priced per unit with a quantity stepper instead of an on/off toggle. */
export function isQuantityAddon(addon: ProductAddon): boolean {
  return addon.label.includes("Icing Sugar Cookies");
}

/** Add-ons with no numeric price: selectable, priced after the design consultation, $0 on the estimate. */
export function isQuoteAddon(addon: ProductAddon): boolean {
  return addon.priceAdd === undefined && addon.priceAddByVariant === undefined;
}

export function addonUnitPrice(addon: ProductAddon, variantIdx: number): number {
  return addon.priceAddByVariant?.[variantIdx] ?? addon.priceAdd ?? 0;
}

/** Flavours that can be picked as the second half of a 50/50 split. */
export function secondFlavourChoices(product: Product, firstFlavour: string | undefined): string[] {
  if (!product.flavourAddonPrice) return [];
  if (product.fixedFlavour) return CAKE_FLAVOURS.map((f) => f.name).filter((n) => n !== FIXED_FLAVOUR_BASE);
  return (product.flavours ?? []).map((f) => f.name).filter((n) => n !== firstFlavour);
}

export function priceProductLine(product: Product, variantLabel: string, sel: ProductSelection): LinePrice {
  if (product.enquireOnly) return { ok: false, error: `${product.name} is quote-only - please use the contact form.` };
  const variantIdx = product.variants.findIndex((v) => v.label === variantLabel);
  if (variantIdx < 0) return { ok: false, error: `Unknown option for ${product.name}.` };
  const variant = product.variants[variantIdx];

  const flavourNames = (product.flavours ?? []).map((f) => f.name);
  if (flavourNames.length > 0) {
    if (!sel.flavour || !flavourNames.includes(sel.flavour)) return { ok: false, error: `Choose a flavour for ${product.name}.` };
  } else if (sel.flavour) {
    return { ok: false, error: `${product.name} does not take a flavour choice.` };
  }

  let unitPrice = variant.price;

  if (sel.secondFlavour) {
    if (!secondFlavourChoices(product, sel.flavour).includes(sel.secondFlavour)) {
      return { ok: false, error: `Invalid second flavour for ${product.name}.` };
    }
    unitPrice += product.flavourAddonPrice ?? 0;
  }

  if (product.designTiers && product.designTiers.length > 0) {
    const tier = product.designTiers.find((t) => t.name === sel.designTier);
    if (!tier) return { ok: false, error: `Choose a design for ${product.name}.` };
    unitPrice += tier.priceAdd;
  } else if (sel.designTier) {
    return { ok: false, error: `${product.name} does not take a design choice.` };
  }

  const seen = new Set<string>();
  const quoteAddons: string[] = [];
  for (const chosen of sel.addons) {
    const addon = product.addons?.find((a) => a.label === chosen.label);
    if (!addon || seen.has(addon.label)) return { ok: false, error: `Invalid add-on for ${product.name}.` };
    seen.add(addon.label);
    const maxQty = isQuantityAddon(addon) ? MAX_ADDON_QUANTITY : 1;
    if (!Number.isInteger(chosen.quantity) || chosen.quantity < 1 || chosen.quantity > maxQty) {
      return { ok: false, error: `Invalid add-on quantity for ${product.name}.` };
    }
    if (isQuoteAddon(addon)) quoteAddons.push(addon.label);
    unitPrice += addonUnitPrice(addon, variantIdx) * chosen.quantity;
  }
  if (EXCLUSIVE_ADDONS.every((label) => seen.has(label))) {
    return { ok: false, error: "Choose either Individually Wrapped or Individually Wrapped in Boxes, not both." };
  }

  return { ok: true, unitPrice, quoteAddons };
}

export function priceLine(product: Product, variantLabel: string, sel: LineSelection): LinePrice {
  if (sel.kind === "party-set") {
    if (product.slug !== "party-set") return { ok: false, error: "Party set options on a non party set item." };
    const r = pricePartySet(sel);
    return r.ok ? { ok: true, unitPrice: r.unitPrice, quoteAddons: [] } : r;
  }
  if (product.slug === "party-set") return { ok: false, error: "Build party sets with the party set builder." };
  return priceProductLine(product, variantLabel, sel);
}
