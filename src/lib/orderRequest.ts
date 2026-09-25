/**
 * Validation and server-side pricing for public order requests (POST /api/request-order).
 *
 * Everything the browser sends is untrusted: strings are type-checked and length-capped, quantities are
 * integers, photos are decoded and identified by their bytes, and every price is recomputed from
 * src/data. Nothing from the payload reaches an email or the database without passing through here.
 */
import { getProductBySlug, cartLeadDays } from "@/data/products";
import { PARTY_SET_SIZES, isPartySetSizeId, type PartySetSelection, type WrappingOption } from "@/data/partySet";
import { isDateKey } from "@/lib/businessDate";
import { decodeDataUrl, MAX_IMAGE_BYTES, MAX_IMAGES_PER_ORDER, safeOriginalName, sniffImageType, type SniffedImage } from "@/lib/imageStorage";
import { priceLine, type LineSelection, type ProductSelection } from "@/lib/pricing";
import type { CartItem as StoredItem, CustomerInfo } from "@/lib/orderEmails";

export const ORDER_LIMITS = {
  /** Hard cap on the raw request body, checked before parsing. */
  bodyBytes: 30 * 1024 * 1024,
  name: 120,
  email: 254,
  phone: 40,
  message: 4000,
  items: 30,
  itemNote: 2000,
  quantity: 999,
  imagesPerItem: 5,
  imagesPerOrder: MAX_IMAGES_PER_ORDER,
  imageBytes: MAX_IMAGE_BYTES,
  /** Decoded photo bytes across the whole order. */
  totalImageBytes: 20 * 1024 * 1024,
  shortText: 200,
} as const;

// Requires a dotted domain ending in a 2+ letter TLD; no whitespace or control characters anywhere.
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,63}$/;
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const LINE_BREAKS = /[\r\n\u2028\u2029]/;

export interface VerifiedImage {
  name: string;
  mime: SniffedImage["mime"];
  ext: SniffedImage["ext"];
  bytes: Buffer;
}

export interface ValidatedItem {
  /** What gets stored in Order.items (no photo bytes). */
  stored: StoredItem;
  images: VerifiedImage[];
  clientUnitPrice: number | null;
}

export interface ValidatedOrder {
  customer: CustomerInfo & { neededDate: string };
  items: ValidatedItem[];
  /** Authoritative total, recomputed from product data. */
  serverTotal: number;
  clientTotal: number | null;
  leadDays: number;
  /** Human-readable pricing notes for the owner (price mismatches, legacy lines, quoted add-ons). */
  pricingNotes: string[];
}

export type OrderValidation = { ok: true; order: ValidatedOrder } | { ok: false; error: string };

type Fail = { ok: false; error: string };
const fail = (error: string): Fail => ({ ok: false, error });

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Optional free text: must be a string when present, is trimmed and capped. Control characters are
 * rejected; single-line fields also reject line breaks (they end up in email subjects and headers).
 */
function readText(value: unknown, label: string, max: number, { multiline = false, required = false } = {}): string | Fail {
  if (value === undefined || value === null || value === "") {
    return required ? fail(`${label} is required.`) : "";
  }
  if (typeof value !== "string") return fail(`${label} must be text.`);
  const text = value.trim();
  if (required && !text) return fail(`${label} is required.`);
  if (text.length > max) return fail(`${label} is too long (max ${max} characters).`);
  if (CONTROL_CHARS.test(text) || (!multiline && LINE_BREAKS.test(text))) return fail(`${label} contains invalid characters.`);
  return text;
}

