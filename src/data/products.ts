export interface ProductVariant {
  label: string;
  price: number;
  image?: string;
}

export interface Product {
  slug: string;
  name: string;
  category: string;
  description: string;
  details?: string;
  variants: ProductVariant[];
  enquireOnly?: boolean;
  image?: string;
}

export const products: Product[] = [
  // ── Party Sets ──────────────────────────────────────────
  {
    slug: "small-party-set",
    name: "Small Party Set (4 Dozen)",
    category: "Party Sets",
    description:
      "Our Small Party Set is ideal for intimate gatherings and smaller celebrations. A beautifully curated selection of chocolate dipped treats your guests will love.",
    details:
      "The Small Party Set can be customised to your theme and colour scheme. Please allow 3-5 days notice for party set orders.",
    variants: [{ label: "Small Party Set (2 Dozen)", price: 65, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/brand-spread.jpg",
  },
  {
    slug: "medium-party-set",
    name: "Medium Party Set (8 Dozen)",
    category: "Party Sets",
    description:
      "Our Medium Party Set is perfect for celebrations! This set includes 4 dozen beautifully crafted treats — a mix of chocolate dipped favourites to wow your guests.",
    details:
      "The Party Set can be customised to your theme and colour scheme. Choose from a selection of our most popular treats including cake pops, cakesicles, strawberries, and more. Please allow 3-5 days notice for party set orders.",
    variants: [{ label: "4 Dozen Assorted Treats", price: 120, image: "/images/brand-spread.jpg" }],
    image: "/images/treat-boxes/mixed-treats.jpg",
  },
  {
    slug: "large-party-set",
    name: "Large Party Set (12 Dozen)",
    category: "Party Sets",
    description:
      "Our Large Party Set is the ultimate spread for big celebrations. Packed with a generous assortment of our finest chocolate dipped treats to impress a crowd.",
    details:
      "The Large Party Set can be fully customised to your theme and colour scheme. Ideal for weddings, corporate events, and large parties. Please allow 5-7 days notice.",
    variants: [{ label: "Large Party Set (6 Dozen)", price: 170, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/brand-spread.jpg",
  },
  {
    slug: "party-cake-6",
    name: "Cake (6\")",
    category: "Party Sets",
    description:
      "A beautifully baked 6 inch cake, perfect for intimate celebrations. Baked from scratch and finished with smooth icing and decorations of your choice.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. Serves approximately 6-8 people. Can be personalised with colours, themes, and a message. Please allow at least 5 days notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/7.jpg",
  },
  {
    slug: "party-cake-8",
    name: "Cake (8\")",
    category: "Party Sets",
    description:
      "A stunning 8 inch cake, ideal for birthdays and celebrations. Baked fresh to order with your choice of flavour and design.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. Serves approximately 10-12 people. Fully customisable with themed decorations and a personalised message. Please allow at least 5 days notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/8.jpg",
  },
  {
    slug: "party-two-tier-cake",
    name: "Two-Tier Cake (8\"/6\")",
    category: "Party Sets",
    description:
      "A show-stopping two-tier cake featuring an 8 inch base and 6 inch top tier. The perfect centrepiece for weddings, milestone birthdays, and special events.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet — mix and match flavours per tier. Serves approximately 20-25 people. Fully customisable design. Please allow at least 1 week notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/1.jpg",
  },
  {
    slug: "party-custom-cake",
    name: "Custom Cake",
    category: "Party Sets",
    description:
      "Our custom cakes are baked from scratch using the finest ingredients and decorated to bring your vision to life. From simple elegance to show-stopping designs.",
    details:
      "All cakes are freshly baked to order. Available in a range of flavours and sizes. Please enquire with your design ideas and we will provide a personalised quote. We recommend placing orders at least 1 week in advance.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/1.jpg",
  },
  {
    slug: "party-tray-bakes",
    name: "Tray Bakes",
    category: "Party Sets",
    description:
      "Our classic Tray Bakes are freshly baked vanilla sponges which we serve up to 12 large slices.",
    details:
      "Please note that all sponges are vanilla flavoured. Tray Bakes are best to consume within 5 days of collection/delivery. Tray Bakes are not available for postage.",
    variants: [
      { label: "Old School Vanilla Sponge & Icing Cake", price: 19, image: "/images/tray-bakes/1.jpg" },
      { label: "Old School Raspberry & Coconut", price: 19, image: "/images/tray-bakes/2.jpg" },
      { label: "Old School Caramel & Chocolate", price: 19, image: "/images/tray-bakes/3.jpg" },
      { label: "Mixed box of 2 flavours", price: 21, image: "/images/tray-bakes/4.jpg" },
    ],
    image: "/images/tray-bakes/1.jpg",
  },
  {
    slug: "party-one-dozen-box",
    name: "One Dozen Box",
    category: "Party Sets",
    description:
      "A generous box of 12 handcrafted treats, beautifully presented and perfect for sharing. Ideal for birthdays, thank yous, and celebrations.",
    details:
      "Choose from a mix of our signature treats. All boxes can be personalised to match your theme or colour scheme. Comes with a ribbon and optional message card.",
    variants: [{ label: "One Dozen Box", price: 45, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/brand-spread.jpg",
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
    slug: "party-single-packaged-cakesicle",
    name: "Single Packaged Cakesicles (1 Dozen)",
    category: "Party Sets",
    description:
      "A single beautifully decorated cakesicle, individually wrapped and ready to gift. Perfect as a party favour or small treat.",
    details:
      "Available in Vanilla and Chocolate Fudge. Each cakesicle can be themed and personalised. Individually wrapped in cellophane with a ribbon.",
    variants: [
      { label: "Cakesicle in cellophane & ribbon", price: 4.5, image: "/images/cakesicles/tray-1.jpg" },
      { label: "Cakesicle in clear lid box", price: 5.5, image: "/images/cakesicles/tray-2.jpg" },
    ],
    image: "/images/cakesicles/1.jpg",
  },
  {
    slug: "party-single-packaged-cake-pop",
    name: "Single Packaged Cakepops (1 Dozen)",
    category: "Party Sets",
    description:
      "A single decorated cake pop, individually wrapped as a favour. A sweet little gift for any celebration.",
    details:
      "Available in Vanilla and Chocolate Fudge. Each cake pop can be themed and customised. Wrapped in cellophane with a twist ribbon.",
    variants: [{ label: "Cakepop in cellophane & ribbon", price: 4, image: "/images/cake-pops/basic.jpg" }],
    image: "/images/cake-pops/smores.jpg",
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
    slug: "party-cake-tray",
    name: "Cake Tray",
    category: "Party Sets",
    description:
      "A small tray of assorted mini cakes and treats, beautifully wrapped as a favour. A generous and impressive gift for guests.",
    details:
      "Each tray includes a selection of mini treats. Can be themed and personalised to match your event. Perfect for weddings, corporate events, and celebrations.",
    variants: [{ label: "Per Cake Tray", price: 8, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/treat-boxes/mixed-treats.jpg",
  },
  {
    slug: "party-mini-cookies-box",
    name: "Mini Cookies Box",
    category: "Party Sets",
    description:
      "A cute little box filled with mini cookies, perfect as a favour or small gift. Baked from scratch and beautifully packaged.",
    details:
      "Each box contains an assortment of mini cookies. Can be themed with colours and packaging. Minimum order of 10.",
    variants: [{ label: "Per Mini Box (min 10)", price: 5, image: "/images/cookie-box/3.jpg" }],
    image: "/images/cookie-box/3.jpg",
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
    slug: "gift-one-dozen-box",
    name: "One Dozen Box",
    category: "Gift",
    description:
      "A generous gift box of 12 handcrafted treats, beautifully presented and perfect for sharing. Ideal for birthdays, thank yous, and celebrations.",
    details:
      "Choose from a mix of our signature treats. All boxes can be personalised to match your theme or colour scheme. Comes with a ribbon and optional message card.",
    variants: [{ label: "One Dozen Box", price: 45, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/brand-spread.jpg",
  },
  {
    slug: "gift-custom-cake",
    name: "Custom Cake",
    category: "Gift",
    description:
      "A custom celebration cake baked from scratch and beautifully decorated. Perfect as a gift for birthdays, milestones, and special moments.",
    details:
      "Available in a range of flavours and sizes. Fully customisable with themed decorations and personalised messages. Please enquire for a personalised quote.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/4.jpg",
  },
  {
    slug: "gift-mini-cakes",
    name: "Mini Cake & Cupcakes",
    category: "Gift",
    description:
      "Adorable individual-sized mini cakes, perfect for gifting. Each one is baked from scratch and beautifully finished with icing and decorations.",
    details:
      "Mini cakes are available in Vanilla, Chocolate, and Red Velvet. Each cake can be personalised with colours and themed decorations. Sold individually or as a set.",
    variants: [
      { label: "Single Mini Cake", price: 8, image: "/images/cake/5.jpg" },
      { label: "Set of 4", price: 28, image: "/images/cake/6.jpg" },
    ],
    image: "/images/cake/5.jpg",
  },
  {
    slug: "gift-cake-6",
    name: "Cake (6\")",
    category: "Gift",
    description:
      "A beautifully baked 6 inch cake, perfect for intimate celebrations. Baked from scratch and finished with smooth icing and decorations of your choice.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. Serves approximately 6-8 people. Can be personalised with colours, themes, and a message. Please allow at least 5 days notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/7.jpg",
  },
  {
    slug: "gift-cake-8",
    name: "Cake (8\")",
    category: "Gift",
    description:
      "A stunning 8 inch cake, ideal for birthdays and celebrations. Baked fresh to order with your choice of flavour and design.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. Serves approximately 10-12 people. Fully customisable with themed decorations and a personalised message. Please allow at least 5 days notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/8.jpg",
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
    image: "/images/treat-boxes/mixed-treats.jpg",
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
      "They come in a variety of designs and toppings, all of which can be customised to your liking, theme or party. Available in regular, flat, and ice cream cone shapes. Minimum order of 6. Can be individually wrapped for an extra charge.",
    variants: [{ label: "1 Dozen", price: 36, image: "/images/cake-pops/basic.jpg" }],
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
      "Each cookie is generously sized and hand-dipped. Available with milk, white, or dark chocolate coating. Can be customised with toppings and colours to match your theme.",
    variants: [{ label: "1 Dozen", price: 48, image: "/images/butter-cookies/1.jpg" }],
    image: "/images/butter-cookies/1.jpg",
  },
  {
    slug: "choc-dipped-caramel-pretzel-rods",
    name: "Caramel Pretzel Rod (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Crunchy pretzel rods coated in buttery caramel, then dipped in premium chocolate and finished with decorative toppings. The perfect sweet and salty treat.",
    details:
      "Each pretzel rod is hand-dipped and decorated. Available with milk or white chocolate. Can be customised with colours, drizzles, and sprinkles. Best consumed within 2 weeks.",
    variants: [{ label: "1 Dozen", price: 35, image: "/images/pretzel-rods/1.jpg" }],
    image: "/images/pretzel-rods/1.jpg",
  },
  {
    slug: "choc-dipped-rice-krispies",
    name: "Rice Krispies (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Our crispy rice treats dipped in smooth Belgian chocolate and decorated with colourful toppings. A fun and delicious treat for all ages.",
    details:
      "Each rice krispie treat is hand-shaped and dipped. Available in a variety of shapes and designs. Can be themed to match any event. Best consumed within 1 week.",
    variants: [{ label: "1 Dozen", price: 45, image: "/images/brand-spread.jpg" }],
    image: "/images/brand-spread.jpg",
  },
  {
    slug: "choc-dipped-pretzel-original",
    name: "Twisted Pretzel (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Classic pretzel twists dipped in our premium Belgian chocolate with decorative toppings. Simple, satisfying, and utterly moreish.",
    details:
      "Hand-dipped in milk or white chocolate and finished with sprinkles, drizzles, or crushed toppings. Perfect for grazing tables and treat bags. Best consumed within 2 weeks.",
    variants: [{ label: "1 Dozen", price: 35, image: "/images/pretzel-rods/1.jpg" }],
    image: "/images/pretzel-rods/1.jpg",
  },
  {
    slug: "butter-cookies",
    name: "Butter Cookies (1 Dozen)",
    category: "Chocolate Covered Treats",
    description:
      "Melt-in-your-mouth butter cookies, baked from scratch and finished with a chocolate dip and decorative toppings. Rich, buttery, and irresistible.",
    details:
      "Made with real butter and premium ingredients. Available plain or chocolate dipped. Can be customised with colours and toppings. Best consumed within 1 week.",
    variants: [{ label: "1 Dozen", price: 18, image: "/images/butter-cookies/1.jpg" }],
    image: "/images/butter-cookies/2.jpg",
  },

  // ── Bakes ───────────────────────────────────────────────
  {
    slug: "muffins",
    name: "Muffins (1 Dozen)",
    category: "Bakes",
    description:
      "Freshly baked muffins in a variety of classic flavours. Soft, moist, and perfect for breakfast, brunch, or a sweet snack.",
    details:
      "Available in Blueberry, Chocolate Chip, Banana Walnut, and Lemon Poppy Seed. Baked from scratch using premium ingredients. Best consumed within 3 days.",
    variants: [{ label: "1 Dozen", price: 26, image: "/images/tray-bakes/7.jpg" }],
    image: "/images/tray-bakes/7.jpg",
  },
  {
    slug: "bakes-cupcakes",
    name: "Cupcakes (1 Dozen)",
    category: "Bakes",
    description:
      "Soft, fluffy cupcakes baked from scratch and topped with swirls of buttercream. Available in a range of flavours and decorated to your theme.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. Custom toppers and themed decorations available. Baked fresh to order.",
    variants: [{ label: "1 Dozen", price: 38, image: "/images/cupcakes/2.jpg" }],
    image: "/images/cupcakes/2.jpg",
  },
  {
    slug: "tray-bakes",
    name: "Tray Bakes",
    category: "Bakes",
    description:
      "Our classic Tray Bakes are freshly baked vanilla sponges which we serve up to 12 large slices.",
    details:
      "Please note that all sponges are vanilla flavoured. Tray Bakes are best to consume within 5 days of collection/delivery. Tray Bakes are not available for postage.",
    variants: [
      { label: "Old School Vanilla Sponge & Icing Cake", price: 19, image: "/images/tray-bakes/1.jpg" },
      { label: "Old School Raspberry & Coconut", price: 19, image: "/images/tray-bakes/2.jpg" },
      { label: "Old School Caramel & Chocolate", price: 19, image: "/images/tray-bakes/3.jpg" },
      { label: "Mixed box of 2 flavours", price: 21, image: "/images/tray-bakes/4.jpg" },
    ],
    image: "/images/tray-bakes/1.jpg",
  },
  {
    slug: "bakes-mini-cakes",
    name: "Mini Cake & Cupcakes",
    category: "Bakes",
    description:
      "Individual-sized cakes baked from scratch and beautifully decorated. Perfect as single-serve treats for any celebration.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. Each mini cake is hand-finished with icing and decorations.",
    variants: [
      { label: "Single Mini Cake", price: 8, image: "/images/cake/9.jpg" },
      { label: "Set of 4", price: 28, image: "/images/cake/10.jpg" },
    ],
    image: "/images/cake/9.jpg",
  },
  {
    slug: "bakes-cake-6",
    name: "Cake (6\")",
    category: "Bakes",
    description:
      "A beautifully baked 6 inch cake, perfect for intimate celebrations. Baked from scratch and finished with smooth icing and decorations of your choice.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. Serves approximately 6-8 people. Can be personalised with colours, themes, and a message. Please allow at least 5 days notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/7.jpg",
  },
  {
    slug: "bakes-cake-8",
    name: "Cake (8\")",
    category: "Bakes",
    description:
      "A stunning 8 inch cake, ideal for birthdays and celebrations. Baked fresh to order with your choice of flavour and design.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet. Serves approximately 10-12 people. Fully customisable with themed decorations and a personalised message. Please allow at least 5 days notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/8.jpg",
  },
  {
    slug: "bakes-two-tier-cake",
    name: "Two-Tier Cake (8\"/6\")",
    category: "Bakes",
    description:
      "A show-stopping two-tier cake featuring an 8 inch base and 6 inch top tier. The perfect centrepiece for weddings, milestone birthdays, and special events.",
    details:
      "Available in Vanilla, Chocolate, and Red Velvet — mix and match flavours per tier. Serves approximately 20-25 people. Fully customisable design. Please allow at least 1 week notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/1.jpg",
  },
  {
    slug: "bakes-custom-cake",
    name: "Custom Cake",
    category: "Bakes",
    description:
      "A fully custom cake baked from scratch to your specifications. Available in a range of flavours, sizes, and designs for any celebration.",
    details:
      "Please enquire with your design ideas, flavour preferences, and event date. We will provide a personalised quote. Please allow at least 1 week notice.",
    variants: [],
    enquireOnly: true,
    image: "/images/cake/11.jpg",
  },
  {
    slug: "bakes-madeleines",
    name: "Madeleines",
    category: "Bakes",
    description:
      "Classic French madeleines baked fresh from scratch with real butter and vanilla. Light, soft, and perfect on their own or dipped in chocolate.",
    details:
      "Our madeleines are baked daily using premium ingredients. Available plain or chocolate dipped. Best consumed within 5 days of collection.",
    variants: [
      { label: "Box of 6", price: 12, image: "/images/madeleines/3.jpg" },
      { label: "Box of 12", price: 22, image: "/images/madeleines/4.jpg" },
    ],
    image: "/images/madeleines/3.jpg",
  },
  {
    slug: "bakes-butter-cookies",
    name: "Butter Cookies",
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
    name: "Cakesicles",
    category: "Bakes",
    description:
      "Our best-selling Cakesicles consist of a freshly baked cake coated in our premium Belgian chocolate. Available in a variety of designs and toppings, all customisable to your liking.",
    details:
      "Available in Vanilla and Chocolate Fudge. Regular and heart shapes available. Personalised edible toppers can be made. Best consumed within 2 weeks of collection/delivery.",
    variants: [{ label: "Each (from)", price: 4.5, image: "/images/cakesicles/1.jpg" }],
    image: "/images/cakesicles/5.png",
  },
  {
    slug: "bakes-cake-pops",
    name: "Cake Pops",
    category: "Bakes",
    description:
      "Freshly baked cake pops in Vanilla or Chocolate Fudge, dipped in premium Belgian chocolate and decorated with your choice of toppings.",
    details:
      "Available in regular, flat, and ice cream cone shapes. Minimum order of 6. Can be individually wrapped. Best consumed within 2 weeks.",
    variants: [
      { label: "Cake Pop", price: 4, image: "/images/cake-pops/2.jpg" },
      { label: "Flat Cake Pop", price: 4, image: "/images/cake-pops/3.jpg" },
      { label: "Ice Cream Cone Cake Pop", price: 4.5, image: "/images/cake-pops/4.jpg" },
    ],
    image: "/images/cake-pops/2.jpg",
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
    slug: "single-cake-popsicle",
    name: "Single Packaged Cakesicles (1 Dozen)",
    category: "Favours",
    description:
      "A single beautifully decorated cakesicle, individually wrapped and ready to gift. Perfect as a party favour or small treat.",
    details:
      "Available in Vanilla and Chocolate Fudge. Each cakesicle can be themed and personalised. Individually wrapped in cellophane with a ribbon.",
    variants: [
      { label: "Cakesicle in cellophane & ribbon", price: 4.5, image: "/images/cakesicles/tray-1.jpg" },
      { label: "Cakesicle in clear lid box", price: 5.5, image: "/images/cakesicles/tray-2.jpg" },
    ],
    image: "/images/cakesicles/1.jpg",
  },
  {
    slug: "single-cake-pop",
    name: "Single Packaged Cakepops (1 Dozen)",
    category: "Favours",
    description:
      "A single decorated cake pop, individually wrapped as a favour. A sweet little gift for any celebration.",
    details:
      "Available in Vanilla and Chocolate Fudge. Each cake pop can be themed and customised. Wrapped in cellophane with a twist ribbon.",
    variants: [{ label: "Cakepop in cellophane & ribbon", price: 4, image: "/images/cake-pops/basic.jpg" }],
    image: "/images/cake-pops/smores.jpg",
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
    slug: "cake-tray",
    name: "Cake Tray",
    category: "Favours",
    description:
      "A small tray of assorted mini cakes and treats, beautifully wrapped as a favour. A generous and impressive gift for guests.",
    details:
      "Each tray includes a selection of mini treats. Can be themed and personalised to match your event. Perfect for weddings, corporate events, and celebrations.",
    variants: [{ label: "Per Cake Tray", price: 8, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/treat-boxes/mixed-treats.jpg",
  },
  {
    slug: "mini-cookies-box",
    name: "Mini Cookies Box",
    category: "Favours",
    description:
      "A cute little box filled with mini cookies, perfect as a favour or small gift. Baked from scratch and beautifully packaged.",
    details:
      "Each box contains an assortment of mini cookies. Can be themed with colours and packaging. Minimum order of 10.",
    variants: [{ label: "Per Mini Box (min 10)", price: 5, image: "/images/cookie-box/3.jpg" }],
    image: "/images/cookie-box/3.jpg",
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
    variants: [{ label: "1 Dozen", price: 36, image: "/images/treat-boxes/mixed-treats.jpg" }],
    image: "/images/treat-boxes/mixed-treats.jpg",
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
    variants: [{ label: "Madeleine Tower", price: 55, image: "/images/towers/1.jpg" }],
    image: "/images/madeleines/1.jpg",
  },
  {
    slug: "macaron-tower",
    name: "Macaron Tower",
    category: "Towers",
    description:
      "An elegant tower of delicate macarons in your choice of colours and flavours. A showstopping addition to weddings, baby showers, and special events.",
    details:
      "Available in a variety of flavours including Vanilla, Pistachio, Raspberry, Chocolate, Salted Caramel, and more. Towers can be colour-matched to your event. Please allow 5-7 days notice.",
    variants: [
      { label: "Small Tower (30 macarons)", price: 60, image: "/images/towers/2.jpg" },
      { label: "Large Tower (60 macarons)", price: 110, image: "/images/towers/3.jpg" },
    ],
    image: "/images/towers/2.jpg",
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
