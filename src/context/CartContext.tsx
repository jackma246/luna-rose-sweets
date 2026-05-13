"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartItem {
  productSlug: string;
  variantLabel: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  flavour?: string;
  note?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productSlug: string, variantLabel: string) => void;
  updateQuantity: (productSlug: string, variantLabel: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.productSlug === item.productSlug &&
            i.variantLabel === item.variantLabel &&
            i.flavour === item.flavour &&
            i.note === item.note &&
            i.price === item.price
        );
        if (existing) {
          return prev.map((i) =>
            i.productSlug === item.productSlug &&
            i.variantLabel === item.variantLabel &&
            i.flavour === item.flavour &&
            i.note === item.note &&
            i.price === item.price
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((productSlug: string, variantLabel: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productSlug === productSlug && i.variantLabel === variantLabel)
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productSlug: string, variantLabel: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productSlug, variantLabel);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productSlug === productSlug && i.variantLabel === variantLabel
            ? { ...i, quantity }
            : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
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