const isFail = (v: unknown): v is Fail => isRecord(v) && v.ok === false;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function readProductSelection(raw: Record<string, unknown>): ProductSelection | Fail {
  const flavour = readText(raw.flavour, "Flavour", ORDER_LIMITS.shortText);
  if (isFail(flavour)) return flavour;
  const secondFlavour = readText(raw.secondFlavour, "Second flavour", ORDER_LIMITS.shortText);
  if (isFail(secondFlavour)) return secondFlavour;
  const designTier = readText(raw.designTier, "Design", ORDER_LIMITS.shortText);
  if (isFail(designTier)) return designTier;
  const addonsRaw = raw.addons ?? [];
  if (!Array.isArray(addonsRaw) || addonsRaw.length > 20) return fail("Invalid add-ons.");
  const addons: ProductSelection["addons"] = [];
  for (const a of addonsRaw) {
    if (!isRecord(a) || typeof a.label !== "string" || a.label.length > ORDER_LIMITS.shortText || typeof a.quantity !== "number") {
      return fail("Invalid add-ons.");
    }
    addons.push({ label: a.label, quantity: a.quantity });
  }
  return {
    kind: "product",
    ...(flavour ? { flavour } : {}),
    ...(secondFlavour ? { secondFlavour } : {}),
    ...(designTier ? { designTier } : {}),
    addons,
  };
}

function readStringList(value: unknown, max: number): string[] | null {
  if (!Array.isArray(value) || value.length > max) return null;
  if (!value.every((v) => typeof v === "string" && v.length <= ORDER_LIMITS.shortText)) return null;
  return value as string[];
}

function readPartySetSelection(raw: Record<string, unknown>): PartySetSelection | Fail {
  const treats = readStringList(raw.treats, 20);
  const cakeAddons = readStringList(raw.cakeAddons ?? [], 20);
  const favorsRaw = raw.partyFavors ?? [];
  if (!treats || !cakeAddons || !Array.isArray(favorsRaw) || favorsRaw.length > 10) return fail("Invalid party set options.");
  const partyFavors: PartySetSelection["partyFavors"] = [];
  for (const f of favorsRaw) {
    if (!isRecord(f) || typeof f.id !== "string" || typeof f.quantity !== "number") return fail("Invalid party set options.");
    partyFavors.push({ id: f.id, quantity: f.quantity });
  }
  const wrapping = raw.wrapping ?? "";
  if (wrapping !== "" && wrapping !== "wrapped" && wrapping !== "boxed") return fail("Invalid party set options.");
  if (
    typeof raw.sizeId !== "string" ||
    typeof raw.designTier !== "string" ||
    typeof raw.cakeOptionId !== "string" ||
    typeof (raw.handTiedBows ?? false) !== "boolean" ||
    typeof (raw.portableHolderBoxes ?? false) !== "boolean" ||
    typeof (raw.trayRentalSetup ?? false) !== "boolean"
  ) {
    return fail("Invalid party set options.");
  }
  return {
    kind: "party-set",
    sizeId: raw.sizeId,
    treats,
    designTier: raw.designTier,
    handTiedBows: raw.handTiedBows === true,
    portableHolderBoxes: raw.portableHolderBoxes === true,
    wrapping: wrapping as WrappingOption,
    cakeOptionId: raw.cakeOptionId,
    cakeAddons,
    partyFavors,
    trayRentalSetup: raw.trayRentalSetup === true,
  };
}

function readSelection(value: unknown): LineSelection | null | Fail {
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) return fail("Invalid item options.");
  if (value.kind === "party-set") return readPartySetSelection(value);
  if (value.kind === "product") return readProductSelection(value);
  return fail("Invalid item options.");
}

function readImages(value: unknown, itemName: string): VerifiedImage[] | Fail {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return fail("Invalid photos.");
  if (value.length > ORDER_LIMITS.imagesPerItem) {
    return fail(`Please attach at most ${ORDER_LIMITS.imagesPerItem} photos per item (${itemName}).`);
  }
  const out: VerifiedImage[] = [];
  for (const img of value) {
    if (!isRecord(img) || typeof img.dataUrl !== "string") return fail("Invalid photo upload.");
    const name = safeOriginalName(img.name);
    // base64 is 4/3 of the bytes: refuse obviously oversized strings before decoding them.
    if (img.dataUrl.length > Math.ceil((ORDER_LIMITS.imageBytes * 4) / 3) + 200) {
      return fail(`${name} is larger than 10 MB - please choose a smaller photo.`);
    }
    const bytes = decodeDataUrl(img.dataUrl);
    if (!bytes) return fail(`${name} could not be read - please attach it again.`);
    if (bytes.byteLength > ORDER_LIMITS.imageBytes) return fail(`${name} is larger than 10 MB - please choose a smaller photo.`);
    const sniffed = sniffImageType(bytes);
    if (!sniffed) return fail(`${name} is not a supported photo type (JPEG, PNG, WebP, HEIC or GIF).`);
    out.push({ name, mime: sniffed.mime, ext: sniffed.ext, bytes });
  }
  return out;
}

