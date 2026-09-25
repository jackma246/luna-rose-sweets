import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CAKE_FLAVOURS, cartLeadDays, getProductBySlug, productLeadDays, products, visibleProducts } from "@/data/products";
import { PARTY_SET_SIZES, pricePartySet } from "@/data/partySet";
import { isQuoteAddon, priceProductLine } from "@/lib/pricing";
import sitemap from "@/app/sitemap";

const site = (file: string) => readFileSync(path.join(process.cwd(), "src/app/(site)", file), "utf8");

describe("product copy matches product data", () => {
  it("states the real flavour count everywhere", () => {
    const text = JSON.stringify(products);
    expect(text).not.toMatch(/6 [Ff]lavours/);
    for (const p of products.filter((p) => p.flavours === CAKE_FLAVOURS)) {
      if (p.subtitle?.includes("Flavours")) expect(p.subtitle).toContain(`${CAKE_FLAVOURS.length} Flavours`);
    }
  });

  it("hides the under-construction placeholder products from listings", () => {
    for (const slug of ["icing-sugar-cookies", "custom-design-macarons"]) {
      expect(visibleProducts.some((p) => p.slug === slug)).toBe(false);
    }
    expect(visibleProducts.some((p) => JSON.stringify(p).includes("under-construction"))).toBe(false);
  });

  it("names real party set sizes in the recommendation copy", () => {
    const names = PARTY_SET_SIZES.map((s) => s.label.split(" ")[0]);
    for (const file of ["page.tsx", "party/page.tsx"]) {
      const text = site(file);
      expect(text).not.toMatch(/Medium or Large/);
      const m = /Most customers choose our (\w+) or (\w+) table/.exec(text);
      expect(m && names.includes(m[1]) && names.includes(m[2])).toBe(true);
    }
  });

  it("footer shop links point at products that exist and are listed", () => {
    const footer = site("components/V2Footer.tsx");
    const slugs = [...footer.matchAll(/href="\/products\/([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(slugs).toEqual(expect.arrayContaining(["cakepops", "cakesicles"]));
    for (const slug of slugs) expect(visibleProducts.some((p) => p.slug === slug)).toBe(true);
    for (const [, category] of footer.matchAll(/href="\/products\?category=([^"]+)"/g)) {
      expect(visibleProducts.some((p) => p.category === decodeURIComponent(category))).toBe(true);
    }
  });
});

describe("lead times", () => {
  it("come from the product copy", () => {
    expect(productLeadDays("party-layer-cake")).toBe(5);
    expect(productLeadDays("party-two-tier-cake")).toBe(7);
    expect(productLeadDays("macaron-tower")).toBe(5);
    expect(productLeadDays("cakepops")).toBe(3);
    expect(cartLeadDays(["cakepops", "party-two-tier-cake", "party-layer-cake"])).toBe(7);
    expect(cartLeadDays([])).toBe(3);
  });

  it("every product whose copy promises a week or more notice enforces at least that", () => {
    for (const p of products) {
      if (/at least 1 week notice/.test(p.details ?? "")) expect(p.leadDays ?? 3).toBeGreaterThanOrEqual(7);
      const days = /at least (\d+) days notice/.exec(p.details ?? "");
      if (days) expect(p.leadDays ?? 3).toBeGreaterThanOrEqual(Number(days[1]));
    }
  });
});

describe("pricing", () => {
  it("every add-on without a numeric price is selectable as quote-on-request at $0", () => {
    for (const p of products.filter((p) => !p.enquireOnly && !p.designTiers?.length && !p.flavours?.length)) {
      for (const addon of p.addons ?? []) {
        if (!isQuoteAddon(addon)) continue;
        const r = priceProductLine(p, p.variants[0].label, { kind: "product", addons: [{ label: addon.label, quantity: 1 }] });
        expect(r).toEqual({ ok: true, unitPrice: p.variants[0].price, quoteAddons: [addon.label] });
      }
    }
  });

  it("party set base prices match the party-set product variants", () => {
    const variants = getProductBySlug("party-set")!.variants;
    for (const size of PARTY_SET_SIZES) {
      expect(variants.some((v) => v.label.startsWith(size.label) && v.price === size.price)).toBe(true);
      const treats = ["cake-pops", "cakesicles", "oreos", "twisted-pretzel", "caramel-pretzel-rods", "gummi-candy-skewers", "madeleines"].filter(
        (_, i) => i < size.treatCount,
      );
      const r = pricePartySet({
        kind: "party-set", sizeId: size.id, treats: size.id === "classic" ? [...treats.slice(0, 4), "rice-krispies"] : treats,
        designTier: "classic", handTiedBows: false, portableHolderBoxes: false, wrapping: "", cakeOptionId: "none", cakeAddons: [], partyFavors: [], trayRentalSetup: false,
      });
      expect(r).toMatchObject({ ok: true, unitPrice: size.price });
    }
  });
});

describe("sitemap", () => {
  it("lists every visible product once and no hidden ones", () => {
    const urls = sitemap().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const p of visibleProducts) expect(urls.some((u) => u.endsWith(`/products/${p.slug}`))).toBe(true);
    expect(urls.some((u) => u.endsWith("/products/icing-sugar-cookies"))).toBe(false);
  });
});
