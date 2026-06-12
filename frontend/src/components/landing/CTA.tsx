import Link from "next/link";

export function CTA() {
  return (
    <section id="demo" className="px-4 py-24">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-burgundy-soft/30 px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 glow-burgundy" />
        <p className="relative mx-auto max-w-2xl font-mono text-xl leading-relaxed text-foreground sm:text-2xl">
          Get started today and see how Octo simplifies blockchain integration,
          so you can focus on your customers while we take care of the
          complexity.
        </p>
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-burgundy-bright"
          >
            Book demo
          </Link>
          <Link
            href="#developers"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-white/40"
          >
            Explore our API docs ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
