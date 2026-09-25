import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/adminPageAuth";

// page.tsx here is a client component, so the server-side auth gate lives in
// this segment layout instead. The page renders an empty form and loads no data.
export default async function Layout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return children;
}
