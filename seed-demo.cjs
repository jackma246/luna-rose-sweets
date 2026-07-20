/* Demo data for PII-free admin screenshots + workflow videos.
   All names are invented; all emails are @example.com. */
require("dotenv").config();
const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

const D = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
const item = (name, quantity, price) => ({ name, quantity, price });

// Friendly invented customers (NOT real)
const people = [
  "Ava Bennett", "Maria Lopez", "Jordan Kim", "Priya Patel", "Emma Clarke",
  "Sofia Rossi", "Hannah Lee", "Olivia Brown", "Noah Davis", "Mia Wong",
  "Grace Miller", "Chloe Adams", "Ruby Nguyen", "Liam Carter", "Zoe Tran",
];
const emailFor = (n) => n.toLowerCase().replace(/[^a-z]+/g, ".") + "@example.com";
const sources = ["website", "instagram", "tiktok", "fb_marketplace"];
const products = [
  ["Chocolate-dipped strawberries (dozen)", 1, 38],
  ["Cake pops — party set", 24, 60],
  ["Custom birthday cake — 8\"", 1, 95],
  ["Mini cupcakes (two dozen)", 2, 44],
  ["Dessert grazing box", 1, 120],
  ["Macaron tower", 1, 150],
  ["Brownie bites tray", 1, 35],
];

async function main() {
  await prisma.order.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.availabilityDate.deleteMany();
  await prisma.inventoryItem.deleteMany();

  // ---- Active pipeline (this week / overdue) ----
  const active = [
    ["Ava Bennett", "ready",            D(2026, 6, 28), "website",       [products[2]], 95, "Pickup 3pm"],
    ["Maria Lopez", "prepping",         D(2026, 6, 29), "instagram",     [products[1]], 60, ""],
    ["Jordan Kim",  "confirmed",        D(2026, 6, 30), "tiktok",        [products[4]], 120, "Nut-free"],
    ["Priya Patel", "deposit_received", D(2026, 7, 1),  "website",       [products[5]], 150, "Pastel colors"],
    ["Emma Clarke", "confirmed",        D(2026, 7, 2),  "fb_marketplace",[products[0]], 38, ""],
    ["Sofia Rossi", "prepping",         D(2026, 7, 3),  "instagram",     [products[3]], 44, "Gold sprinkles"],
    ["Hannah Lee",  "confirmed",        D(2026, 7, 4),  "website",       [products[6]], 35, ""],
    ["Noah Davis",  "pending",          D(2026, 7, 5),  "tiktok",        [products[1]], 60, "Blue + silver"],
  ];

  // ---- Completed history across the last 5 months (for P&L) ----
  const history = [];
  let pi = 0;
  for (const [mo, count] of [[2, 5], [3, 6], [4, 7], [5, 9], [6, 6]]) {
    for (let k = 0; k < count; k++) {
      const name = people[pi % people.length];
      const prod = products[(pi + k) % products.length];
      const day = 3 + ((pi * 7 + k * 5) % 24);
      history.push([
        name,
        "completed",
        D(2026, mo, day),
        sources[(pi + k) % sources.length],
        [prod],
        prod[2],
        "",
      ]);
      pi++;
    }
  }

  const all = [...active, ...history];
  for (const [name, status, neededDate, source, items, total, notes] of all) {
    await prisma.order.create({
      data: {
        customerName: name,
        customerEmail: emailFor(name),
        customerPhone: null,
        items,
        totalPrice: total,
        neededDate,
        customerNotes: notes || null,
        status,
        source,
      },
    });
  }

  // ---- Expenses across the same months ----
  const expenses = [
    [D(2026, 2, 5), 180, "Costco", "ingredient", "Chocolate, butter, flour"],
    [D(2026, 2, 18), 64, "Amazon", "packaging", "Boxes + ribbon"],
    [D(2026, 3, 6), 210, "Costco", "ingredient", "Bulk baking supplies"],
    [D(2026, 3, 22), 48, "Michaels", "supply", "Sprinkles + toppers"],
    [D(2026, 4, 4), 240, "Restaurant Depot", "ingredient", "Cream, sugar, fruit"],
    [D(2026, 4, 19), 72, "Amazon", "packaging", "Grazing boxes"],
    [D(2026, 5, 8), 265, "Costco", "ingredient", "Monthly restock"],
    [D(2026, 5, 25), 58, "Michaels", "supply", "Macaron mats"],
    [D(2026, 6, 7), 190, "Costco", "ingredient", "Chocolate + dairy"],
    [D(2026, 6, 20), 80, "Amazon", "packaging", "Boxes, bags, labels"],
  ];
  for (const [date, amount, vendor, category, notes] of expenses) {
    await prisma.expense.create({ data: { date, amount, vendor, category, notes } });
  }

  // ---- Availability (June 2026) ----
  const avail = [];
  for (let d = 1; d <= 30; d++) {
    let status = "available";
    if ([7, 14, 21, 28].includes(d)) status = "closed";          // Sundays off
    else if (d <= 27 && d % 1 === 0 && d >= 1) status = "fully_booked";
    if ([29, 30].includes(d)) status = "limited";
    avail.push({ date: D(2026, 6, d), status, note: status === "limited" ? "Only small orders left" : null });
  }
  for (const a of avail) await prisma.availabilityDate.create({ data: a });

  // ---- Inventory ----
  const inv = [
    ["Belgian chocolate", 18, "lbs", "ingredient", 5],
    ["Heavy cream", 12, "qt", "ingredient", 4],
    ["Gift boxes (medium)", 40, "ea", "packaging", 15],
    ["Satin ribbon", 6, "rolls", "supply", 3],
    ["Fresh strawberries", 8, "lbs", "ingredient", 6],
    ["Cupcake liners", 220, "ea", "packaging", 100],
  ];
  for (const [name, quantity, unit, category, lowStockThreshold] of inv) {
    await prisma.inventoryItem.create({ data: { name, quantity, unit, category, lowStockThreshold } });
  }

  const counts = {
    orders: await prisma.order.count(),
    expenses: await prisma.expense.count(),
    availability: await prisma.availabilityDate.count(),
    inventory: await prisma.inventoryItem.count(),
  };
  console.log("seeded:", JSON.stringify(counts));
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
