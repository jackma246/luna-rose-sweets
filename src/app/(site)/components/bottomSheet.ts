import type { CSSProperties } from "react";

/**
 * The cart's request form slides up as a bottom sheet. The form is taller than a small phone screen
 * (or a short laptop window), so the sheet is capped at the visible viewport and scrolls inside
 * itself; otherwise its top (title, name and email fields) sits above the screen and cannot be reached.
 */
export const BOTTOM_SHEET_STYLE: CSSProperties = {
  background: "#fff",
  borderRadius: "1.25rem 1.25rem 0 0",
  padding: "1.75rem 1.5rem calc(1.75rem + env(safe-area-inset-bottom))",
  width: "100%",
  maxWidth: 520,
  boxSizing: "border-box",
  maxHeight: "100dvh",
  overflowY: "auto",
  overscrollBehavior: "contain",
};
