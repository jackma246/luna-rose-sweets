export interface ProductVariant {
  label: string;
  price: number;
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
  {
    slug: "strawberries",
    name: "Strawberries",
    category: "Strawberries",
    description:
      "Strawberries can be personalised to your requirements from different colours and toppings. You can order from a wide variety of quantities.",
    details:
      "Please note, Strawberries are best to consume on the day of collection, latest the day after. Strawberries should be kept in the fridge until consumption. If you wish to have personalised edible wafer toppers, this will incur an additional charge.",
    variants: [
      { label: "Box of 12", price: 25 },
      { label: "Box of 15", price: 31 },
      { label: "Box of 24", price: 44 },
      { label: "Box of 32", price: 53 },
      { label: "Platter (approx 45)", price: 69 },
    ],
    image: "/images/platter.jpg",
  },
  {
    slug: "og-strawberries",
    name: "OG Strawberries",
    category: "Strawberries",
    description:
      "Our famous and original milk chocolate strawberries are everyone's favourite! You can order from a wide variety of quantities.",
    details:
      "If your OG's are for an event or celebration, we can add a topper to your strawberries such as Happy Birthday, Congratulations, Good Luck etc. This will incur an additional charge. Strawberries are best to consume on the day of collection, latest the day after.",
    variants: [
      { label: "Box of 12", price: 20 },
      { label: "Box of 15", price: 25 },
      { label: "Box of 24", price: 38 },
      { label: "Box of 32", price: 50 },
      { label: "Nutella - Box of 12", price: 23 },
      { label: "Nutella - Box of 15", price: 28 },
      { label: "Nutella - Box of 24", price: 43 },
      { label: "Nutella - Box of 32", price: 55 },
    ],
    image: "/images/platter.jpg",
  },
  {
    slug: "strawberry-towers",
    name: "Strawberry Towers",
    category: "Strawberries",
    description:
      "Our Strawberry Towers hold 27 strawberries. It comes with a personalised topper, fresh fruit, three layers of chocolate strawberries packaged in a luxury clear lid box.",
    details:
      "Our toppers can be personalised to your requirements in different colours and shapes! You can choose your variation of fruit such as raspberries, blueberries, figs, strawberries and many more.",
    variants: [{ label: "Starting from", price: 63 }],
    image: "/images/strawberry-tower.jpg",
  },
  {
    slug: "fillable-boxes",
    name: "Fillable Boxes",
    category: "Specialty",
    description:
      "Our fillable Letters and Shapes comes in any design you would like and can also feature a personalised message at the bottom of the box.",
    details:
      "Each enquiry has an individualised price as it depends on your requirements depending on the shape or amount of letters or numbers. These boxes are of high quality and can be reused for future events/celebrations.",
    variants: [],
    enquireOnly: true,
    image: "/images/birthday-basket.jpg",
  },
  {
    slug: "cakesicles",
    name: "Cakesicles",
    category: "Cakesicles",
    description:
      "Our best-selling Cakesicles consist of a freshly baked cake coated in our premium Belgian chocolate. These are also available in a variety of designs and toppings, all of which can be customised to your liking, theme or party.",
    details:
      "They are available in the flavours Vanilla and Chocolate Fudge. Cakesicles are available in regular and heart shape. We can make personalised edible toppers for your cakesicles. Cakesicles are best to consume within 2 weeks of collection/delivery.",
    variants: [{ label: "Each (from)", price: 4.5 }],
    image: "/images/treat-box.jpg",
  },
  {
    slug: "large-treat-box",
    name: "Large Treat Box",
    category: "Treat Boxes",
    description:
      "Our highly favoured Treat Box is a special collection of Cakesicles and Strawberries. It can be made up of 9 Cakesicles (2 different shapes) and 6 Strawberries.",
    details:
      "Our Cakesicles can be catered to all events and themes. The flavours are Vanilla and Chocolate Fudge. We can make personalised toppers and messages to suit your theme.",
    variants: [{ label: "Starting from", price: 44 }],
    image: "/images/treat-box.jpg",
  },
  {
    slug: "mixed-treat-box",
    name: "Mixed Treat Box",
    category: "Treat Boxes",
    description:
      "Our highly favoured Mixed Treat Box is a special collection of Cakesicles, Heart Gems, Strawberries, Shortbread Biscuits, and Cookies.",
    details:
      "As always, we can make the Mixed Treat Box to your desired requirements with any theme and personalisation!",
    variants: [{ label: "Mixed Treat Box", price: 48 }],
    image: "/images/treat-box.jpg",
  },
  {
    slug: "mini-treat-box",
    name: "Mini Treat Box",
    category: "Treat Boxes",
    description:
      "Our highly favoured Mini Treat Box is a special collection of Cakesicles and Strawberries. It can be made up of 5 Cakesicles (2 different shapes) and 5 Strawberries.",
    details:
      "Our Cakesicles can be catered to all events and themes. The flavours are Vanilla and Chocolate Fudge. Cakesicles are best to consume within 2 weeks of collection/delivery and the Strawberries are best to consume within 2 days.",
    variants: [{ label: "Mini Treat Box", price: 31 }],
    image: "/images/treat-box.jpg",
  },
  {
    slug: "cake-pops",
    name: "Cake Pops",
    category: "Cake Pops",
    description:
      "Our cute Cake Pops are composed of a deliciously fresh baked cake dipped in our premium Belgian chocolate. Cake Pops are also available in the flavours Vanilla and Chocolate Fudge.",
    details:
      "They come in a variety of designs and toppings, all of which can be customised to your liking, theme or party. Cake Pops are available in the following shapes: regular, flat, and ice cream cone. There is a minimum order of 6 Cake Pops required. These can also be individually wrapped with an extra charge, starting from $1.25.",
    variants: [
      { label: "Cake Pop", price: 4 },
      { label: "Flat Cake Pop", price: 4 },
      { label: "Ice Cream Cone Cake Pop", price: 4.5 },
    ],
    image: "/images/strawberry-tower.jpg",
  },
  {
    slug: "chocolate-box",
    name: "The Chocolate Box",
    category: "Chocolate Boxes",
    description:
      "Our special Chocolate Boxes come with a beautifully smooth chocolate box lid filled with our popular chocolate strawberries. The elegant aesthetic makes the Chocolate Box a perfect gift for a special occasion.",
    details:
      "The Chocolate Boxes are available in a wide variety of shapes and colours. Strawberries are best to consume on the day of collection, latest the day after. The Chocolate Box is made purely from chocolate therefore can last for weeks as long as it has been kept in the fridge.",
    variants: [
      { label: "Square Box (~26 strawberries)", price: 44 },
      { label: "Heart Box (~16 strawberries)", price: 44 },
      { label: "Baby Bear Box (~18 strawberries)", price: 69 },
      { label: "Minnie Mouse Box", price: 50 },
      { label: "Present Bow Box (~28 strawberries)", price: 81 },
    ],
    image: "/images/strawberry-heart.jpg",
  },
  {
    slug: "brownie-box",
    name: "Personalised / Loaded Brownie Box",
    category: "Brownies",
    description:
      "Our freshly baked gooey Brownies and Blondies are available in a large variety of flavours. Our favourite is our best seller - Milk and White Chocolate Chunk!",
    details:
      "Brownie toppings include: Lotus, Snickers, Kinder Bueno, Salted caramel, Aero Mint, Terry's Orange, Oreo, Maltesers, Crunchie, Mini Egg, Nutella, Mars Bars, Fresh Strawbs, Kinder, Pistachio Spread. Brownies are best to consume within 7 days of collection.",
    variants: [
      { label: "16 brownie bites w/ 4 toppings", price: 25 },
      { label: "16 brownie bites w/ personalised message", price: 31 },
    ],
    image: "/images/platter.jpg",
  },
  {
    slug: "brownie-tray",
    name: "Brownie Tray",
    category: "Brownies",
    description:
      "Our freshly baked gooey Brownies are available in a large variety of flavours. Brownies are available in two options.",
    details:
      "A tray of 6 thick slices of Brownies. Flavours: Milk & White Chocolate Chunk, Lotus, Snickers, Kinder Bueno, Caramel, Aero Mint, Terry's Orange, Oreo, Maltesers, Crunchie, Creme Egg, Nutella, Reese's. Brownies are best to consume within 7 days.",
    variants: [{ label: "Tray of 6 thick slices", price: 23 }],
    image: "/images/platter.jpg",
  },
  {
    slug: "mixed-strawbs-brownies",
    name: "Mixed Box of Strawbs & Brownies",
    category: "Brownies",
    description:
      "Treat yourself to a delicious box of Brownies and Strawberries! This box contains 8 Brownie Bites and 12 Chocolate Strawberries.",
    details:
      "You can personalise this box to your requirements. Brownie toppings include: Lotus, Snickers, Kinder Bueno, Salted caramel, Aero Mint, Terry's Orange, Oreo, Maltesers, Crunchie, Mini Egg, Nutella, Mars Bars, Fresh Strawbs, Kinder, Pistachio Spread.",
    variants: [{ label: "Mixed Box", price: 40 }],
    image: "/images/treat-box.jpg",
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
      { label: "Old School Vanilla Sponge & Icing Cake", price: 19 },
      { label: "Old School Raspberry & Coconut", price: 19 },
      { label: "Old School Caramel & Chocolate", price: 19 },
      { label: "Mixed box of 2 flavours", price: 21 },
    ],
    image: "/images/birthday-basket.jpg",
  },
  {
    slug: "fondue-box",
    name: "Fondue Box",
    category: "Specialty",
    description: "We have two options for our fondue box!",
    details:
      "The Classic contains: Halal Marshmallows, Milk and White Chocolate Chunk Brownies, Strawberries ready to be dipped, Vanilla Waffle Bites, and a generous bowl of milk chocolate. The Signature adds: Brownie Bars, OG Milk Chocolate Strawberries, Choc chip cookies, and 2 bowls of milk/white chocolate.",
    variants: [
      { label: "Classic Fondue Box", price: 31 },
      { label: "Signature Fondue Box", price: 35 },
    ],
    image: "/images/treat-box.jpg",
  },
  {
    slug: "smash-box",
    name: "The Smash Box",
    category: "Specialty",
    description:
      "Within 'THE SMASHBOX' the recipient can smash through the Chocolate Heart to find cakesicles, chocolates and a heart gem.",
    details:
      "You may opt to provide us with the contents you want inside it. For example money, jewellery box or anything else that can sustain a hammer being whacked against it! The colour theme can be personalised to your requirements.",
    variants: [
      { label: "With Strawberries (full)", price: 56 },
      { label: "With Strawberries (smaller)", price: 44 },
      { label: "Without Strawberries/Cakesicles", price: 38 },
    ],
    image: "/images/strawberry-heart.jpg",
  },
  {
    slug: "number-smash-box",
    name: "The Number Smash Box",
    category: "Specialty",
    description:
      "This striking number is an enormous 14 inch Smashbox purely made out of our finest chocolate. Each are filled with an assortment of candy and gift cards.",
    details:
      "This offers a different birthday experience and something unique! This can be made up of one or two colours. Matching sprinkles will be added to your chosen number(s) accordingly. Contents include Skittles, M&M's, assortment of jelly and chocolate sweets.",
    variants: [
      { label: "Single number", price: 56 },
      { label: "Double digit", price: 100 },
    ],
    image: "/images/strawberry-heart.jpg",
  },
  {
    slug: "unicorn-chocolate-box",
    name: "The Unicorn Chocolate Box",
    category: "Chocolate Boxes",
    description:
      "Our new Unicorn Chocolate Box! This is such a perfect addition for little ones or anyone who wants a little bit of extra sweet magic at a celebration.",
    details:
      "The Unicorn Chocolate Box is filled with approximately 16 chocolate covered Strawberries. The message at the side of the box can be changed to your requirements. This Unicorn Chocolate Box is not available for postage.",
    variants: [{ label: "Unicorn Chocolate Box", price: 44 }],
    image: "/images/strawberry-tower.jpg",
  },
  {
    slug: "loaded-cookies",
    name: "Loaded Cookies",
    category: "Cookies & Biscuits",
    description:
      "Our Loaded Cookies is a great way to satisfy your sweet tooth cravings. The cookies have a vanilla cookie base filled with white and chocolate chips. The centre is then filled with your choice of filling and chocolate!",
    details:
      "Each cookie is approx 5.5 inch diameter. Heat them up to create a warm, gooey centre! A minimum of 4 has to be purchased. Toppings include: Milk or White Chocolate Buttons, Nutella, Kinder, Pistachio, Snickers, Biscoff, Cookies and cream, Cherry Bakewell, Jammie Dodger, Marshmallows, Happy Hippo, Freddo, Freddo Caramel, Choc Orange, Mini Aero, Malteser.",
    variants: [
      { label: "Loaded Cookie (min 4)", price: 5 },
      { label: "Regular Cookie", price: 3 },
    ],
    image: "/images/birthday-basket.jpg",
  },
  {
    slug: "rubiks-cube-cakes",
    name: "Rubik's Cube Cakes",
    category: "Cakesicles",
    description:
      "Our unique Rubik's Cube Cakes consist of a freshly baked cake coated in our premium Belgian chocolate. They are available in the flavours Vanilla and Chocolate Fudge.",
    details:
      "They are available in a variety of designs and toppings, all of which can be customised to your liking. These are best to consume within 2 weeks of collection/delivery. They are best to be stored in the fridge until consumption.",
    variants: [
      { label: "Set of 6", price: 31 },
      { label: "Set of 9", price: 44 },
      { label: "Set of 12", price: 50 },
    ],
    image: "/images/strawberry-tower.jpg",
  },
  {
    slug: "diy-kit",
    name: "DIY Strawberry & Cakesicle Kit",
    category: "Specialty",
    description:
      "We are so excited to release our own child friendly DIY KIT! This is an amazing activity for your children where they are given the opportunity to be creative and decorate our OG Strawberries and Cakesicles.",
    details:
      "Our Kits contain: Instructional Steps on how to carefully decorate your Treats, 5 Dipped Milk Chocolate Strawberries, 4 Dipped White Chocolate Cakesicles (Flavours are Vanilla & Chocolate Fudge), decorating supplies and sprinkles.",
    variants: [{ label: "DIY Kit", price: 31 }],
    image: "/images/treat-box.jpg",
  },
  {
    slug: "biscuits",
    name: "Biscuits",
    category: "Cookies & Biscuits",
    description:
      "Our Shortbread Biscuits can be created in any shape, colour and design to match your personalised requirements.",
    details:
      "They can be purchased on its own or you can add them to your bespoke Treat boxes. These can also be used as wedding favours or party favours. These can also be individually wrapped which incurs no extra charge. Biscuits can be posted nationally too!",
    variants: [{ label: "Each (from)", price: 4 }],
    image: "/images/birthday-basket.jpg",
  },
  {
    slug: "chocolate-covered-oreos",
    name: "Chocolate Covered Oreos",
    category: "Cookies & Biscuits",
    description:
      "Our delicious Oreo bites are coated with silky chocolate and edible toppings. They can also be customised to your requirements with different colours and toppings.",
    details:
      "These can also be individually wrapped. Chocolate Oreos are best to consume within 2 weeks of collection/delivery. Chocolate Oreos are available for Postal Orders.",
    variants: [
      { label: "Chocolate Covered Oreo", price: 4 },
      { label: "Minnie & Mickey Mouse Oreos", price: 4 },
    ],
    image: "/images/platter.jpg",
  },
  {
    slug: "cakesicle-cakepop-favours",
    name: "Cakesicle & Cakepop Favours",
    category: "Favours",
    description:
      "We can cater to making bespoke Favours to suit your requirements to celebrate a special occasion.",
    details:
      "Favours are priced individually as they are unique every time to bring your vision to life. Prices can vary higher or lower depending on your requests.",
    variants: [
      { label: "Cakesicle in cellophane & twist ribbon", price: 4.5 },
      { label: "Cakesicle in clear lid box with emblem & initials", price: 5.5 },
      { label: "Heart Gem in clear lid box with shredded paper", price: 5 },
      { label: "Cakepop in cellophane & twist ribbon", price: 4 },
    ],
    image: "/images/strawberry-tower.jpg",
  },
  {
    slug: "strawberry-favours",
    name: "Strawberry Favours",
    category: "Favours",
    description:
      "We can cater to making bespoke Favours to suit your requirements to celebrate a special occasion.",
    details:
      "Favours are priced individually as they are unique every time to bring your vision to life and we can cater to any personalised request.",
    variants: [],
    enquireOnly: true,
    image: "/images/strawberry-heart.jpg",
  },
  {
    slug: "baby-favours",
    name: "Baby Favours",
    category: "Favours",
    description:
      "We can cater to making bespoke Favours to suit your requirements to celebrate a special occasion.",
    details:
      "Please note, you are able to request anything for baby favours. We can cater to your personalised request. Prices can vary higher or lower depending on your requests.",
    variants: [
      { label: "3 Cakesicles", price: 14 },
      { label: "5 Cakesicles", price: 23 },
      { label: "Bento Cake", price: 13 },
    ],
    image: "/images/birthday-basket.jpg",
  },
  {
    slug: "luxury-chocolate-dates",
    name: "Luxury Chocolate Dates",
    category: "Specialty",
    description:
      "Our Dates are covered in luxury chocolate and can be topped with a variety of toppings.",
    details:
      "Toppings: Almond, Coconut, Pistachios, Edible Roses, Crushed oreo/lotus and many more! We also offer chocolate FILLED dates. Fillings include: Lotus, Peanut Butter, Nutella, Pistachio Spread, Milk Chocolate, and many more!",
    variants: [],
    enquireOnly: true,
    image: "/images/platter.jpg",
  },
];

export const categories = [
  "All",
  ...Array.from(new Set(products.map((p) => p.category))),
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
