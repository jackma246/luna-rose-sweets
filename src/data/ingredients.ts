/**
 * Ingredient transparency pages — the destination for the QR stickers that go
 * on packaging. One entry per product form; the sticker links to
 * https://dipsprinkle.com/ingredients/<slug>.
 */

export interface IngredientSection {
  heading: string;
  body: string;
}

export interface IngredientPage {
  slug: string;
  /** Product in src/data/products.ts to link back to, if any. */
  productSlug?: string;
  name: string;
  /** Breadcrumb trail shown above the title; last item is the current page. */
  breadcrumb: string[];
  kicker: string;
  lead: string;
  image: string;
  imageAlt: string;
  sections: IngredientSection[];
  /** Major allergens present, in FDA labelling order where it applies. */
  contains: string[];
}

/** Cottage food operation disclosure required on every ingredient page. */
export const COTTAGE_FOOD_NOTICE = {
  heading: "Cottage food notice",
  body: "Made in a home kitchen. Made in a cottage food operation that is not subject to routine government food safety inspections.",
  permitNumber: "PTO506991",
  county: "Santa Clara",
} as const;

export const ingredientPages: IngredientPage[] = [
  {
    slug: "cake-pop",
    productSlug: "cakepops",
    name: "Vanilla Birthday Cake Pop",
    breadcrumb: ["Menu", "Cake Pops", "Vanilla Birthday"],
    kicker: "Full transparency",
    lead: "Vanilla cake mixed with buttercream, dipped in chocolate coating and finished with marshmallow fondant, edible glitter and sugar sprinkles.",
    image: "/images/cake-pops/new.jpeg",
    imageAlt: "A hand-dipped vanilla birthday cake pop finished with sprinkles",
    sections: [
      {
        heading: "Product ingredients",
        body: "Wheat flour (hard red wheat flour, malted barley flour), sugar, eggs, unsalted butter (cream), A2 milk, powdered sugar (sugar, cornstarch), chocolate coating (sugar, palm kernel oil, hydrogenated palm kernel oil, cottonseed oil, nonfat dry milk, cocoa, milk, soy lecithin, salt), marshmallow fondant (marshmallows (sugar, corn syrup, gelatin, water), powdered sugar (sugar, cornstarch)), baking powder (sodium bicarbonate, monocalcium phosphate, cornstarch), kosher salt, vanilla extract (water, cane alcohol, cane sugar, Madagascar vanilla bean extractives, Mexican vanilla bean extractives), vanilla beans, edible glitter (sugar, gum arabic, color additives), sugar sprinkles (sugar, cornstarch, vegetable oil, FD&C colors, confectioner's glaze), color (soybean oil, FD&C color).",
      },
    ],
    contains: ["milk", "wheat", "eggs", "soy", "gelatin"],
  },
];

export function getIngredientPageBySlug(slug: string): IngredientPage | undefined {
  return ingredientPages.find((p) => p.slug === slug);
}
