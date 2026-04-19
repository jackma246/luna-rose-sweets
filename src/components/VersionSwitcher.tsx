"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function VersionSwitcher() {
  const pathname = usePathname() ?? "";
  const isClassic = pathname.startsWith("/classic");
  const target = isClassic ? "/" : "/classic";
  const label = isClassic ? "View new design →" : "View classic →";

  return (
    <Link href={target} className="version-switch" aria-label={label}>
      {label}
    </Link>
  );
}
