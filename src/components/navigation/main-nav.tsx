"use client";

import { BookOpen, ChartNoAxesColumn, RotateCcw, Settings2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDueReviewCount } from "@/features/review/use-review";
import { useT } from "@/features/settings/settings-store";
import type { Messages } from "@/lib/i18n/messages";

interface NavItem {
  href: "/" | "/review" | "/progress" | "/settings";
  label: keyof Pick<Messages["nav"], "learn" | "review" | "journal" | "settings">;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "learn", icon: BookOpen },
  { href: "/review", label: "review", icon: RotateCcw },
  { href: "/progress", label: "journal", icon: ChartNoAxesColumn },
  { href: "/settings", label: "settings", icon: Settings2 },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" || pathname === "/islamic-learning" : pathname.startsWith(href);
}

export function MainNav() {
  const pathname = usePathname();
  const dueCount = useDueReviewCount();
  const t = useT();

  return (
    <nav
      aria-label={t.nav.label}
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink/15 bg-card/95 backdrop-blur md:static md:border-0 md:bg-transparent md:backdrop-blur-none"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 md:flex md:max-w-none md:gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          const showBadge = href === "/review" && dueCount > 0;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 px-2 py-1.5 text-sm md:min-h-11 md:flex-row md:gap-2 md:rounded-md md:px-3 md:text-base ${
                  active
                    ? "font-semibold text-teal md:bg-teal-soft"
                    : "text-ink-soft hover:text-ink md:hover:bg-ink/5"
                }`}
              >
                <Icon aria-hidden="true" className="size-6 md:size-5" strokeWidth={active ? 2.5 : 2} />
                <span>{t.nav[label]}</span>
                {active ? (
                  <span aria-hidden="true" className="absolute top-0 h-1 w-8 rounded-b bg-teal md:hidden" />
                ) : null}
                {showBadge ? (
                  <span className="absolute right-[18%] top-1 min-w-5 rounded-full border-2 border-card bg-mango px-1 text-center text-xs font-semibold leading-4 text-ink md:static md:border-0">
                    {dueCount}
                    <span className="sr-only">{t.nav.dueSuffix}</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
