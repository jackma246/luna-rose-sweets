import Link from "next/link";
import Image from "next/image";
import { visibleProducts as products, categories, type Product } from "@/data/products";
import V2Header from "../components/V2Header";
import V2Footer from "../components/V2Footer";
import SortSelect from "./SortSelect";
import MobileFilters from "./MobileFilters";

type SearchParams = Promise<{
  category?: string;
  sort?: string;
  q?: string;
}>;

function minPrice(p: Product): number {
  if (p.variants.length === 0) return Infinity;
  return Math.min(...p.variants.map((v) => v.price));
}

function priceLabel(p: Product): string {
  if (p.enquireOnly) return "Enquire";
  if (p.variants.length === 0) return "";
  const min = minPrice(p);
  const max = Math.max(...p.variants.map((v) => v.price));
  return min === max ? `$${min}` : `from $${min}`;
}

function matchesQuery(p: Product, q: string): boolean {
  const hay = `${p.name} ${p.category} ${p.description}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category = "All", sort = "featured", q = "" } = await searchParams;

  const uniqueProducts = products.filter(
    (p, i, arr) => arr.findIndex((q) => q.name === p.name) === i
  );

  const categoryCounts = new Map<string, number>();
  for (const cat of categories) {
    if (cat === "All") categoryCounts.set(cat, uniqueProducts.length);
    else categoryCounts.set(cat, products.filter((p) => p.category === cat).length);
  }

  let filtered =
    category === "All"
      ? [...uniqueProducts]
      : products.filter((p) => p.category === category);

  if (q.trim()) filtered = filtered.filter((p) => matchesQuery(p, q.trim()));

  if (sort === "price-low") {
    filtered.sort((a, b) => minPrice(a) - minPrice(b));
  } else if (sort === "price-high") {
    filtered.sort((a, b) => {
      const aMax = a.variants.length ? Math.max(...a.variants.map((v) => v.price)) : 0;
      const bMax = b.variants.length ? Math.max(...b.variants.map((v) => v.price)) : 0;
      return bMax - aMax;
    });
  } else if (sort === "a-z") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  function catHref(cat: string): string {
    const params = new URLSearchParams();
    if (cat !== "All") params.set("category", cat);
    if (sort !== "featured") params.set("sort", sort);
    if (q) params.set("q", q);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <>
      <V2Header current="shop" />

      <section className="shop-hero">
        <div className="kicker">The Collection</div>
        <h1>
          Every <em>sweet thing</em>
          <br />
          we make.
        </h1>
        <p>All bakes are made to order and hand-finished.</p>
      </section>

      <section className="shop-body">
        <MobileFilters>
          <h5>Category</h5>
          <ul>
            {categories.map((cat) => {
              const count = categoryCounts.get(cat) ?? 0;
              const active = cat === category || (cat === "All" && category === "All");
              return (
                <li key={cat}>
                  <Link href={catHref(cat)} className={active ? "active" : undefined}>
                    {cat}
                    <span>{count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {(category !== "All" || sort !== "featured" || q) && (
            <Link href="/products" className="clear">
              Clear filters
            </Link>
          )}
        </MobileFilters>

        <div>
          <div className="shop-toolbar">
            <div className="count">
              {q ? (
                <>
                  Results for <b>&ldquo;{q}&rdquo;</b> · {filtered.length} treat
                  {filtered.length !== 1 ? "s" : ""}
                </>
              ) : (
                <>
                  Showing <b>{filtered.length} treat{filtered.length !== 1 ? "s" : ""}</b>
                </>
              )}
            </div>
            <SortSelect />
          </div>
          <div className="shop-grid">
            {filtered.length === 0 && (
              <div className="shop-empty">
                No treats match those filters — try clearing them.
              </div>
            )}
            {filtered.map((product) => {
              const img = product.image ?? product.variants[0]?.image;
              return (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className="product"
                >
                  {product.enquireOnly && (
                    <div className="ribbon-tag cocoa">Made to order</div>
                  )}
                  <div className="thumb">
                    {img && (
                      <Image
                        src={img}
                        alt={product.name}
                        width={600}
                        height={600}
                      />
                    )}
                  </div>
                  <div className="info">
                    <h3>{product.name}</h3>
                    <div className="caption">{product.category}</div>
                    <div className="price">{priceLabel(product)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <V2Footer />
    </>
  );
}
