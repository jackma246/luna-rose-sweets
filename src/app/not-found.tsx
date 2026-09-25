import type { Metadata } from "next";
import SiteLayout from "./(site)/layout";
import NotFoundContent from "./(site)/components/NotFoundContent";

export const metadata: Metadata = { title: "Not found · Dip & Sprinkle", robots: { index: false } };

// Unmatched URLs anywhere in the app. Wrapped in the site layout so it carries the site's fonts and styles.
export default function NotFound() {
  return (
    <SiteLayout>
      <NotFoundContent />
    </SiteLayout>
  );
}
