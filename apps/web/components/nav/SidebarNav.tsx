"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-config";
import { DumbbellIcon } from "@/components/ui/icons";

function isActive(pathname: string, href: string, matchPrefix?: string) {
  if (href === "/") return pathname === "/";
  if (matchPrefix) return pathname.startsWith(matchPrefix);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r md:border-black/10 md:bg-white/60 md:dark:border-white/10 md:dark:bg-white/[0.02]">
      <div className="flex items-center gap-2 px-5 py-5">
        <DumbbellIcon className="text-orange-600" />
        <span className="text-lg font-semibold tracking-tight">GymTracker</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.matchPrefix);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-600 text-white"
                  : "text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="shrink-0" width={20} height={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-xs text-zinc-400">Synced to your account</div>
    </aside>
  );
}
