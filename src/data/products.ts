export interface ProductVariant {
  label: string;
  price: number;
  image?: string;
}

export interface ProductAddon {
  label: string;
  price: string;
}

export interface ProductFlavour {
  name: string;
  description: string;
}

export interface TreatOption {
  name: string;
  exclusiveWith?: string[];
  maxCount?: number;
}

export interface DesignTier {
  name: string;
  description: string;
  priceLabel: string;
  priceAdd: number;
  popular?: boolean;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  subtitle?: string;
  description: string;
  details?: string;
  variants: ProductVariant[];
  addons?: ProductAddon[];
  flavours?: ProductFlavour[];
  fixedFlavour?: string;
  flavourAddonPrice?: number;
  treats?: TreatOption[];
  maxTreats?: number;
  designTiers?: DesignTier[];
  enquireOnly?: boolean;
  badge?: string;
  image?: string;
  images?: string[];
  hidden?: boolean;
}

export const CAKE_FLAVOURS: ProductFlavour[] = [
  {
    name: "Classic Vanilla",
    description: "Made with real vanilla beans — we blend our own ratio of the finest Madagascar and Mexican vanilla for a clean, true vanilla flavour.",
  },
  {
    name: "Funfetti",
    description: "Extra butter flavour, incredibly moist, and just a touch sweeter.",
  },
  {
    name: "Chocolate",
    description: "Contains premium Belgian dark chocolate with 30%+ cocoa butter, a hint of espresso to deepen the flavour, and a sprinkle of Maldon sea salt to finish.",
  },
  {
    name: "Strawberry",
    description: "Made with 100% freeze-dried strawberry powder — never artificial flavouring. Inspired by strawberry milk, with extra toasted milk powder for an authentic, non-artificial taste.",
  },
  {
    name: "Coffee",
    description: "Made with freshly brewed espresso.",
  },
  {
    name: "Lemon",
    description: "Contains fresh lemon juice and lemon zest for a perfectly balanced sweet-and-sour flavour that tastes completely natural.",
  },
];

