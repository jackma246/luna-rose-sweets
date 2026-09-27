import type { Metadata } from "next";
import NotFoundContent from "./components/NotFoundContent";

export const metadata: Metadata = { title: "Not found · Dip & Sprinkle", robots: { index: false } };

// Rendered (with a 404 status) when a (site) page calls notFound(), e.g. an unknown product slug.
export default function SiteNotFound() {
  return <NotFoundContent />;
}
