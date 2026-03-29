"use client";

import { useState, useMemo } from "react";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";

type SortOption = "default" | "price-low" | "price-high" | "a-z";
type StockFilter = "all" | "in-stock" | "enquire";
type PriceFilter = "all" | "under-10" | "10-25" | "25-50" | "50-plus";

export default function MobileProductGrid() {
  const [sort, setSort] = useState<SortOption>("default");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];

    // Stock / availability filter
    if (stockFilter === "in-stock") {
      result = result.filter((p) => !p.enquireOnly && p.variants.length > 0);
    } else if (stockFilter === "enquire") {
      result = result.filter((p) => p.enquireOnly);
    }

    // Price filter
    if (priceFilter !== "all") {
      result = result.filter((p) => {
        if (p.variants.length === 0) return false;
        const min = Math.min(...p.variants.map((v) => v.price));
        switch (priceFilter) {
          case "under-10":
            return min < 10;
          case "10-25":
            return min >= 10 && min <= 25;
          case "25-50":
            return min > 25 && min <= 50;
          case "50-plus":
            return min > 50;
          default:
            return true;
        }
      });
    }

    // Sort
    if (sort === "price-low") {
      result.sort((a, b) => {
        const aMin = a.variants.length > 0 ? Math.min(...a.variants.map((v) => v.price)) : Infinity;
        const bMin = b.variants.length > 0 ? Math.min(...b.variants.map((v) => v.price)) : Infinity;
        return aMin - bMin;
      });
    } else if (sort === "price-high") {
      result.sort((a, b) => {
        const aMin = a.variants.length > 0 ? Math.min(...a.variants.map((v) => v.price)) : 0;
        const bMin = b.variants.length > 0 ? Math.min(...b.variants.map((v) => v.price)) : 0;
        return bMin - aMin;
      });
    } else if (sort === "a-z") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [sort, stockFilter, priceFilter]);

  const hasActiveFilters = stockFilter !== "all" || priceFilter !== "all" || sort !== "default";

  return (
    <section className="md:hidden px-4 pt-6 pb-10">
      <h2 className="font-serif text-2xl font-bold text-heading text-center mb-1 tracking-tight">
        Best Sellers
      </h2>
      <p className="text-foreground/50 text-center mb-5 text-xs tracking-wide uppercase">
        Our most-loved treats
      </p>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-md bg-card-bg text-foreground text-sm font-medium border border-accent/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="12" y1="18" x2="20" y2="18" />
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
          <circle cx="10" cy="18" r="1.5" fill="currentColor" />
        </svg>
        {showFilters ? "Hide Filters" : "Filter & Sort"}
        {hasActiveFilters && (
          <span className="ml-1 w-2 h-2 rounded-full bg-heading" />
        )}
      </button>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 p-4 rounded-lg bg-card-bg border border-accent/15 space-y-4">
          {/* Availability */}
          <div>
            <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
              Availability
            </label>
            <div className="flex gap-2">
              {([["all", "All"], ["in-stock", "In Stock"], ["enquire", "Enquire"]] as const).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setStockFilter(value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      stockFilter === value
                        ? "bg-heading text-white"
                        : "bg-background text-foreground/70 border border-accent/20"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
              Price
            </label>
            <div className="flex flex-wrap gap-2">
              {([["all", "All"], ["under-10", "Under $10"], ["10-25", "$10–$25"], ["25-50", "$25–$50"], ["50-plus", "$50+"]] as const).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setPriceFilter(value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      priceFilter === value
                        ? "bg-heading text-white"
                        : "bg-background text-foreground/70 border border-accent/20"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
              Sort By
            </label>
            <div className="flex flex-wrap gap-2">
              {([["default", "Default"], ["price-low", "Price: Low"], ["price-high", "Price: High"], ["a-z", "A → Z"]] as const).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setSort(value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      sort === value
                        ? "bg-heading text-white"
                        : "bg-background text-foreground/70 border border-accent/20"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setStockFilter("all");
                setPriceFilter("all");
                setSort("default");
              }}
              className="text-xs text-accent underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Product count */}
      <div className="flex justify-end mb-3">
        <span className="text-xs text-foreground/50">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-foreground/50 text-sm py-8">
          No products match your filters.
        </p>
      )}
    </section>
  );
}
