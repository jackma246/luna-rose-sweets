"use client";

import { createContext, useContext, useCallback, useSyncExternalStore, ReactNode } from "react";
import type { LineSelection } from "@/lib/pricing";

export interface InspirationImage {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface CartItem {
  /** Stable id for this cart line. Two lines of the same product with different options stay separate. */
  lineId: string;
  productSlug: string;
  variantLabel: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  flavour?: string;
  note?: string;
  /** Structured options the price was computed from; the server re-prices the line from these. */
  selection?: LineSelection;
  inspirationImages?: InspirationImage[];
  /** Photos that were attached but could not be kept across a page reload (browser storage full). */
  droppedImageCount?: number;
}

export type NewCartItem = Omit<CartItem, "quantity" | "lineId" | "droppedImageCount">;

export const MAX_LINE_QUANTITY = 999;

interface CartContextType {
  items: CartItem[];
  /** False during server render and the first client render, before the saved cart is read. */
  hydrated: boolean;
  addItem: (item: NewCartItem, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

// ── Persistence ─────────────────────────────────────────────────────────────
// Versioned key: bump the version when CartItem changes shape so old carts are dropped, not misread.
export const CART_STORAGE_KEY = "dipsprinkle.cart.v1";

const EMPTY: CartItem[] = [];

function newLineId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `line-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function isImage(value: unknown): value is InspirationImage {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === "string" && typeof v.type === "string" && typeof v.size === "number" && typeof v.dataUrl === "string" && v.dataUrl.length > 0;
}

/** Validate one stored line; returns null for anything malformed so a corrupt entry cannot break the cart. */
export function sanitizeStoredItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.lineId !== "string" || !v.lineId) return null;
  if (typeof v.productSlug !== "string" || typeof v.variantLabel !== "string" || typeof v.name !== "string") return null;
  if (typeof v.price !== "number" || !Number.isFinite(v.price) || v.price < 0) return null;
  if (typeof v.quantity !== "number" || !Number.isInteger(v.quantity) || v.quantity < 1 || v.quantity > MAX_LINE_QUANTITY) return null;
  const item: CartItem = {
    lineId: v.lineId,
    productSlug: v.productSlug,
    variantLabel: v.variantLabel,
    name: v.name,
    price: v.price,
    quantity: v.quantity,
  };
  if (typeof v.image === "string") item.image = v.image;
  if (typeof v.flavour === "string") item.flavour = v.flavour;
  if (typeof v.note === "string") item.note = v.note;
  if (v.selection && typeof v.selection === "object") item.selection = v.selection as LineSelection;
  const rawImages = Array.isArray(v.inspirationImages) ? v.inspirationImages : [];
  const images = rawImages.filter(isImage);
  if (images.length > 0) item.inspirationImages = images;
  const previouslyDropped = typeof v.droppedImageCount === "number" ? v.droppedImageCount : 0;
  const dropped = previouslyDropped + (rawImages.length - images.length);
  if (dropped > 0) item.droppedImageCount = dropped;
  return item;
}

export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeStoredItem).filter((i): i is CartItem => i !== null);
  } catch {
    return [];
  }
}

function isQuotaError(err: unknown): boolean {
  return err instanceof DOMException && (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
}

/** The saved copy without photo data: photos are the heavy part of a cart. */
export function withoutPhotoData(items: CartItem[]): CartItem[] {
  return items.map((item) =>
    item.inspirationImages?.length
      ? { ...item, inspirationImages: item.inspirationImages.map((img) => ({ ...img, dataUrl: "" })) }
      : item,
  );
}

function persist(items: CartItem[]): void {
  try {
    if (items.length === 0) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    if (!isQuotaError(err)) return; // storage disabled (private mode etc.): the cart still works for this visit
    // Keep the cart itself and drop the photo data from the saved copy only. This visit keeps the photos
    // in memory; after a reload the cart tells the customer which photos were not kept.
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(withoutPhotoData(items)));
    } catch {
      // still too large or unavailable - nothing more to do
    }
  }
}

let cache: CartItem[] | null = null;
const listeners = new Set<() => void>();

function readCart(): CartItem[] {
  if (cache === null) {
    try {
      cache = parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
    } catch {
      cache = [];
    }
  }
  return cache;
}

function writeCart(next: CartItem[]): void {
  cache = next;
  persist(next);
  for (const listener of listeners) listener();
}

function onStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== CART_STORAGE_KEY) return;
  cache = null; // another tab changed the cart: re-read on next snapshot
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const getServerSnapshot = () => EMPTY;
const noopSubscribe = () => () => {};

function sameOptions(a: CartItem, b: NewCartItem): boolean {
  return (
    !a.droppedImageCount &&
    a.productSlug === b.productSlug &&
    a.variantLabel === b.variantLabel &&
    a.name === b.name &&
    a.price === b.price &&
    a.image === b.image &&
    a.flavour === b.flavour &&
    a.note === b.note &&
    JSON.stringify(a.selection ?? null) === JSON.stringify(b.selection ?? null) &&
    JSON.stringify(a.inspirationImages ?? []) === JSON.stringify(b.inspirationImages ?? [])
  );
}

/** Pure cart reducers, exported for tests. Adding merges into a line only when every option is identical. */
export function addLine(items: CartItem[], item: NewCartItem, quantity: number, lineId = newLineId()): CartItem[] {
  const qty = Math.max(1, Math.min(MAX_LINE_QUANTITY, Math.floor(quantity)));
  const existing = items.find((i) => sameOptions(i, item));
  if (existing) {
    return items.map((i) =>
      i.lineId === existing.lineId ? { ...i, quantity: Math.min(MAX_LINE_QUANTITY, i.quantity + qty) } : i,
    );
  }
  return [...items, { ...item, quantity: qty, lineId }];
}

export function removeLine(items: CartItem[], lineId: string): CartItem[] {
  return items.filter((i) => i.lineId !== lineId);
}

export function setLineQuantity(items: CartItem[], lineId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeLine(items, lineId);
  const qty = Math.min(MAX_LINE_QUANTITY, Math.floor(quantity));
  return items.map((i) => (i.lineId === lineId ? { ...i, quantity: qty } : i));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, readCart, getServerSnapshot);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const addItem = useCallback((item: NewCartItem, quantity = 1) => writeCart(addLine(readCart(), item, quantity)), []);
  const removeItem = useCallback((lineId: string) => writeCart(removeLine(readCart(), lineId)), []);
  const updateQuantity = useCallback(
    (lineId: string, quantity: number) => writeCart(setLineQuantity(readCart(), lineId, quantity)),
    [],
  );
  const clearCart = useCallback(() => writeCart([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, hydrated, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
