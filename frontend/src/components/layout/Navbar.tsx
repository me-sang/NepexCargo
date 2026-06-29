"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";
import { UserMenu } from "./UserMenu";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "SERVICES", href: "/services" },
  { label: "ARTICLES", href: "/articles" },
  { label: "CONTACT", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  return (
    <nav className="relative z-50 bg-[var(--color-brand)] text-white">
      <div className="container-content">
        <div className="flex items-center justify-between h-[78px] gap-6">
          <Logo />

          {/* Desktop nav links — centered, flex-1 */}
          <div className="hidden lg:flex items-center gap-10 flex-1 justify-center">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-semibold tracking-[0.12em] text-white/95 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right controls */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {/* Country selector — single outlined pill */}
            <button
              type="button"
              className="flex items-center gap-2 pl-3 pr-3.5 h-10 rounded-full border border-white/45 hover:border-white/85 transition-colors text-[13px] font-semibold text-white"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
              </svg>
              <span>Country</span>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                <path d="M6 8.5L1.5 4h9z" />
              </svg>
            </button>

            {/* Auth slot — width reserved during session-loading to avoid jump */}
            {status === "loading" ? (
              <div className="h-10 w-[110px]" aria-hidden="true" />
            ) : isAuthed ? (
              <UserMenu />
            ) : (
              <a
                href="/login"
                className="inline-flex items-center justify-center h-10 px-7 rounded-full text-[13px] font-semibold bg-white text-[var(--color-brand)] hover:bg-white/95 transition-colors"
              >
                Login
              </a>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 -mr-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-1 border-t border-white/15">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-2 py-3 text-[13px] font-semibold tracking-[0.12em] text-white/95 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isAuthed ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  void signOut({ callbackUrl: "/" });
                }}
                className="block w-full text-left mt-2 px-2 py-3 text-[13px] font-semibold text-white"
              >
                Sign out →
              </button>
            ) : (
              <a
                href="/login"
                className="block mt-2 px-2 py-3 text-[13px] font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Login →
              </a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
