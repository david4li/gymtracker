import type { ComponentType, SVGProps } from "react";
import {
  HomeIcon,
  DumbbellIcon,
  ClipboardIcon,
  PlayIcon,
  ChartIcon,
  ScaleIcon,
  CalendarIcon,
  SettingsIcon,
} from "@/components/ui/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Paths under here also count as "active" for nav highlighting purposes. */
  matchPrefix?: string;
};

/**
 * Single source of truth for top-level navigation, consumed by both the desktop
 * sidebar and the mobile bottom nav so they can never drift out of sync.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/workouts/active", label: "Workout", icon: PlayIcon, matchPrefix: "/workouts" },
  { href: "/exercises", label: "Exercises", icon: DumbbellIcon },
  { href: "/routines", label: "Routines", icon: ClipboardIcon },
  { href: "/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/body-stats", label: "Body Stats", icon: ScaleIcon },
  { href: "/programming", label: "Programming", icon: CalendarIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

/** Bottom nav on mobile shows a trimmed-down subset to keep tap targets big. */
export const BOTTOM_NAV_HREFS = ["/", "/workouts/active", "/exercises", "/analytics", "/settings"];
