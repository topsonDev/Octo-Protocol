"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Docs", href: "/docs" },
  { label: "Developers", href: "#developers" },
  { label: "Company", href: "#company" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-black/60 px-5 py-2.5 backdrop-blur-md">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm text-foreground transition-colors hover:text-burgundy-bright"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-burgundy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-burgundy-bright"
          >
            Get started for free
          </Link>
          <Link
            href="#demo"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-white/40"
          >
            Book demo
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className="text-foreground">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-black/90 p-4 backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/signup"
              className="rounded-full bg-burgundy px-4 py-2 text-center text-sm font-medium text-white hover:bg-burgundy-bright"
            >
              Get started for free
            </Link>
            <Link
              href="#demo"
              className="rounded-full border border-white/20 px-4 py-2 text-center text-sm font-medium text-foreground"
            >
              Book demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