function readItem(raw: unknown, index: number): (ValidatedItem & { quoteAddons: string[]; legacy: boolean }) | Fail {
  const where = `Item ${index + 1}`;
  if (!isRecord(raw)) return fail(`${where} is invalid.`);

  const slug = readText(raw.productSlug, `${where} product`, ORDER_LIMITS.shortText, { required: true });
  if (isFail(slug)) return slug;
  const product = getProductBySlug(slug);
  if (!product) return fail(`${where}: that product is no longer available.`);

  if (typeof raw.quantity !== "number" || !Number.isInteger(raw.quantity) || raw.quantity < 1 || raw.quantity > ORDER_LIMITS.quantity) {
    return fail(`${where}: quantity must be a whole number from 1 to ${ORDER_LIMITS.quantity}.`);
  }
  const quantity = raw.quantity;

  const variantLabel = readText(raw.variantLabel, `${where} option`, ORDER_LIMITS.shortText, { required: true });
  if (isFail(variantLabel)) return variantLabel;
  const note = readText(raw.note, `${where} details`, ORDER_LIMITS.itemNote, { multiline: true });
  if (isFail(note)) return note;
  const legacyFlavour = readText(raw.flavour, `${where} flavour`, ORDER_LIMITS.shortText);
  if (isFail(legacyFlavour)) return legacyFlavour;

  const selection = readSelection(raw.selection);
  if (isFail(selection)) return fail(`${where}: ${selection.error}`);

  const clientUnitPrice = typeof raw.price === "number" && Number.isFinite(raw.price) ? raw.price : null;

  let unitPrice: number;
  let name = product.name;
  let canonicalVariant = variantLabel;
  let flavour: string | undefined;
  let quoteAddons: string[] = [];
  let legacy = false;

  if (selection) {
    const priced = priceLine(product, variantLabel, selection);
    if (!priced.ok) return fail(`${where}: ${priced.error}`);
    unitPrice = priced.unitPrice;
    quoteAddons = priced.quoteAddons;
    if (selection.kind === "party-set") {
      const size = PARTY_SET_SIZES.find((s) => s.id === selection.sizeId)!;
      name = `Party Set — ${size.label}`;
      canonicalVariant = size.label;
    } else {
      flavour = selection.flavour;
    }
  } else {
    // A line from a cart built before structured options existed. Price it at the base option and flag
    // it for the owner rather than losing the order.
    legacy = true;
    if (product.enquireOnly) return fail(`${where}: ${product.name} is quote-only - please use the contact form.`);
    if (product.slug === "party-set") {
      const size = PARTY_SET_SIZES.find((s) => s.label === variantLabel || (isPartySetSizeId(variantLabel) && s.id === variantLabel));
      if (!size) return fail(`${where}: unknown party set size.`);
      unitPrice = size.price;
      name = `Party Set — ${size.label}`;
      canonicalVariant = size.label;
    } else {
      const variant = product.variants.find((v) => v.label === variantLabel);
      if (!variant) return fail(`${where}: unknown option for ${product.name}.`);
      unitPrice = variant.price;
      const flavourNames = (product.flavours ?? []).map((f) => f.name);
      if (legacyFlavour && !flavourNames.includes(legacyFlavour)) return fail(`${where}: unknown flavour.`);
      flavour = legacyFlavour || undefined;
    }
  }

  const images = readImages(raw.inspirationImages, product.name);
  if (isFail(images)) return images;

  const stored: StoredItem = {
    productSlug: product.slug,
    name,
    variantLabel: canonicalVariant,
    quantity,
    price: round2(unitPrice),
    ...(flavour ? { flavour } : {}),
    ...(note ? { note } : {}),
    ...(selection ? { selection } : {}),
    ...(images.length > 0
      ? { inspirationImages: images.map((img) => ({ name: img.name, type: img.mime, size: img.bytes.byteLength })) }
      : {}),
  };
  return { stored, images, clientUnitPrice, quoteAddons, legacy };
}

