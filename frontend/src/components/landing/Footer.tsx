import Link from "next/link";
import { Logo } from "@/components/Logo";

const COLUMNS = [
  {
    heading: "Developers",
    links: ["Documentation", "API Reference", "Status Page"],
  },
  {
    heading: "Resources",
    links: ["Terms of Service", "Privacy Policy", "Blog", "Brand Kit"],
  },
  {
    heading: "Company",
    links: ["About Us", "Contact Sales", "Security Overview", "Affiliate Program"],
  },
];

export function Footer() {
  return (
    <footer id="company" className="border-t border-white/10 px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">
            Our solutions are as simple as they are powerful, making stablecoin
            wallets accessible for every fintech.
          </p>
          <p className="mt-6 inline-block rounded-md border border-burgundy/40 px-3 py-1 text-sm text-burgundy-bright">
            hello@octo.dev
          </p>
          <p className="mt-4 text-xs text-muted">
            Stellar-native wallet infrastructure
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="text-sm font-semibold text-foreground">
              {col.heading}
            </h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l}>
                  <Link
                    href="#"
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between border-t border-white/10 pt-6 text-xs text-muted">
        <span>© {new Date().getFullYear()} Octo. All rights reserved.</span>
        <div className="flex gap-4">
          {["X", "IG", "in", "GH", "TG"].map((s) => (
            <Link key={s} href="#" className="hover:text-foreground">
              {s}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
