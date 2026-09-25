import { describe, expect, it } from "vitest";
import { validateOrderRequest } from "@/lib/orderRequest";
import { HTML_DATA_URL, JPEG_BYTES, PNG_BYTES, pngDataUrl } from "@/lib/testFixtures";

const customer = { name: "Sam Rivera", email: "sam@example.com", neededDate: "2026-10-10" };

const cakePopLine = (over: Record<string, unknown> = {}) => ({
  productSlug: "cakepops",
  variantLabel: "2 Dozen (24 pcs)",
  name: "Cake Pops",
  price: 76 + 12 + 20,
  quantity: 1,
  flavour: "Chocolate",
  selection: {
    kind: "product",
    flavour: "Chocolate",
    designTier: "Enhanced",
    addons: [{ label: "Hand Tied Bows", quantity: 1 }],
  },
  ...over,
});

function validate(body: Record<string, unknown>) {
  return validateOrderRequest({ customer, totalPrice: 108, items: [cakePopLine()], ...body });
}

describe("validateOrderRequest - customer fields", () => {
  it("accepts a normal order and recomputes the price from product data", () => {
    const r = validate({});
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.order.serverTotal).toBe(108); // 76 (2 dozen) + 12 (Enhanced) + 20 (bows for 2 dozen)
    expect(r.order.items[0].stored).toMatchObject({ productSlug: "cakepops", name: "Cake Pops", price: 108, quantity: 1, flavour: "Chocolate" });
    expect(r.order.pricingNotes).toEqual([]);
  });

  it.each([
    ["missing TLD", "sam@example"],
    ["single-letter TLD", "sam@example.c"],
    ["spaces", "sam @example.com"],
    ["header injection", "sam@example.com\r\nBcc: victim@example.com"],
    ["markup", "<b>sam</b>@example.com"],
  ])("rejects an email with %s", (_label, email) => {
    expect(validateOrderRequest({ customer: { ...customer, email }, items: [cakePopLine()] }).ok).toBe(false);
  });

  it("requires a valid neededDate", () => {
    expect(validateOrderRequest({ customer: { name: "Sam", email: "sam@example.com" }, items: [cakePopLine()] })).toMatchObject({ ok: false, error: expect.stringMatching(/date/) });
    expect(validateOrderRequest({ customer: { ...customer, neededDate: "2026-02-30" }, items: [cakePopLine()] }).ok).toBe(false);
    expect(validateOrderRequest({ customer: { ...customer, neededDate: "10/10/2026" }, items: [cakePopLine()] }).ok).toBe(false);
  });

  it("caps string lengths and rejects wrong types", () => {
    expect(validateOrderRequest({ customer: { ...customer, name: "x".repeat(121) }, items: [cakePopLine()] }).ok).toBe(false);
    expect(validateOrderRequest({ customer: { ...customer, message: "x".repeat(4001) }, items: [cakePopLine()] }).ok).toBe(false);
    expect(validateOrderRequest({ customer: { ...customer, phone: { $gt: "" } }, items: [cakePopLine()] }).ok).toBe(false);
    expect(validateOrderRequest({ customer: { ...customer, name: ["Sam"] }, items: [cakePopLine()] }).ok).toBe(false);
  });

  it("allows line breaks in notes but not in the name (it goes into the email subject)", () => {
    expect(validateOrderRequest({ customer: { ...customer, message: "line 1\nline 2" }, items: [cakePopLine()] }).ok).toBe(true);
    expect(validateOrderRequest({ customer: { ...customer, name: "Sam\nRivera" }, items: [cakePopLine()] }).ok).toBe(false);
  });
});

