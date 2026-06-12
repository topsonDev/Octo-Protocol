import Link from "next/link";
import { Logo } from "@/components/Logo";

/** Split-screen auth layout: form on the left, brand panel on the right. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: form */}
      <div className="relative flex flex-col px-6 py-8 sm:px-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          ‹ Home
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex justify-center">
              <Logo />
            </div>
            {children}
          </div>
        </div>

        <p className="mx-auto max-w-sm text-center text-xs text-muted">
          By signing up, you agree to our{" "}
          <Link href="#" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline">
            Conditions of use
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline">
            Privacy policy
          </Link>
          .
        </p>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden overflow-hidden border-l border-white/10 bg-burgundy-soft/20 lg:block">
        <div className="pointer-events-none absolute inset-0 glow-burgundy opacity-60" />
        {/* faint isometric grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--burgundy-bright) 1px, transparent 1px), linear-gradient(90deg, var(--burgundy-bright) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            transform: "perspective(800px) rotateX(55deg) scale(1.6)",
            transformOrigin: "top center",
          }}
        />
        <div className="relative flex h-full items-end px-12 pb-20">
          <div className="mx-auto max-w-md text-center">
            <span className="inline-block rounded-md bg-white/5 px-3 py-1 text-[11px] uppercase tracking-widest text-muted">
              Wallet Infrastructure
            </span>
            <h2 className="mt-6 text-2xl font-semibold leading-snug text-foreground">
              No <span className="text-muted">Complexity.</span> Just secure{" "}
              <span className="text-burgundy-bright">wallet infrastructure</span>{" "}
              for Fintechs
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              We help fintechs deliver secure, scalable, and flexible
              enterprise-grade wallet solutions on Stellar. Empower your customers
              to unlock the power of stablecoins, whether abstracted away or fully
              integrated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
