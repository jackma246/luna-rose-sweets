import { describe, expect, it } from "vitest";
import { addLine, parseStoredCart, removeLine, setLineQuantity, withoutPhotoData, type NewCartItem } from "@/context/CartContext";

const pops = (flavour: string, extra: Partial<NewCartItem> = {}): NewCartItem => ({
  productSlug: "cakepops",
  variantLabel: "1 Dozen (12 pcs)",
  name: "Cake Pops",
  price: 40,
  flavour,
  selection: { kind: "product", flavour, designTier: "Classic", addons: [] },
  ...extra,
});

describe("cart lines", () => {
  it("keeps the same product with different options as separate lines", () => {
    let items = addLine([], pops("Chocolate"), 1, "a");
    items = addLine(items, pops("Strawberry"), 2, "b");
    expect(items.map((i) => [i.lineId, i.flavour, i.quantity])).toEqual([
      ["a", "Chocolate", 1],
      ["b", "Strawberry", 2],
    ]);
  });

  it("merges only when every option is identical", () => {
    let items = addLine([], pops("Chocolate"), 1, "a");
    items = addLine(items, pops("Chocolate"), 2, "b");
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ lineId: "a", quantity: 3 });
    items = addLine(items, pops("Chocolate", { note: "Design: Enhanced" }), 1, "c");
    expect(items).toHaveLength(2);
  });

  it("changes and removes only the targeted line", () => {
    let items = addLine(addLine([], pops("Chocolate"), 1, "a"), pops("Strawberry"), 1, "b");
    items = setLineQuantity(items, "b", 5);
    expect(items.map((i) => i.quantity)).toEqual([1, 5]);
    items = setLineQuantity(items, "a", 0);
    expect(items.map((i) => i.lineId)).toEqual(["b"]);
    items = removeLine(items, "b");
    expect(items).toEqual([]);
  });

  it("caps quantities at 999", () => {
    const items = setLineQuantity(addLine([], pops("Chocolate"), 1, "a"), "a", 5000);
    expect(items[0].quantity).toBe(999);
  });
});

describe("saved cart", () => {
  it("restores valid lines and drops malformed ones", () => {
    const good = addLine([], pops("Chocolate"), 2, "a")[0];
    const raw = JSON.stringify([good, { lineId: "x", productSlug: "cakepops" }, { ...good, lineId: "y", quantity: -1 }, "junk", null]);
    expect(parseStoredCart(raw)).toEqual([good]);
  });

  it("returns an empty cart for corrupt or foreign data", () => {
    expect(parseStoredCart("{not json")).toEqual([]);
    expect(parseStoredCart('{"items":[]}')).toEqual([]);
    expect(parseStoredCart(null)).toEqual([]);
  });

  it("drops photos whose data could not be saved and counts them for the customer", () => {
    const withPhoto = addLine([], pops("Chocolate", { inspirationImages: [{ name: "a.png", type: "image/png", size: 3, dataUrl: "data:image/png;base64,AAAA" }] }), 1, "a");
    const light = withoutPhotoData(withPhoto);
    expect(light[0].inspirationImages?.[0].dataUrl).toBe("");
    const restored = parseStoredCart(JSON.stringify(light));
    expect(restored[0].inspirationImages).toBeUndefined();
    expect(restored[0].droppedImageCount).toBe(1);
  });
});
