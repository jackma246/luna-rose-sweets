export interface ProductVariant {
  label: string;
  price: number;
  image?: string;
}

export interface ProductAddon {
  label: string;
  price: string;
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
  enquireOnly?: boolean;
  image?: string;
}

export const products: Product[] = [
  // ── Party Sets ──────────────────────────────────────────
  {
    slug: "small-party-set",
    name: "Small Party Set (3 Dozen)",
    category: "Party Sets",
    description:
      "Our Small Party Set is ideal for intimate gatherings and smaller celebrations. Includes 1 Dozen Cake Pops, 1 Dozen Choco Cookies, and 1 Dozen Caramel Pretzel Rods.",
    details:
      "The Small Party Set can be customised to your theme and colour scheme. Please allow 3-5 days notice for party set orders.",
    variants: [{ label: "Small Party Set (3 Dozen)", price: 135, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/brand-spread.jpg",
  },
  {
    slug: "medium-party-set",
    name: "Medium Party Set (4 Dozen)",
    category: "Party Sets",
    description:
      "Our Medium Party Set is perfect for celebrations! Includes 1 Dozen Cake Pops, 1 Dozen Choco Cookies, 1 Dozen Caramel Pretzel Rods, and 1 Dozen Rice Krispies.",
    details:
      "The Party Set can be customised to your theme and colour scheme. Please allow 3-5 days notice for party set orders.",
    variants: [{ label: "Medium Party Set (4 Dozen)", price: 185, image: "/images/brand-spread.jpg" }],
    image: "/images/treat-boxes/mixed-treats.jpg",
  },
  {
    slug: "large-party-set",
    name: "Large Party Set (8 Dozen)",
    category: "Party Sets",
    description:
      "Our Large Party Set is the ultimate spread for big celebrations. Includes 2 Dozen Cake Pops, 2 Dozen Choco Cookies, 2 Dozen Caramel Pretzel Rods, and 2 Dozen Rice Krispies.",
    details:
      "The Large Party Set can be fully customised to your theme and colour scheme. Ideal for weddings, corporate events, and large parties. Please allow 5-7 days notice.",
    variants: [{ label: "Large Party Set (8 Dozen)", price: 310, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/brand-spread.jpg",
  },
  {
    slug: "party-layer-cake",
    name: "3-Layer Custom Cake (6\"/8\")",
    category: "Party Sets",
    subtitle: "100% Real Buttercream",
    description:
      "A stunning 3-layer custom cake made from scratch with 100% real buttercream. Available in 6\" and 8\" sizes, fully customisable to your theme and colour palette.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. 6\" serves approx. 6-8 people, 8\" serves approx. 10-12 people. Please allow at least 5 days notice.",
    variants: [
      { label: "Basic Design 6\" (6–8 servings)", price: 85, image: "/images/cake/7.jpg" },
      { label: "Basic Design 8\" (10–14 servings)", price: 125, image: "/images/cake/8.jpg" },
    ],
    addons: [
      { label: "Extra Cream Decoration", price: "+$10–$25" },
      { label: "Color Customization", price: "+$10" },
      { label: "Lettering", price: "+$5–$10" },
    ],
    image: "/images/cake/7.jpg",
  },
  {
    slug: "party-two-tier-cake",
    name: "Two-Tier Cake (8\"/6\")",
    category: "Party Sets",
    description:
      "A show-stopping two-tier cake featuring an 8 inch base and 6 inch top tier. The perfect centrepiece for weddings, milestone birthdays, and special events.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet — mix and match flavours per tier. Serves approximately 20-25 people. Please allow at least 1 week notice. For custom designs, please share your design ideas and we will be in touch.",
    variants: [{ label: "Two-Tier Cake (8\"/6\")", price: 260, image: "/images/cake/two-tier.jpg" }],
    addons: [
      { label: "Floral Decoration", price: "Additional cost" },
      { label: "Custom Design Details", price: "Additional cost" },
    ],
    image: "/images/cake/two-tier.jpg",
  },
  {
    slug: "party-tray-bakes",
    name: "Tray Bakes",
    category: "Party Sets",
    subtitle: "100% Real Buttercream · 2 Sizes",
    description:
      "Made with 100% real European buttercream, our Tray Bakes are the perfect party dessert. Easy to serve, beautifully presented, and fully customisable in design and colour.",
    details:
      "Made with 100% real European buttercream — rich, smooth, and never artificial. Perfect for parties and events. Easy to slice and serve. Custom designs and colour palettes available. Best consumed within 5 days of collection.",
    variants: [
      { label: "Medium — 15×11\" (20–30 servings)", price: 85, image: "/images/tray-bakes/1.jpg" },
      { label: "Large — 17×12\" deep (30–45 servings)", price: 125, image: "/images/tray-bakes/1.jpg" },
    ],
    addons: [
      { label: "Extra Buttercream Decoration", price: "+$10–$25" },
      { label: "Lettering", price: "+$10" },
      { label: "Color Customization", price: "+$10" },
    ],
    image: "/images/tray-bakes/1.jpg",
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
    image: "/images/brand-spread.jpg",
  },
  {
    slug: "party-diy-decorating-set",
    name: "DIY Decorating Set",
    category: "Party Sets",
    description:
      "A child-friendly DIY kit where kids get to be creative and decorate their own cakesicles and treats. A fun activity and delicious treat in one!",
    details:
      "Kits contain: Instructional Steps, 5 Dipped Milk Chocolate Strawberries, 4 Dipped White Chocolate Cakesicles (Vanilla & Chocolate Fudge), decorating supplies and sprinkles.",
    variants: [{ label: "DIY Decorating Set", price: 31, image: "/images/brand-spread.jpg" }],
    image: "/images/brand-spread.jpg",
  },

  // ── Gift (was Specialty) ────────────────────────────────
  {
    slug: "cakepop-bouquet",
    name: "Cakepop Bouquet",
    category: "Gift",
    description:
      "A stunning bouquet of decorated cake pops — a unique and delicious alternative to flowers! Perfect for birthdays, Mother's Day, or just because.",
    details:
      "Each bouquet is hand-arranged with freshly baked cake pops dipped in premium Belgian chocolate. Available in Vanilla and Chocolate Fudge flavours. Bouquets can be themed and personalised with colours, toppings, and edible toppers.",
    variants: [
      { label: "Small Bouquet (8 pops)", price: 35, image: "/images/popsicle-bouquet/1.jpg" },
      { label: "Large Bouquet (16 pops)", price: 60, image: "/images/cake-pops/basic.jpg" },
    ],
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
    variants: [{ label: "2-tier Heart Surprise Box", price: 45, image: "/images/treat-boxes/flower-box.png" }],
    image: "/images/treat-boxes/flower-box.png",
  },
  {
    slug: "flower-treat-box",
    name: "Cakepop & Rose Bouquet",
    category: "Gift",
    description:
      "A gorgeous combination of fresh roses and our handcrafted cake pops, beautifully arranged as a luxury bouquet. The perfect gift that looks and tastes amazing.",
    details:
      "The Cakepop & Rose Bouquet includes a selection of seasonal roses alongside our signature cake pops. Can be personalised with a message card. Please allow 3-5 days notice.",
    variants: [{ label: "Cakepop & Rose Bouquet", price: 50, image: "/images/treat-boxes/flower-box.png" }],
    image: "/images/strawberries/bouquet-1.jpg",
  },
  {
    slug: "gift-cakepops-flower-box",
    name: "Cakepops & Flower Box",
    category: "Gift",
    description:
      "A delightful gift box combining our beautifully decorated cake pops with fresh flowers. A unique treat that's as stunning to look at as it is to eat.",
    details:
      "Each box is hand-arranged with freshly baked cake pops and seasonal flowers. Can be themed and personalised with colours and a message card. Please allow 3-5 days notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/popsicle-bouquet/1.jpg",
  },
  {
    slug: "gift-layer-cake",
    name: "3-Layer Custom Cake (6\"/8\")",
    category: "Gift",
    subtitle: "100% Real Buttercream",
    description:
      "A stunning 3-layer custom cake made from scratch with 100% real buttercream. Available in 6\" and 8\" sizes, fully customisable to your theme and colour palette.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. 6\" serves approx. 6-8 people, 8\" serves approx. 10-12 people. Please allow at least 5 days notice.",
    variants: [
      { label: "Basic Design 6\" (6–8 servings)", price: 85, image: "/images/cake/7.jpg" },
      { label: "Basic Design 8\" (10–14 servings)", price: 125, image: "/images/cake/8.jpg" },
    ],
    addons: [
      { label: "Extra Cream Decoration", price: "+$10–$25" },
      { label: "Color Customization", price: "+$10" },
      { label: "Lettering", price: "+$5–$10" },
    ],
    image: "/images/cake/7.jpg",
  },
  {
    slug: "luxury-chocolate-dates",
    name: "Luxury Chocolate Dates",
    category: "Gift",
    description:
      "Our Dates are covered in luxury chocolate and can be topped with a variety of toppings.",
    details:
      "Toppings: Almond, Coconut, Pistachios, Edible Roses, Crushed oreo/lotus and many more! We also offer chocolate FILLED dates. Fillings include: Lotus, Peanut Butter, Nutella, Pistachio Spread, Milk Chocolate, and many more!",
    variants: [],
    enquireOnly: true,
    image: "/images/luxury-dates/1.jpg",
  },

  // ── Treats (was Cakesicles) ─────────────────────────────
  {
    slug: "cakesicles",
    name: "Cakesicles (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Our best-selling Cakesicles consist of a freshly baked cake coated in our premium Belgian chocolate. These are also available in a variety of designs and toppings, all of which can be customised to your liking, theme or party.",
    details:
      "They are available in the flavours Vanilla and Chocolate Fudge. Cakesicles are available in regular and heart shape. We can make personalised edible toppers for your cakesicles. Cakesicles are best to consume within 2 weeks of collection/delivery.",
    variants: [{ label: "1 Dozen", price: 54, image: "/images/cakesicles/1.jpg" }],
    image: "/images/cakesicles/5.png",
  },
  {
    slug: "cakepops",
    name: "Cakepops (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Our cute Cake Pops are composed of a deliciously fresh baked cake dipped in our premium Belgian chocolate. Available in Vanilla and Chocolate Fudge flavours.",
    details:
      "Standard designs start at $42/dozen. Custom designs (themed colours, toppers, shapes) from $45–$54/dozen. Available in regular, flat, and ice cream cone shapes. Can be individually wrapped for an extra charge.",
    variants: [
      { label: "Standard (1 Dozen)", price: 42, image: "/images/cake-pops/basic.jpg" },
      { label: "Custom (1 Dozen)", price: 45, image: "/images/cake-pops/basic.jpg" },
    ],
    image: "/images/cake-pops/basic.jpg",
  },
  {
    slug: "madeleines",
    name: "Madeleines (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Freshly baked madeleines dipped in our premium Belgian chocolate and finished with beautiful toppings. A classic French treat with our signature twist.",
    details:
      "Each madeleine is hand-dipped and decorated. Available in a variety of colours and toppings to suit any theme. Best consumed within 5 days of collection.",
    variants: [
      { label: "Box of 6", price: 15, image: "/images/madeleines/1.jpg" },
      { label: "Box of 12", price: 28, image: "/images/madeleines/2.jpg" },
    ],
    image: "/images/madeleines/1.jpg",
  },
  {
    slug: "choc-dipped-choco-cookies",
    name: "Choco Cookies (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Rich chocolate cookies dipped in our smooth Belgian chocolate and topped with drizzles and sprinkles. A chocolate lover's dream!",
    details:
      "Standard designs start at $30/dozen. Custom designs (themed colours, toppings, drizzles) from $36–$45/dozen. Available with milk, white, or dark chocolate coating.",
    variants: [
      { label: "Standard (1 Dozen)", price: 30, image: "/images/choco-cookies/1.jpg" },
      { label: "Custom (1 Dozen)", price: 36, image: "/images/choco-cookies/1.jpg" },
    ],
    image: "/images/choco-cookies/1.jpg",
  },
  {
    slug: "choc-dipped-caramel-pretzel-rods",
    name: "Caramel Pretzel Rod (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Crunchy pretzel rods coated in buttery caramel, then dipped in premium chocolate and finished with decorative toppings. The perfect sweet and salty treat.",
    details:
      "Standard designs start at $24/dozen. Custom designs (themed colours, drizzles, sprinkles) from $30–$36/dozen. Available with milk or white chocolate. Best consumed within 2 weeks.",
    variants: [
      { label: "Standard (1 Dozen)", price: 24, image: "/images/caramel-pretzel/1.jpg" },
      { label: "Custom (1 Dozen)", price: 30, image: "/images/caramel-pretzel/1.jpg" },
    ],
    image: "/images/caramel-pretzel/1.jpg",
  },
  {
    slug: "choc-dipped-rice-krispies",
    name: "Rice Krispies (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Our crispy rice treats dipped in smooth Belgian chocolate and decorated with colourful toppings. A fun and delicious treat for all ages.",
    details:
      "Standard designs start at $30/dozen. Custom designs (themed shapes, colours, toppings) from $36–$48/dozen. Hand-shaped and dipped. Best consumed within 1 week.",
    variants: [
      { label: "Standard (1 Dozen)", price: 30, image: "/images/rice-krispies/1.jpg" },
      { label: "Custom (1 Dozen)", price: 36, image: "/images/rice-krispies/1.jpg" },
    ],
    image: "/images/rice-krispies/1.jpg",
  },
  {
    slug: "choc-dipped-pretzel-original",
    name: "Twisted Pretzel (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Classic pretzel twists dipped in our premium Belgian chocolate with decorative toppings. Simple, satisfying, and utterly moreish.",
    details:
      "Hand-dipped in milk or white chocolate and finished with sprinkles, drizzles, or crushed toppings. Perfect for grazing tables and treat bags. Best consumed within 2 weeks.",
    variants: [{ label: "1 Dozen", price: 35, image: "/images/twisted-pretzel/1.jpg" }],
    image: "/images/twisted-pretzel/1.jpg",
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
  },
  {
    slug: "bakes-cupcakes",
    name: "Cupcakes (1/2 Dozen)",
    category: "Bakes",
    description:
      "Soft, fluffy cupcakes baked from scratch and topped with swirls of buttercream. Available in a range of flavours and decorated to your theme.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. Custom toppers and themed decorations available. Baked fresh to order.",
    variants: [
      { label: "1/2 Dozen (6 pcs)", price: 28, image: "/images/cupcakes/2.jpg" },
      { label: "1 Dozen (12 pcs)", price: 48, image: "/images/cupcakes/2.jpg" },
    ],
    image: "/images/cupcakes/2.jpg",
  },
  {
    slug: "tray-bakes",
    name: "Tray Bakes",
    category: "Bakes",
    subtitle: "100% Real Buttercream · 2 Sizes",
    description:
      "Made with 100% real European buttercream, our Tray Bakes are the perfect party dessert. Easy to serve, beautifully presented, and fully customisable in design and colour.",
    details:
      "Made with 100% real European buttercream — rich, smooth, and never artificial. Perfect for parties and events. Easy to slice and serve. Custom designs and colour palettes available. Best consumed within 5 days of collection.",
    variants: [
      { label: "Medium — 15×11\" (20–30 servings)", price: 85, image: "/images/tray-bakes/1.jpg" },
      { label: "Large — 17×12\" deep (30–45 servings)", price: 125, image: "/images/tray-bakes/1.jpg" },
    ],
    addons: [
      { label: "Extra Buttercream Decoration", price: "+$10–$25" },
      { label: "Lettering", price: "+$10" },
      { label: "Color Customization", price: "+$10" },
    ],
    image: "/images/tray-bakes/1.jpg",
  },
  {
    slug: "bakes-layer-cake",
    name: "3-Layer Custom Cake (6\"/8\")",
    category: "Bakes",
    subtitle: "100% Real Buttercream",
    description:
      "A stunning 3-layer custom cake made from scratch with 100% real buttercream. Available in 6\" and 8\" sizes, fully customisable to your theme and colour palette.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. 6\" serves approx. 6-8 people, 8\" serves approx. 10-12 people. Please allow at least 5 days notice.",
    variants: [
      { label: "Basic Design 6\" (6–8 servings)", price: 85, image: "/images/cake/7.jpg" },
      { label: "Basic Design 8\" (10–14 servings)", price: 125, image: "/images/cake/8.jpg" },
    ],
    addons: [
      { label: "Extra Cream Decoration", price: "+$10–$25" },
      { label: "Color Customization", price: "+$10" },
      { label: "Lettering", price: "+$5–$10" },
    ],
    image: "/images/cake/7.jpg",
  },
  {
    slug: "bakes-two-tier-cake",
    name: "Two-Tier Cake (8\"/6\")",
    category: "Bakes",
    description:
      "A show-stopping two-tier cake featuring an 8 inch base and 6 inch top tier. The perfect centrepiece for weddings, milestone birthdays, and special events.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet — mix and match flavours per tier. Serves approximately 20-25 people. Please allow at least 1 week notice. For custom designs, please share your design ideas and we will be in touch.",
    variants: [{ label: "Two-Tier Cake (8\"/6\")", price: 260, image: "/images/cake/two-tier.jpg" }],
    addons: [
      { label: "Floral Decoration", price: "Additional cost" },
      { label: "Custom Design Details", price: "Additional cost" },
    ],
    image: "/images/cake/two-tier.jpg",
  },
  {
    slug: "bakes-madeleines",
    name: "Madeleines (1 Dozen)",
    category: "Bakes",
    description:
      "Freshly baked madeleines dipped in our premium Belgian chocolate and finished with beautiful toppings. A classic French treat with our signature twist.",
    details:
      "Each madeleine is hand-dipped and decorated. Available in a variety of colours and toppings to suit any theme. Best consumed within 5 days of collection.",
    variants: [
      { label: "Box of 6", price: 15, image: "/images/madeleines/1.jpg" },
      { label: "Box of 12", price: 28, image: "/images/madeleines/2.jpg" },
    ],
    image: "/images/madeleines/1.jpg",
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
      { label: "Box of 6", price: 12, image: "/images/butter-cookies/4.jpg" },
      { label: "Box of 12", price: 22, image: "/images/butter-cookies/5.jpg" },
    ],
    image: "/images/butter-cookies/4.jpg",
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
  },
  {
    slug: "bakes-cakesicles",
    name: "Cakesicles (1 Dozen)",
    category: "Bakes",
    description:
      "Our best-selling Cakesicles consist of a freshly baked cake coated in our premium Belgian chocolate. These are also available in a variety of designs and toppings, all of which can be customised to your liking, theme or party.",
    details:
      "They are available in the flavours Vanilla and Chocolate Fudge. Cakesicles are available in regular and heart shape. We can make personalised edible toppers for your cakesicles. Cakesicles are best to consume within 2 weeks of collection/delivery.",
    variants: [{ label: "1 Dozen", price: 54, image: "/images/cakesicles/1.jpg" }],
    image: "/images/cakesicles/5.png",
  },
  {
    slug: "bakes-cake-pops",
    name: "Cake Pops (1 Dozen)",
    category: "Bakes",
    description:
      "Our cute Cake Pops are composed of a deliciously fresh baked cake dipped in our premium Belgian chocolate. Available in Vanilla and Chocolate Fudge flavours.",
    details:
      "They come in a variety of designs and toppings, all of which can be customised to your liking, theme or party. Available in regular, flat, and ice cream cone shapes. Minimum order of 6. Can be individually wrapped for an extra charge.",
    variants: [{ label: "1 Dozen", price: 36, image: "/images/cake-pops/basic.jpg" }],
    image: "/images/cake-pops/basic.jpg",
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
    image: "/images/brand-spread.jpg",
  },
  {
    slug: "favour-diy-decorating-set",
    name: "DIY Decorating Set",
    category: "Favours",
    description:
      "A child-friendly DIY kit where kids get to be creative and decorate their own cakesicles and treats. A fun activity and delicious treat in one!",
    details:
      "Kits contain: Instructional Steps, 5 Dipped Milk Chocolate Strawberries, 4 Dipped White Chocolate Cakesicles (Vanilla & Chocolate Fudge), decorating supplies and sprinkles.",
    variants: [{ label: "DIY Decorating Set", price: 31, image: "/images/brand-spread.jpg" }],
    image: "/images/brand-spread.jpg",
  },
  {
    slug: "choc-treats-luxury-chocolate-dates",
    name: "Luxury Chocolate Dates (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Our Dates are covered in luxury chocolate and can be topped with a variety of toppings.",
    details:
      "Toppings: Almond, Coconut, Pistachios, Edible Roses, Crushed oreo/lotus and many more! We also offer chocolate FILLED dates. Fillings include: Lotus, Peanut Butter, Nutella, Pistachio Spread, Milk Chocolate, and many more!",
    variants: [{ label: "1 Dozen", price: 36, image: "/images/luxury-dates/1.jpg" }],
    image: "/images/luxury-dates/1.jpg",
  },
  {
    slug: "choc-butter-cookies",
    name: "Butter Cookies (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Traditional butter cookies baked from scratch with real butter. Melt-in-your-mouth delicious and perfect with a cup of tea.",
    details:
      "Made with premium butter and vanilla. Available plain, dipped, or decorated. Can be customised with shapes and colours. Best consumed within 1 week.",
    variants: [
      { label: "Box of 6", price: 12, image: "/images/butter-cookies/4.jpg" },
      { label: "Box of 12", price: 22, image: "/images/butter-cookies/5.jpg" },
    ],
    image: "/images/butter-cookies/4.jpg",
  },

  // ── Towers ──────────────────────────────────────────────
  {
    slug: "madeleine-tower",
    name: "Madeleine Tower",
    category: "Towers",
    description:
      "A stunning tower of freshly baked madeleines dipped in premium chocolate. An eye-catching centrepiece for any dessert table or celebration.",
    details:
      "Each madeleine is hand-dipped and decorated. The tower can be customised with colours and toppings to match your theme. Please allow 5 days notice.",
    variants: [{ label: "Madeleine Tower", price: 245, image: "/images/towers/mtower.webp" }],
    image: "/images/towers/mtower.webp",
  },
  {
    slug: "macaron-tower",
    name: "Macaron Tower",
    category: "Towers",
    description:
      "An elegant tower of delicate macarons in your choice of colours and flavours. A showstopping addition to weddings, baby showers, and special events.",
    details:
      "Available in a variety of flavours including Vanilla, Pistachio, Raspberry, Chocolate, Salted Caramel, and more. Towers can be colour-matched to your event. Please allow 5-7 days notice.",
    variants: [{ label: "Macaron Tower", price: 320, image: "/images/towers/macaron.webp" }],
    image: "/images/towers/macaron.webp",
  },
  {
    slug: "chocolate-tower",
    name: "Chocolate Tower",
    category: "Towers",
    description:
      "A decadent tower of handcrafted chocolate treats, beautifully arranged and perfect for any celebration.",
    details:
      "The tower can be fully customised with colours and toppings to match your theme. Please allow 5 days notice.",
    variants: [{ label: "Chocolate Tower", price: 175, image: "/images/towers/ptower.webp" }],
    image: "/images/towers/ptower.webp",
  },
  {
    slug: "croissant-tower",
    name: "Croissant Tower",
    category: "Towers",
    description:
      "A beautiful tower of freshly baked croissants, perfect for brunches, baby showers, and morning events. Golden, flaky, and utterly delicious.",
    details:
      "Croissants can be filled with chocolate, almond, or left plain. The tower is decorated with fresh flowers or themed decorations on request. Please allow 3-5 days notice.",
    variants: [
      { label: "Small Tower (15 croissants)", price: 45, image: "/images/towers/1.jpg" },
      { label: "Large Tower (30 croissants)", price: 80, image: "/images/towers/3.jpg" },
    ],
    image: "/images/towers/1.jpg",
  },
];

export const categories = [
  "All",
  ...Array.from(new Set(products.map((p) => p.category))),
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
