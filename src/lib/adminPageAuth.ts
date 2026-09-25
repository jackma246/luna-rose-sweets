import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

/**
 * Server-side auth gate for /admin pages. Call it at the top of every admin
 * page (not in a layout: layouts are skipped on client-side navigation, so a
 * layout check does not protect the page's own data). It works independently
 * of the proxy, which is only an optimistic first check.
 */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/admin/login");
}
