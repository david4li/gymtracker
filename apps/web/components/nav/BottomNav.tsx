"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, BOTTOM_NAV_HREFS } from "@/lib/nav-config";

function isActive(pathname: string, href: string, matchPrefix?: string) {
  if (href === "/") return pathname === "/";
  if (matchPrefix) return pathname.startsWith(matchPrefix);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => BOTTOM_NAV_HREFS.includes(item.href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-black/10 bg-white/95 backdrop-blur md:hidden dark:border-white/10 dark:bg-black/95">
      {items.map((item) => {
        const active = isActive(pathname, item.href, item.matchPrefix);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${
              active ? "text-orange-600" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <Icon width={22} height={22} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
