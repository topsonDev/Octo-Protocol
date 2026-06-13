"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const SECTIONS = [
  {
    title: "Introduction",
    links: [{ label: "Why Octo", href: "/docs" }],
  },
  {
    title: "Getting Started",
    links: [
      { label: "From 0 to integration", href: "/docs/getting-started" },
    ],
  },
  {
    title: "API Reference",
    links: [
      { label: "Overview", href: "/docs/api" },
      { label: "Authentication", href: "/docs/api/authentication" },
      { label: "Addresses", href: "/docs/api/addresses" },
      { label: "Balances & Transactions", href: "/docs/api/reads" },
      { label: "Withdrawals", href: "/docs/api/withdrawals" },
    ],
  },
  {
    title: "Essentials",
    links: [
      { label: "Webhooks", href: "/docs/webhooks" },
      { label: "Gas sponsorship", href: "/docs/gas-sponsorship", soon: true },
      { label: "Security", href: "/docs/security" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-black/40 px-4 py-6 lg:block">
      <Link href="/" className="mb-8 block">
        <Logo />
      </Link>

      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted/70">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.links.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? "bg-burgundy/25 text-foreground"
                        : "text-muted hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <span className="flex-1">{l.label}</span>
                    {"soon" in l && l.soon && (
                      <span className="rounded-full border border-burgundy/40 px-1.5 py-0.5 text-[9px] uppercase text-burgundy-bright">
                        Soon
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
