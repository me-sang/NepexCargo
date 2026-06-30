"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { Logo } from "@/components/ui/Logo";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { label: "Bookings", href: "/dashboard/bookings", icon: BoxIcon },
  { label: "Rates", href: "/dashboard/rates/rate-cards", icon: TagIcon },
  { label: "Integrations", href: "/dashboard/integrations", icon: PlugIcon },
  { label: "Agents", href: "/dashboard/agents", icon: UsersIcon },
  { label: "Settings", href: "/dashboard/settings/profile", icon: CogIcon },
] as const;

type SidebarProps = { user: { name: string; email: string } };

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const initial = user.name.trim().charAt(0).toUpperCase() || "U";

  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col bg-[var(--color-brand)] text-white">
      <Link href="/dashboard" className="px-6 h-[78px] flex items-center">
        <Logo />
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-[13.5px] font-semibold transition-colors ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/85 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/15 px-3 py-4">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <span className="h-9 w-9 rounded-full bg-white text-[var(--color-brand)] inline-flex items-center justify-center font-bold text-[14px] shrink-0">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate">
              {user.name}
            </p>
            {user.email && (
              <p className="text-[11px] text-white/65 truncate">{user.email}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="mt-2 w-full text-left px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

const iconBase = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function HomeIcon() {
  return (
    <svg {...iconBase}>
      <path d="M3 11.5L12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg {...iconBase}>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg {...iconBase}>
      <path d="M3 12V4h8l10 10-8 8L3 12z" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PlugIcon() {
  return (
    <svg {...iconBase}>
      <path d="M9 3v6M15 3v6" />
      <path d="M6 9h12v3a6 6 0 11-12 0V9z" />
      <path d="M12 21v-3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg {...iconBase}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20a7 7 0 0114 0" />
      <path d="M16 11a3 3 0 100-6" />
      <path d="M17 20a7 7 0 015-6.7" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg {...iconBase}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  );
}