export function validateOrderRequest(body: unknown): OrderValidation {
  if (!isRecord(body)) return fail("Invalid request.");
  const c = body.customer;
  if (!isRecord(c)) return fail("Name and email are required.");

  const name = readText(c.name, "Name", ORDER_LIMITS.name, { required: true });
  if (isFail(name)) return name;
  const email = readText(c.email, "Email", ORDER_LIMITS.email, { required: true });
  if (isFail(email)) return email;
  if (!EMAIL_RE.test(email)) return fail("Please enter a valid email address.");
  const phone = readText(c.phone, "Phone", ORDER_LIMITS.phone);
  if (isFail(phone)) return phone;
  const message = readText(c.message, "Notes", ORDER_LIMITS.message, { multiline: true });
  if (isFail(message)) return message;
  if (c.neededDate === undefined || c.neededDate === null || c.neededDate === "") {
    return fail("Please choose the date you need your order.");
  }
  if (!isDateKey(c.neededDate)) return fail("Please enter a valid date.");
  const neededDate = c.neededDate;

  const rawItems = body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) return fail("Cart is empty.");
  if (rawItems.length > ORDER_LIMITS.items) return fail(`Please keep an order to ${ORDER_LIMITS.items} lines or fewer.`);

  const items: ValidatedItem[] = [];
  const pricingNotes: string[] = [];
  let serverTotal = 0;
  let imageCount = 0;
  let imageBytes = 0;
  for (let i = 0; i < rawItems.length; i += 1) {
    const item = readItem(rawItems[i], i);
    if (isFail(item)) return item;
    imageCount += item.images.length;
    imageBytes += item.images.reduce((sum, img) => sum + img.bytes.byteLength, 0);
    if (imageCount > ORDER_LIMITS.imagesPerOrder) return fail(`Please attach at most ${ORDER_LIMITS.imagesPerOrder} photos per order.`);
    if (imageBytes > ORDER_LIMITS.totalImageBytes) {
      return fail("Your photos add up to more than 20 MB - please attach fewer or smaller photos.");
    }
    const { stored } = item;
    serverTotal += stored.price * stored.quantity;
    const label = `${stored.name} (${stored.variantLabel})`;
    if (item.legacy) pricingNotes.push(`${label}: sent without its selected options; priced at the base option.`);
    if (item.clientUnitPrice !== null && Math.abs(item.clientUnitPrice - stored.price) > 0.005) {
      pricingNotes.push(`${label}: cart showed $${item.clientUnitPrice.toFixed(2)} each, recomputed $${stored.price.toFixed(2)}.`);
    }
    if (item.quoteAddons.length > 0) {
      pricingNotes.push(`${label}: quote after consultation for ${item.quoteAddons.join(", ")}.`);
    }
    items.push({ stored, images: item.images, clientUnitPrice: item.clientUnitPrice });
  }
  serverTotal = round2(serverTotal);

  const clientTotal = typeof body.totalPrice === "number" && Number.isFinite(body.totalPrice) ? body.totalPrice : null;
  if (clientTotal !== null && Math.abs(clientTotal - serverTotal) > 0.005) {
    pricingNotes.push(`Order total: cart showed $${clientTotal.toFixed(2)}, recomputed $${serverTotal.toFixed(2)}. The recomputed total was saved.`);
  }

  return {
    ok: true,
    order: {
      customer: { name, email, phone: phone || null, message: message || null, neededDate },
      items,
      serverTotal,
      clientTotal,
      leadDays: cartLeadDays(items.map((i) => i.stored.productSlug ?? "")),
      pricingNotes,
    },
  };
}