describe("validateOrderRequest - items", () => {
  it("rejects HTML or strings in quantity (email relay attempt)", () => {
    expect(validate({ items: [cakePopLine({ quantity: "<a href='https://evil.example'>win</a>" })] }).ok).toBe(false);
    expect(validate({ items: [cakePopLine({ quantity: "2" })] }).ok).toBe(false);
  });

  it("requires an integer quantity from 1 to 999", () => {
    for (const quantity of [0, -1, 1.5, 1000, Number.NaN]) {
      expect(validate({ items: [cakePopLine({ quantity })] }).ok).toBe(false);
    }
    expect(validate({ items: [cakePopLine({ quantity: 999 })] }).ok).toBe(true);
  });

  it("caps the number of lines", () => {
    expect(validate({ items: Array.from({ length: 31 }, () => cakePopLine()) }).ok).toBe(false);
    expect(validate({ items: Array.from({ length: 30 }, () => cakePopLine()) }).ok).toBe(true);
    expect(validate({ items: [] }).ok).toBe(false);
  });

  it("rejects unknown products and unknown options", () => {
    expect(validate({ items: [cakePopLine({ productSlug: "no-such-thing" })] }).ok).toBe(false);
    expect(validate({ items: [cakePopLine({ variantLabel: "10 Dozen" })] }).ok).toBe(false);
    expect(validate({ items: [cakePopLine({ selection: { kind: "product", flavour: "Chocolate", designTier: "Gold", addons: [] } })] }).ok).toBe(false);
    expect(validate({ items: [cakePopLine({ selection: { kind: "product", flavour: "Lemon", designTier: "Classic", addons: [] } })] }).ok).toBe(false);
    expect(validate({ items: [cakePopLine({ selection: { kind: "product", flavour: "Chocolate", designTier: "Classic", addons: [{ label: "Free Gold", quantity: 1 }] } })] }).ok).toBe(false);
  });

  it("stores the server price and records a mismatch when the client price was tampered with", () => {
    const r = validate({ totalPrice: 1, items: [cakePopLine({ price: 1 })] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.order.serverTotal).toBe(108);
    expect(r.order.clientTotal).toBe(1);
    expect(r.order.pricingNotes.join("\n")).toMatch(/cart showed \$1\.00 each, recomputed \$108\.00/);
    expect(r.order.pricingNotes.join("\n")).toMatch(/Order total: cart showed \$1\.00, recomputed \$108\.00/);
  });

  it("prices a 50/50 flavour split and per-variant add-ons", () => {
    const r = validate({
      items: [
        cakePopLine({
          variantLabel: "3 Dozen (36 pcs)",
          selection: {
            kind: "product",
            flavour: "Chocolate",
            secondFlavour: "Strawberry",
            designTier: "Signature Custom",
            addons: [{ label: "Individually Wrapped in Boxes", quantity: 1 }],
          },
        }),
      ],
    });
    expect(r.ok && r.order.serverTotal).toBe(112 + 12 + 24 + 15);
  });

  it("rejects both wrapping add-ons together", () => {
    const r = validate({
      items: [cakePopLine({ selection: { kind: "product", flavour: "Chocolate", designTier: "Classic", addons: [{ label: "Individually Wrapped", quantity: 1 }, { label: "Individually Wrapped in Boxes", quantity: 1 }] } })],
    });
    expect(r.ok).toBe(false);
  });

  it("accepts quote-on-request add-ons at $0 and notes them for the owner", () => {
    const r = validateOrderRequest({
      customer,
      items: [
        {
          productSlug: "madeleines",
          variantLabel: "1 Dozen (Base Design)",
          quantity: 2,
          price: 34,
          selection: { kind: "product", addons: [{ label: "Semi Custom Design (expanded palette, marbling, themed styling)", quantity: 1 }] },
        },
      ],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.order.serverTotal).toBe(68);
    expect(r.order.pricingNotes.join("\n")).toMatch(/quote after consultation for Semi Custom Design/);
  });

  it("prices a party set from the builder selection", () => {
    const r = validateOrderRequest({
      customer,
      items: [
        {
          productSlug: "party-set",
          variantLabel: "Classic Dessert Table",
          quantity: 1,
          price: 0,
          selection: {
            kind: "party-set",
            sizeId: "classic",
            treats: ["cake-pops", "cakesicles", "oreos", "rice-krispies", "twisted-pretzel"],
            designTier: "enhanced",
            handTiedBows: true,
            portableHolderBoxes: true,
            wrapping: "boxed",
            cakeOptionId: "6-inch",
            cakeAddons: ["Filling", "Full Custom"],
            partyFavors: [{ id: "royal-icing-sugar-cookies", quantity: 2 }],
            trayRentalSetup: true,
          },
        },
      ],
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    // 215 set + 30 enhanced + 30 bows (3 eligible) + 6 holders + 10 boxed + 75 cake + 8 filling + 80 full custom + 100 favors + 70 rental
    expect(r.order.serverTotal).toBe(624);
    expect(r.order.items[0].stored).toMatchObject({ name: "Party Set — Classic Dessert Table", variantLabel: "Classic Dessert Table" });
  });

  it("rejects a party set with the wrong number of treats", () => {
    const r = validateOrderRequest({
      customer,
      items: [{ productSlug: "party-set", variantLabel: "Mini Dessert Table", quantity: 1, price: 175, selection: { kind: "party-set", sizeId: "mini", treats: ["cake-pops"], designTier: "classic", cakeOptionId: "none", cakeAddons: [], partyFavors: [], wrapping: "" } }],
    });
    expect(r.ok).toBe(false);
  });

  it("prices a line without structured options at its base price and flags it", () => {
    const r = validateOrderRequest({ customer, items: [{ productSlug: "cakesicles", variantLabel: "1 Dozen", quantity: 1, price: 69, flavour: "Funfetti" }] });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.order.serverTotal).toBe(54);
    expect(r.order.pricingNotes.join("\n")).toMatch(/without its selected options/);
  });

  it("rejects quote-only products", () => {
    expect(validateOrderRequest({ customer, items: [{ productSlug: "custom-design-macarons", variantLabel: "Custom Design Macarons", quantity: 1, price: 0 }] }).ok).toBe(false);
  });

  it("uses the longest product lead time in the cart", () => {
    const r = validateOrderRequest({
      customer,
      items: [
        cakePopLine(),
        { productSlug: "party-two-tier-cake", variantLabel: "Two-Tier Tall Cake (6\"&4\") — serves 15–18", quantity: 1, price: 185, selection: { kind: "product", flavour: "Chocolate", designTier: "Classic", addons: [] } },
      ],
    });
    expect(r.ok && r.order.leadDays).toBe(7);
  });
});

describe("validateOrderRequest - photos", () => {
  const withImages = (images: unknown[]) => validate({ items: [cakePopLine({ inspirationImages: images })] });

  it("decodes photos, identifies them by magic bytes and keeps no dataUrl in the stored item", () => {
    const r = withImages([
      { name: "cake.png", type: "image/png", size: 12, dataUrl: pngDataUrl() },
      { name: "idea.heic", type: "image/heic", size: 8, dataUrl: `data:image/heic;base64,${JPEG_BYTES.toString("base64")}` },
    ]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const item = r.order.items[0];
    expect(item.images.map((i) => [i.mime, i.ext])).toEqual([["image/png", ".png"], ["image/jpeg", ".jpg"]]);
    expect(item.images[0].bytes.equals(PNG_BYTES)).toBe(true);
    expect(JSON.stringify(item.stored)).not.toMatch(/dataUrl|base64/);
    expect(item.stored.inspirationImages).toEqual([
      { name: "cake.png", type: "image/png", size: 12 },
      { name: "idea.heic", type: "image/jpeg", size: 8 },
    ]);
  });

  it("rejects a file that is not really an image, whatever it claims to be", () => {
    expect(withImages([{ name: "x.png", type: "image/png", size: 10, dataUrl: HTML_DATA_URL }]).ok).toBe(false);
  });

  it("rejects malformed data URLs", () => {
    expect(withImages([{ name: "x.png", type: "image/png", size: 10, dataUrl: "data:image/png;base64,@@@@" }]).ok).toBe(false);
    expect(withImages([{ name: "x.png", type: "image/png", size: 10, dataUrl: "https://example.com/x.png" }]).ok).toBe(false);
  });

  it("caps photos per item and per-photo size", () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ name: `${i}.png`, type: "image/png", size: 12, dataUrl: pngDataUrl() }));
    expect(withImages(five).ok).toBe(true);
    expect(withImages([...five, five[0]]).ok).toBe(false);
    const big = Buffer.concat([PNG_BYTES, Buffer.alloc(10 * 1024 * 1024)]);
    expect(withImages([{ name: "big.png", type: "image/png", size: big.length, dataUrl: pngDataUrl(big) }])).toMatchObject({ ok: false, error: expect.stringMatching(/10 MB/) });
  });

  it("caps total photo bytes across the order", () => {
    const nine = Buffer.concat([PNG_BYTES, Buffer.alloc(9 * 1024 * 1024)]);
    const line = () => cakePopLine({ inspirationImages: [{ name: "p.png", type: "image/png", size: nine.length, dataUrl: pngDataUrl(nine) }] });
    expect(validate({ items: [line(), line()] }).ok).toBe(true);
    expect(validate({ items: [line(), line(), line()] })).toMatchObject({ ok: false, error: expect.stringMatching(/20 MB/) });
  });
});