export const products: Product[] = [
  // ── Party Sets ──────────────────────────────────────────
  {
    slug: "party-set",
    name: "Party Set",
    category: "Party Sets",
    subtitle: "36 · 48 · 96 pieces",
    description: "Each set includes a coordinated selection of chocolate-covered treats with a polished, party-ready finish.",
    details: "Choose your set size, treat types, design finish, and flavor. Handcrafted in small batches with premium Belgian chocolate. Please allow 3–7 days notice.",
    variants: [
      { label: "Small Set (36 pcs)", price: 135, image: "/images/treat-boxes/mixed-treats.jpg" },
      { label: "Medium Set (48 pcs)", price: 185, image: "/images/brand-spread-new.png" },
      { label: "Large Set (96 pcs)", price: 310, image: "/images/treat-boxes/mixed-treats.jpg" },
    ],
    image: "/images/brand-spread-new.png",
  },
  {
    slug: "party-layer-cake",
    name: "3-Layer Custom Cake (6\"/8\")",
    category: "Party Sets",
    subtitle: "100% Real Buttercream · 6 Flavours",
    description:
      "A stunning 3-layer custom cake made from scratch with 100% real swiss meringue buttercream. Available in 6\" and 8\" sizes, fully customisable to your theme and colour palette.",
    details:
      "Choose from 6 flavours. 6\" serves approx. 6-8 people, 8\" serves approx. 10-14 people. Please allow at least 5 days notice.",
    variants: [
      { label: "Basic Design 6\" (6–8 servings)", price: 85, image: "/images/cake/cake00.jpeg" },
      { label: "Basic Design 8\" (10–14 servings)", price: 125, image: "/images/cake/cake00.jpeg" },
    ],
    addons: [
      { label: "Extra Cream Decoration", price: "+$10–$25" },
      { label: "Color Customization", price: "+$10" },
      { label: "Lettering", price: "+$5–$10" },
    ],
    flavours: CAKE_FLAVOURS,
    badge: "Baked from scratch",
    image: "/images/cake/cake00.jpeg",
    images: [
      "/images/cake/cake00.jpeg",
      "/images/cake/cake0.jpeg",
      "/images/cake/cake2.jpeg",
      "/images/cake/cake1.jpeg",
      "/images/cake/cake3.jpeg",
      "/images/cake/narae1.jpeg",
      "/images/cake/narae2.jpeg",
      "/images/cake/narae3.jpeg",
    ],
  },
  {
    slug: "party-two-tier-cake",
    name: "Two-Tier Cake (8\"/6\")",
    category: "Party Sets",
    subtitle: "6 Flavours",
    description:
      "A show-stopping two-tier cake featuring an 8 inch base and 6 inch top tier. The perfect centrepiece for weddings, milestone birthdays, and special events.",
    details:
      "Choose from 6 flavours — mix and match per tier. Serves approximately 20-25 people. Please allow at least 1 week notice. For custom designs, please share your design ideas and we will be in touch.",
    variants: [{ label: "Two-Tier Cake (8\"/6\")", price: 200, image: "/images/cake/two-tier-new.jpeg" }],
    flavours: CAKE_FLAVOURS,
    designTiers: [
      { name: "Classic", description: "Simple finish · 2 colors · minimal decoration", priceLabel: "Included", priceAdd: 0 },
      { name: "Enhanced", description: "Color mix · basic decor · simple lettering", priceLabel: "+$30", priceAdd: 30, popular: true },
      { name: "Full Custom", description: "Full custom design · edible image · elaborate decoration", priceLabel: "+$60", priceAdd: 60 },
    ],
    badge: "Baked from scratch",
    image: "/images/cake/two-tier-new.jpeg",
  },
  {
    slug: "party-tray-bakes",
    name: "Tray Cake",
    category: "Party Sets",
    subtitle: "100% Real Buttercream · 2 Sizes · 6 Flavours",
    description:
      "Made with 100% real European buttercream, our Tray Cakes are the perfect party dessert. Easy to serve, beautifully presented, and fully customisable in design, colour, and flavour.",
    details:
      "Made with 100% real European buttercream — rich, smooth, and never artificial. Choose from 6 flavours. Perfect for parties and events. Easy to slice and serve. Custom designs and colour palettes available. Best consumed within 5 days of collection.",
    variants: [
      { label: "Medium — 15×11\" (20–30 servings)", price: 85, image: "/images/tray-bakes/tray.png" },
      { label: "Large — 17×12\" deep (30–45 servings)", price: 125, image: "/images/tray-bakes/tray.png" },
    ],
    addons: [
      { label: "Extra Buttercream Decoration", price: "+$10–$25" },
      { label: "Lettering", price: "+$10" },
      { label: "Color Customization", price: "+$10" },
    ],
    flavours: CAKE_FLAVOURS,
    badge: "Baked from scratch",
    image: "/images/tray-bakes/tray.png",
  },
  {
    slug: "party-favour-flower-cupcake",
    name: "Flower & Cupcake (1 Dozen)",
    category: "Party Sets",
    description:
      "A charming individual favour featuring a mini cupcake paired with a small flower. Beautifully presented and perfect for wedding favours and events.",
    details:
      "Each favour is individually packaged. Cupcake flavours and flower colours can be matched to your theme. Minimum order of 10.",
    variants: [{ label: "Per Favour (min 10)", price: 6, image: "/images/cupcakes/7.jpg" }],
    image: "/images/cupcakes/7.jpg",
    hidden: true,
  },
  {
    slug: "party-drink-snack-set",
    name: "Party Drink & Snack Set",
    category: "Party Sets",
    description:
      "A beautifully filled treat bag with an assortment of mini sweet treats. Perfect as party bags, wedding favours, or thank-you gifts.",
    details:
      "Each treat bag includes a curated mix of mini treats. Contents and packaging can be customised to your theme. Minimum order of 10.",
    variants: [{ label: "Per Treat Bag (min 10)", price: 5, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/brand-spread-new.png",
    hidden: true,
  },
  {
    slug: "party-diy-decorating-set",
    name: "DIY Decorating Set",
    category: "Party Sets",
    description:
      "A child-friendly DIY kit where kids get to be creative and decorate their own cakesicles and treats. A fun activity and delicious treat in one!",
    details:
      "Kits contain: Instructional Steps, 5 Dipped Milk Chocolate Strawberries, 4 Dipped White Chocolate Cakesicles (Vanilla & Chocolate Fudge), decorating supplies and sprinkles.",
    variants: [{ label: "DIY Decorating Set", price: 31, image: "/images/brand-spread-new.png" }],
    image: "/images/brand-spread-new.png",
    hidden: true,
  },

  // ── Gift (was Specialty) ────────────────────────────────
  {
    slug: "cakepop-bouquet",
    name: "Cakepop Bouquet",
    category: "Gift",
    subtitle: "8 Cake Pops",
    description:
      "A stunning bouquet of 8 decorated cake pops — a unique and delicious alternative to flowers! Perfect for birthdays, Mother's Day, or just because.",
    details:
      "Each bouquet is hand-arranged with 8 freshly baked cake pops dipped in premium Belgian chocolate. Bouquets can be themed and personalised with colours, toppings, and edible toppers.",
    fixedFlavour: "Classic Vanilla — we use our own custom blend of premium Madagascar and Mexican vanilla, with real vanilla beans included. The result is a clean, true vanilla flavour that is rich, warm, and anything but ordinary.",
    variants: [
      { label: "Bouquet (8 pops)", price: 35, image: "/images/popsicle-bouquet/1.jpg" },
    ],
    badge: "Baked from scratch",
    image: "/images/popsicle-bouquet/1.jpg",
  },
  {
    slug: "heart-surprise-box",
    name: "2-tier Heart Surprise Box",
    category: "Gift",
    description:
      "A beautiful two-tier chocolate heart box filled with a surprise selection of our handcrafted treats. Smash through the heart to reveal the goodies inside!",
    details:
      "The Heart Surprise Box can be themed and personalised to your requirements. Contents can include cakesicles, chocolates, strawberries, and more. Perfect for Valentine's Day, anniversaries, and special occasions.",
    variants: [{ label: "2-tier Heart Surprise Box", price: 45, image: "/images/heart-box/1.jpeg" }],
    badge: "Baked from scratch",
    image: "/images/heart-box/1.jpeg",
    images: [
      "/images/heart-box/1.jpeg",
      "/images/heart-box/4.jpeg",
      "/images/heart-box/2.jpeg",
      "/images/heart-box/3.jpeg",
    ],
  },
  {
    slug: "flower-treat-box",
    name: "Cakepop & Rose Bouquet",
    category: "Gift",
    subtitle: "1 Dozen Cake Pops",
    description:
      "A gorgeous combination of fresh roses and our handcrafted cake pops, beautifully arranged as a luxury bouquet. The perfect gift that looks and tastes amazing.",
    details:
      "The Cakepop & Rose Bouquet includes a selection of seasonal roses alongside our signature cake pops. Can be personalised with a message card. Please allow 3-5 days notice.",
    variants: [{ label: "Cakepop & Rose Bouquet", price: 50, image: "/images/rose-bouquet/1.jpeg" }],
    badge: "Baked from scratch",
    image: "/images/rose-bouquet/1.jpeg",
    images: [
      "/images/rose-bouquet/1.jpeg",
      "/images/rose-bouquet/2.jpeg",
      "/images/rose-bouquet/3.jpeg",
      "/images/rose-bouquet/4.jpeg",
    ],
  },
  {
    slug: "gift-cakepops-flower-box",
    name: "Cakepops & Flower Box",
    category: "Gift",
    subtitle: "1/2 Dozen Cake Pops",
    description:
      "A delightful gift box combining our beautifully decorated cake pops with fresh flowers. A unique treat that's as stunning to look at as it is to eat.",
    details:
      "Each box is hand-arranged with freshly baked cake pops and seasonal flowers. Can be themed and personalised with colours and a message card. Please allow 3-5 days notice.",
    variants: [],
    enquireOnly: true,
    badge: "Baked from scratch",
    image: "/images/gift-box/2.png",
    images: [
      "/images/gift-box/2.png",
      "/images/gift-box/1.jpeg",
      "/images/gift-box/3.jpeg",
    ],
  },
  {
    slug: "gift-cupcakes",
    name: "Cupcakes (1 Dozen)",
    category: "Gift",
    subtitle: "6 Flavours",
    description:
      "Scratch-made cupcakes finished with buttercream and decorative details, designed for celebrations, dessert tables, gifting, and themed events.",
    details:
      "Choose from 6 flavours. Base price includes up to 2 colors with a simple buttercream finish and minimal decorative accents. Semi Custom (3-4 colors, themed color palettes, textured piping, floral-inspired styling) available for +$6–$10/dozen. Full Custom (hand-piped floral work, detailed buttercream textures, mixed decorative styles) available for +$12–$24/dozen. Baked fresh to order. Best consumed within 3 days.",
    variants: [
      { label: "1 Dozen (12 pcs)", price: 48, image: "/images/cupcakes/2.jpg" },
    ],
    addons: [
      { label: "Semi Custom Design (3-4 colors, textured piping, floral-inspired styling)", price: "+$6–$10/dozen" },
      { label: "Full Custom Design (hand-piped florals, detailed buttercream, mixed designs)", price: "+$12–$24/dozen" },
    ],
    flavours: CAKE_FLAVOURS,
    image: "/images/cupcakes/2.jpg",
    hidden: true,
  },
  {
    slug: "luxury-chocolate-dates",
    name: "Luxury Chocolate Dates",
    category: "Gift",
    description:
      "Our Dates are covered in luxury chocolate and can be topped with a variety of toppings.",
    details:
      "Toppings: Almond, Coconut, Pistachios, Edible Roses, Crushed Chocolate sandwich cookies (Oreos®️)/lotus and many more! We also offer chocolate FILLED dates. Fillings include: Lotus, Peanut Butter, Nutella, Pistachio Spread, Milk Chocolate, and many more!",
    variants: [],
    enquireOnly: true,
    image: "/images/luxury-dates/1.jpg",
  },

  // ── Treats (was Cakesicles) ─────────────────────────────
  {
    slug: "cakesicles",
    name: "Cakesicles",
    category: "Chocolate Dipped Treats",
    subtitle: "6 Flavours",
    description:
      "Our cakesicles combine a smooth chocolate shell with a soft cake interior, creating a rich and satisfying bite.\n\nDesigned with clean finishes and elegant details, they serve as a standout centerpiece on any dessert table.\n\nPerfect for adding a premium touch to your event.",
    details:
      "Slightly more detailed than cake pops — designs may vary based on mold shape. Best consumed within 2 weeks.",
    variants: [
      { label: "1 Dozen", price: 48, image: "/images/cakesicles/1.jpg" },
      { label: "2 Dozen", price: 92, image: "/images/cakesicles/1.jpg" },
      { label: "3 Dozen", price: 135, image: "/images/cakesicles/1.jpg" },
    ],
    addons: [
      { label: "3rd Color", price: "+$5" },
    ],
    flavours: CAKE_FLAVOURS,
    flavourAddonPrice: 12,
    designTiers: [
      { name: "Classic", description: "Simple coating, drizzle, and light accents · 2 colors included", priceLabel: "Included", priceAdd: 0 },
      { name: "Enhanced", description: "Layered drizzle, coordinated colors, premium sprinkles", priceLabel: "+$15", priceAdd: 15, popular: true },
      { name: "Signature Custom", description: "Detailed themes and elevated finishes", priceLabel: "+$30+", priceAdd: 30 },
    ],
    badge: "Baked from scratch",
    image: "/images/cakesicles/5.png",
  },
  {
    slug: "cakepops",
    name: "Cake Pops",
    category: "Chocolate Dipped Treats",
    subtitle: "6 Flavours",
    description:
      "Our cake pops are made from scratch using our signature vanilla cake base, creating a soft and rich interior with a smooth chocolate coating.\n\nEach piece is carefully hand-dipped and decorated to match your selected color palette, making them perfect for dessert tables, parties, and special events.\n\nA classic and versatile option that pairs beautifully with any theme.",
    details:
      "Designs are semi-custom. Custom characters and logos require a Signature Custom upgrade. Flavor splits are evenly divided. Pairs perfectly with cakesicles and pretzels for a full dessert table.",
    variants: [
      { label: "1 Dozen (12 pcs)", price: 36, image: "/images/cake-pops/new.jpeg" },
      { label: "2 Dozen (24 pcs)", price: 68, image: "/images/cake-pops/new.jpeg" },
      { label: "3 Dozen (36 pcs)", price: 100, image: "/images/cake-pops/new.jpeg" },
    ],
    addons: [
      { label: "3rd Color", price: "+$5" },
      { label: "4+ Colors", price: "Signature Custom required" },
    ],
    flavours: CAKE_FLAVOURS,
    flavourAddonPrice: 12,
    designTiers: [
      { name: "Classic", description: "Simple coating, drizzle, and light accents · 2 colors included", priceLabel: "Included", priceAdd: 0 },
      { name: "Enhanced", description: "Layered drizzle, coordinated colors, premium sprinkles", priceLabel: "+$12", priceAdd: 12, popular: true },
      { name: "Signature Custom", description: "Detailed themes and elevated finishes", priceLabel: "+$24+", priceAdd: 24 },
    ],
    badge: "Baked from scratch",
    image: "/images/cake-pops/new.jpeg",
  },
  {
    slug: "madeleines",
    name: "Madeleines (1 Dozen)",
    category: "Chocolate Dipped Treats",
    subtitle: "6 Flavours",
    description:
      "Scratch-made madeleines dipped in chocolate for a delicate, buttery, and elegant treat. Beautiful for dessert boxes, tea-style spreads, gifting, and special occasions.",
    details:
      "Choose from 6 flavours. Base price includes a partial chocolate dip with simple drizzle or finishing details. Semi Custom (expanded color palette, marbling, soft themed styling, decorative finishing upgrades) available for +$4–$6/dozen. Full Custom (refined decorative work, mixed design styles, premium presentation styling) available for +$8–$12/dozen. Best consumed within 5 days.",
    variants: [
      { label: "1 Dozen (Base Design)", price: 34, image: "/images/madeleines/new2.png" },
    ],
    addons: [
      { label: "Semi Custom Design (expanded palette, marbling, themed styling)", price: "+$4–$6/dozen" },
      { label: "Full Custom Design (refined decorative work, mixed designs)", price: "+$8–$12/dozen" },
    ],
    flavours: CAKE_FLAVOURS,
    badge: "Baked from scratch",
    image: "/images/madeleines/new2.png",
  },
  {
    slug: "choc-covered-oreos",
    name: "Chocolate Covered Chocolate Sandwich Cookies (Oreos®️) (1 Dozen)",
    category: "Chocolate Dipped Treats",
    description:
      "Our chocolate covered Chocolate sandwich cookies (Oreos®️) combine a familiar favorite with a refined look.\n\nEach cookie is coated and decorated to match your event style, making them a perfect addition to any dessert table.",
    details:
      "Pairs well with cake pops and pretzels for a balanced mix. Photos are for style reference only — slight variation in colour and decorative placement is normal and part of the handmade process.",
    variants: [
      { label: "1 Dozen", price: 30, image: "/images/choco-cookies/1.jpg" },
    ],
    designTiers: [
      { name: "Classic", description: "Simple chocolate coating with clean drizzle and finishing details", priceLabel: "Included", priceAdd: 0 },
      { name: "Enhanced", description: "Layered drizzle, coordinated colors, premium decorative accents", priceLabel: "+$10", priceAdd: 10, popular: true },
    ],
    image: "/images/choco-cookies/1.jpg",
  },
  {
    slug: "choc-dipped-caramel-pretzel-rods",
    name: "Chocolate Covered Pretzel Rods",
    category: "Chocolate Dipped Treats",
    description:
      "Our chocolate covered pretzel rods offer the perfect balance of sweet and salty.\n\nEach rod is dipped in chocolate and finished with a clean drizzle and decorative accents.\n\nCaramel option adds an extra layer of richness, making them a customer favorite.",
    details:
      "Ideal for adding height and dimension to dessert tables. Caramel version is softer and richer. Adds variety and texture when paired with cake-based treats.",
    variants: [
      { label: "Classic Pretzel Rods (1 Dozen)", price: 36, image: "/images/caramel-pretzel/rods.jpeg" },
      { label: "Caramel Pretzel Rods (1 Dozen)", price: 42, image: "/images/caramel-pretzel/rods.jpeg" },
    ],
    designTiers: [
      { name: "Classic", description: "Simple chocolate coating with clean drizzle and decorative accents", priceLabel: "Included", priceAdd: 0 },
      { name: "Enhanced", description: "Layered drizzle, coordinated colors, premium decorative finish", priceLabel: "+$10", priceAdd: 10, popular: true },
    ],
    image: "/images/caramel-pretzel/rods.jpeg",
  },
  {
    slug: "choc-dipped-rice-krispies",
    name: "Rice Krispies Treats (1 Dozen)",
    category: "Chocolate Dipped Treats",
    description:
      "These chocolate covered Rice Krispies treats are soft, chewy, and lightly crispy.\n\nFinished with a smooth coating and simple decorative accents, they add a fun texture to your dessert selection.",
    details:
      "Adds variety in texture to dessert sets.",
    variants: [
      { label: "1 Dozen", price: 30, image: "/images/rice-krispies/rice.jpeg" },
    ],
    designTiers: [
      { name: "Classic", description: "Simple chocolate coating with clean drizzle and decorative accents", priceLabel: "Included", priceAdd: 0 },
      { name: "Enhanced", description: "Layered drizzle, coordinated colors, premium sprinkles", priceLabel: "+$10", priceAdd: 10 },
    ],
    image: "/images/rice-krispies/rice.jpeg",
  },
  {
    slug: "choc-dipped-pretzel-original",
    name: "Twisted Pretzels (1 Dozen)",
    category: "Chocolate Dipped Treats",
    description:
      "These chocolate covered twisted pretzels are a simple yet satisfying addition to any dessert spread.\n\nLight, crunchy, and easy to eat, they bring balance to richer treats.",
    details:
      "Great filler item for party trays and dessert tables. Best consumed within 2 weeks.",
    variants: [{ label: "1 Dozen", price: 35, image: "/images/twisted-pretzel/twis.jpeg" }],
    designTiers: [
      { name: "Classic", description: "Simple chocolate coating with light drizzle and decorative accents", priceLabel: "Included", priceAdd: 0 },
      { name: "Enhanced", description: "Layered drizzle, coordinated colors, premium sprinkles", priceLabel: "+$8", priceAdd: 8 },
    ],
    image: "/images/twisted-pretzel/twis.jpeg",
  },
  // ── Bakes ───────────────────────────────────────────────
  {
    slug: "muffins",
    name: "Bakery-Style Tall Muffins (1 Dozen)",
    category: "Bakes",
    subtitle: "Blueberry · Chocolate Chip · Banana",
    description:
      "Bakery-style tall muffins baked from scratch with a generous crumb topping. Available in Blueberry, Chocolate Chip, and Banana. Soft, moist, and perfectly domed.",
    details:
      "Crumb topping included. Available in Blueberry, Chocolate Chip, and Banana. Baked fresh to order. Best consumed within 3 days. Optional: Chocolate Hazelnut (Nutella®) filling for an extra indulgent treat.",
    variants: [
      { label: "Blueberry (1 Dozen)", price: 45, image: "/images/muffins/1.jpg" },
      { label: "Chocolate Chip (1 Dozen)", price: 45, image: "/images/muffins/1.jpg" },
      { label: "Banana (1 Dozen)", price: 45, image: "/images/muffins/1.jpg" },
      { label: "Chocolate Hazelnut (Nutella®) Filling (1 Dozen)", price: 50, image: "/images/muffins/1.jpg" },
    ],
    image: "/images/muffins/1.jpg",
    hidden: true,
  },
  {
    slug: "bakes-cupcakes",
    name: "Cupcakes (1/2 Dozen)",
    category: "Bakes",
    subtitle: "6 Flavours",
    description:
      "Scratch-made cupcakes finished with buttercream and decorative details, designed for celebrations, dessert tables, gifting, and themed events.",
    details:
      "Choose from 6 flavours. Base price includes up to 2 colors with a simple buttercream finish and minimal decorative accents. Semi Custom (3-4 colors, themed color palettes, textured piping, floral-inspired styling) available for +$6–$10/dozen. Full Custom (hand-piped floral work, detailed buttercream textures, mixed decorative styles) available for +$12–$24/dozen. Baked fresh to order. Best consumed within 3 days.",
    variants: [
      { label: "1/2 Dozen (6 pcs)", price: 28, image: "/images/cupcakes/2.jpg" },
      { label: "1 Dozen (12 pcs)", price: 48, image: "/images/cupcakes/2.jpg" },
    ],
    addons: [
      { label: "Semi Custom Design (3-4 colors, textured piping, floral-inspired styling)", price: "+$6–$10/dozen" },
      { label: "Full Custom Design (hand-piped florals, detailed buttercream, mixed designs)", price: "+$12–$24/dozen" },
    ],
    flavours: CAKE_FLAVOURS,
    image: "/images/cupcakes/2.jpg",
    hidden: true,
  },
  {
    slug: "tray-bakes",
    name: "Tray Cake",
    category: "Bakes",
    subtitle: "100% Real Buttercream · 2 Sizes · 6 Flavours",
    description:
      "Made with 100% real European buttercream, our Tray Cakes are the perfect party dessert. Easy to serve, beautifully presented, and fully customisable in design, colour, and flavour.",
    details:
      "Made with 100% real European buttercream — rich, smooth, and never artificial. Choose from 6 flavours. Perfect for parties and events. Easy to slice and serve. Custom designs and colour palettes available. Best consumed within 5 days of collection.",
    variants: [
      { label: "Medium — 15×11\" (20–30 servings)", price: 85, image: "/images/tray-bakes/tray.png" },
      { label: "Large — 17×12\" deep (30–45 servings)", price: 125, image: "/images/tray-bakes/tray.png" },
    ],
    addons: [
      { label: "Extra Buttercream Decoration", price: "+$10–$25" },
      { label: "Lettering", price: "+$10" },
      { label: "Color Customization", price: "+$10" },
    ],
    flavours: CAKE_FLAVOURS,
    image: "/images/tray-bakes/tray.png",
    hidden: true,
  },
  {
    slug: "bakes-layer-cake",
    name: "3-Layer Custom Cake (6\"/8\")",
    category: "Bakes",
    subtitle: "100% Real Buttercream · 6 Flavours",
    description:
      "A stunning 3-layer custom cake made from scratch with 100% real swiss meringue buttercream. Available in 6\" and 8\" sizes, fully customisable to your theme and colour palette.",
    details:
      "Choose from 6 flavours. 6\" serves approx. 6-8 people, 8\" serves approx. 10-14 people. Please allow at least 5 days notice.",
    variants: [
      { label: "Basic Design 6\" (6–8 servings)", price: 85, image: "/images/cake/7.jpg" },
      { label: "Basic Design 8\" (10–14 servings)", price: 125, image: "/images/cake/8.jpg" },
    ],
    addons: [
      { label: "Extra Cream Decoration", price: "+$10–$25" },
      { label: "Color Customization", price: "+$10" },
      { label: "Lettering", price: "+$5–$10" },
    ],
    flavours: CAKE_FLAVOURS,
    image: "/images/cake/7.jpg",
    hidden: true,
  },
  {
    slug: "bakes-two-tier-cake",
    name: "Two-Tier Cake (8\"/6\")",
    category: "Bakes",
    subtitle: "6 Flavours",
    description:
      "A show-stopping two-tier cake featuring an 8 inch base and 6 inch top tier. The perfect centrepiece for weddings, milestone birthdays, and special events.",
    details:
      "Choose from 6 flavours — mix and match per tier. Serves approximately 20-25 people. Please allow at least 1 week notice. For custom designs, please share your design ideas and we will be in touch.",
    variants: [{ label: "Two-Tier Cake (8\"/6\")", price: 260, image: "/images/cake/two-tier-new.jpeg" }],
    addons: [
      { label: "Floral Decoration", price: "Additional cost" },
      { label: "Custom Design Details", price: "Additional cost" },
    ],
    flavours: CAKE_FLAVOURS,
    image: "/images/cake/two-tier-new.jpeg",
    hidden: true,
  },
  {
    slug: "bakes-madeleines",
    name: "Madeleines (1 Dozen)",
    category: "Bakes",
    subtitle: "6 Flavours",
    description:
      "Scratch-made madeleines dipped in chocolate for a delicate, buttery, and elegant treat. Beautiful for dessert boxes, tea-style spreads, gifting, and special occasions.",
    details:
      "Choose from 6 flavours. Base price includes a partial chocolate dip with simple drizzle or finishing details. Semi Custom (expanded color palette, marbling, soft themed styling, decorative finishing upgrades) available for +$4–$6/dozen. Full Custom (refined decorative work, mixed design styles, premium presentation styling) available for +$8–$12/dozen. Best consumed within 5 days.",
    variants: [
      { label: "1 Dozen (Base Design)", price: 34, image: "/images/madeleines/new2.png" },
    ],
    addons: [
      { label: "Semi Custom Design (expanded palette, marbling, themed styling)", price: "+$4–$6/dozen" },
      { label: "Full Custom Design (refined decorative work, mixed designs)", price: "+$8–$12/dozen" },
    ],
    flavours: CAKE_FLAVOURS,
    image: "/images/madeleines/new2.png",
    hidden: true,
  },
  {
    slug: "bakes-butter-cookies",
    name: "Butter Cookies (1 Dozen)",
    category: "Bakes",
    description:
      "Traditional butter cookies baked from scratch with real butter. Melt-in-your-mouth delicious and perfect with a cup of tea.",
    details:
      "Made with premium butter and vanilla. Available plain, dipped, or decorated. Can be customised with shapes and colours. Best consumed within 1 week.",
    variants: [
      { label: "1 Dozen", price: 24, image: "/images/butter-cookies/4.jpg" },
    ],
    image: "/images/butter-cookies/4.jpg",
    hidden: true,
  },
  {
    slug: "bakes-cookie-box",
    name: "Cookie Box",
    category: "Bakes",
    description:
      "A freshly baked assortment of our signature cookies — butter cookies, loaded cookies, and more. Baked from scratch and ready to enjoy.",
    details:
      "Each box includes a variety of cookie styles and flavours. Perfect for sharing at events or as a gift. Best consumed within 1 week.",
    variants: [{ label: "Cookie Box (12 assorted)", price: 30, image: "/images/cookie-box/2.jpg" }],
    image: "/images/cookie-box/2.jpg",
    hidden: true,
  },
  {
    slug: "bakes-cakesicles",
    name: "Cakesicles (1 Dozen)",
    category: "Bakes",
    subtitle: "6 Flavours",
    description:
      "Scratch-made cakesicles with a smooth chocolate shell and elegant decorative details. Perfect for dessert tables, gift boxes, party favors, and themed events.",
    details:
      "Choose from 6 flavours. Base price includes up to 2 colors with simple drizzle or sprinkles. Semi Custom (3-4 colors, marbling, two-tone finishes, simple themed styling) available for +$6–$10/dozen. Full Custom (names, initials, logo-inspired details, hand-piped details, multiple mixed designs) available for +$12–$20/dozen. Best consumed within 2 weeks.",
    variants: [{ label: "1 Dozen (Base Design)", price: 54, image: "/images/cakesicles/1.jpg" }],
    addons: [
      { label: "Semi Custom Design (3-4 colors, marbling, themed styling)", price: "+$6–$10/dozen" },
      { label: "Full Custom Design (names, initials, logos, mixed designs)", price: "+$12–$20/dozen" },
    ],
    flavours: CAKE_FLAVOURS,
    image: "/images/cakesicles/5.png",
    hidden: true,
  },
  {
    slug: "bakes-cake-pops",
    name: "Cake Pops (1 Dozen)",
    category: "Bakes",
    subtitle: "6 Flavours",
    description:
      "Scratch-made cake pops with a smooth chocolate coating and elegant hand-finished details. Perfect for dessert tables, gift boxes, party favors, and special events.",
    details:
      "Choose from 6 flavours. Base price includes up to 2 colors with simple drizzle or sprinkles. Semi Custom (3-4 colors, marbling, two-tone finishes, simple themed styling) available for +$5–$8/dozen. Full Custom (names, initials, logo-inspired work, multiple design styles, detailed decorative finishing) available for +$10–$18/dozen.",
    variants: [{ label: "1 Dozen (Base Design)", price: 42, image: "/images/cake-pops/new.jpeg" }],
    addons: [
      { label: "Semi Custom Design (3-4 colors, marbling, themed styling)", price: "+$5–$8/dozen" },
      { label: "Full Custom Design (names, initials, logos, mixed designs)", price: "+$10–$18/dozen" },
    ],
    flavours: CAKE_FLAVOURS,
    image: "/images/cake-pops/new.jpeg",
    hidden: true,
  },

  // ── Favours ─────────────────────────────────────────────
  {
    slug: "favour-flower-cupcake",
    name: "Flower & Cupcake (1 Dozen)",
    category: "Favours",
    description:
      "A charming individual favour featuring a mini cupcake paired with a small flower. Beautifully presented and perfect for wedding favours and events.",
    details:
      "Each favour is individually packaged. Cupcake flavours and flower colours can be matched to your theme. Minimum order of 10.",
    variants: [{ label: "Per Favour (min 10)", price: 6, image: "/images/cupcakes/7.jpg" }],
    image: "/images/cupcakes/7.jpg",
    hidden: true,
  },
  {
    slug: "treat-bag",
    name: "Party Drink & Snack Set",
    category: "Favours",
    description:
      "A beautifully filled treat bag with an assortment of mini sweet treats. Perfect as party bags, wedding favours, or thank-you gifts.",
    details:
      "Each treat bag includes a curated mix of mini treats. Contents and packaging can be customised to your theme. Minimum order of 10.",
    variants: [{ label: "Per Treat Bag (min 10)", price: 5, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/brand-spread-new.png",
    hidden: true,
  },
  {
    slug: "favour-diy-decorating-set",
    name: "DIY Decorating Set",
    category: "Favours",
    description:
      "A child-friendly DIY kit where kids get to be creative and decorate their own cakesicles and treats. A fun activity and delicious treat in one!",
    details:
      "Kits contain: Instructional Steps, 5 Dipped Milk Chocolate Strawberries, 4 Dipped White Chocolate Cakesicles (Vanilla & Chocolate Fudge), decorating supplies and sprinkles.",
    variants: [{ label: "DIY Decorating Set", price: 31, image: "/images/brand-spread-new.png" }],
    image: "/images/brand-spread-new.png",
    hidden: true,
  },
  {
    slug: "choc-treats-luxury-chocolate-dates",
    name: "Luxury Chocolate Dates (1 Dozen)",
    category: "Chocolate Dipped Treats",
    description:
      "Our Dates are covered in luxury chocolate and can be topped with a variety of toppings.",
    details:
      "Toppings: Almond, Coconut, Pistachios, Edible Roses, Crushed Chocolate sandwich cookies (Oreos®️)/lotus and many more! We also offer chocolate FILLED dates. Fillings include: Lotus, Peanut Butter, Nutella, Pistachio Spread, Milk Chocolate, and many more!",
    variants: [{ label: "1 Dozen", price: 36, image: "/images/luxury-dates/1.jpg" }],
    image: "/images/luxury-dates/1.jpg",
  },
  {
    slug: "choc-butter-cookies",
    name: "Butter Cookies (1 Dozen)",
    category: "Chocolate Dipped Treats",
    description:
      "Scratch-made butter cookies with a smooth chocolate dip and elegant finishing details. A simple but elevated treat for gifting, dessert boxes, and celebrations.",
    details:
      "Base price includes a half chocolate dipped finish with simple sprinkles or drizzle. Semi Custom (color variations, marbling, two-tone chocolate work, themed finishing touches) available for +$4–$6/dozen. Full Custom (detailed decorative styling, seasonal themes, mixed design sets, refined custom finishing) available for +$8–$12/dozen. Best consumed within 1 week.",
    variants: [
      { label: "1 Dozen", price: 24, image: "/images/butter-cookies/4.jpg" },
    ],
    addons: [
      { label: "Semi Custom Design (color variations, marbling, two-tone chocolate)", price: "+$4–$6/dozen" },
      { label: "Full Custom Design (detailed styling, seasonal themes, mixed designs)", price: "+$8–$12/dozen" },
    ],
    image: "/images/butter-cookies/4.jpg",
    hidden: true,
  },

  {
    slug: "jumbo-marshmallow",
    name: "Chocolate Covered Marshmallows (1 Dozen)",
    category: "Chocolate Dipped Treats",
    description:
      "Our chocolate covered marshmallows are soft, fluffy, and coated in smooth chocolate.\n\nA simple and fun addition that balances heavier desserts.",
    details:
      "Perfect as a lighter option alongside richer treats.",
    variants: [
      { label: "1 Dozen", price: 30, image: "/images/marshmallow.png" },
    ],
    designTiers: [
      { name: "Classic", description: "Simple chocolate coating with light drizzle and decorative accents", priceLabel: "Included", priceAdd: 0 },
      { name: "Enhanced", description: "Layered drizzle, coordinated colors, premium sprinkles", priceLabel: "+$8", priceAdd: 8 },
    ],
    image: "/images/marshmallow.png",
  },

  // ── Towers ──────────────────────────────────────────────
  {
    slug: "madeleine-tower",
    name: "Madeleine Tower",
    category: "Towers",
    description:
      "A stunning tower of 35 freshly baked madeleines dipped in premium chocolate. An eye-catching centrepiece for any dessert table or celebration.",
    details:
      "Each madeleine is hand-dipped and decorated. Tower height: 11.9 inches. The tower can be customised with colours and toppings to match your theme. Please allow 5 days notice.",
    variants: [{ label: "Madeleine Tower", price: 245, image: "/images/towers/mt.png" }],
    image: "/images/towers/mt.png",
  },
  {
    slug: "macaron-tower",
    name: "Macaron Tower",
    category: "Towers",
    description:
      "An elegant tower of 70 delicate macarons in your choice of colours and flavours. A showstopping addition to weddings, baby showers, and special events.",
    details:
      "Available in a variety of flavours including Vanilla, Pistachio, Raspberry, Chocolate, Salted Caramel, and more. Tower height: 11.9 inches. Towers can be colour-matched to your event. Please allow 5-7 days notice.",
    variants: [{ label: "Macaron Tower", price: 320, image: "/images/towers/mat.png" }],
    image: "/images/towers/mat.png",
  },
  {
    slug: "chocolate-tower",
    name: "Chocolate Tower",
    category: "Towers",
    description:
      "A decadent tower of 70 handcrafted chocolate treats, beautifully arranged and perfect for any celebration.",
    details:
      "Tower height: 11.9 inches. The tower can be fully customised with colours and toppings to match your theme. Please allow 5 days notice.",
    variants: [{ label: "Chocolate Tower", price: 175, image: "/images/towers/cht.png" }],
    image: "/images/towers/cht.png",
  },
  {
    slug: "croissant-tower",
    name: "Croissant Tower",
    category: "Towers",
    subtitle: "100% Real Butter",
    description:
      "A beautiful tower of 30 freshly baked croissants made with 100% real butter — golden, flaky, and utterly delicious. Perfect for brunches, baby showers, and morning events.",
    details:
      "Croissants can be filled with chocolate, almond, or left plain. Tower height: 11.9 inches. The tower is decorated with fresh flowers or themed decorations on request. Please allow 3-5 days notice.",
    variants: [
      { label: "Croissant Tower (30 croissants)", price: 140, image: "/images/towers/ct.png" },
    ],
    image: "/images/towers/ct.png",
  },
];

export const visibleProducts = products.filter((p) => !p.hidden);

export const categories = [
  "All",
  ...Array.from(new Set(visibleProducts.map((p) => p.category))),
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
