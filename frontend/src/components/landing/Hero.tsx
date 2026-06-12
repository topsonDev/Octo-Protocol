import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:pt-28">
      {/* burgundy glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] glow-burgundy" />

      <div className="relative mx-auto max-w-6xl">
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl">
          <span className="text-foreground">No </span>
          <span className="text-burgundy-bright">Complexity</span>
          <span className="text-foreground">. Just secure </span>
          <span className="text-burgundy-bright">wallet infrastructure</span>
          <span className="text-foreground"> for fintechs</span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Our Wallet-as-a-Service product provides fintechs with secure, scalable
          wallet infrastructure to power stablecoin transactions on Stellar.
          Whether abstracted or fully integrated, empower your customers while
          delivering enterprise-grade security and flexibility.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-burgundy px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-burgundy-bright"
          >
            Get started for free
          </Link>
          <Link
            href="#demo"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-white/40"
          >
            Book demo
          </Link>
          <Link
            href="#developers"
            className="text-sm font-medium text-foreground underline decoration-burgundy-bright/60 underline-offset-4 transition-colors hover:text-burgundy-bright"
          >
            Explore our API docs ↗
          </Link>
        </div>

        {/* Dashboard preview mockup */}
        <DashboardPreview />
      </div>
    </section>
  );
}

function DashboardPreview() {
  const stats = [
    { label: "Cumulative Balance", value: "$521,346.93", sub: "+12% vs last week" },
    { label: "Unswept Balance", value: "$2,208.78", sub: "Retry sweep" },
    { label: "No. of Assets", value: "35", sub: "+10 new this week" },
    { label: "No. of Master Wallets", value: "6", sub: "+1 new this week" },
  ];

  return (
    <div className="mt-16 overflow-hidden rounded-2xl border border-white/10 bg-burgundy-soft/40 shadow-2xl">
      <div className="flex">
        {/* sidebar */}
        <aside className="hidden w-56 shrink-0 border-r border-white/10 p-4 sm:block">
          <div className="rounded-lg border border-white/10 px-3 py-2 text-sm text-muted">
            octo ▾
          </div>
          <div className="mt-2 flex items-center gap-2 px-3 text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-burgundy-bright" />
            Stellar · Testnet
          </div>
          <nav className="mt-6 space-y-1 text-sm">
            {["Overview", "Assets", "Transactions", "Addresses", "Developers"].map(
              (item, i) => (
                <div
                  key={item}
                  className={`rounded-lg px-3 py-2 ${
                    i === 0
                      ? "bg-burgundy/30 text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {item}
                </div>
              ),
            )}
          </nav>
        </aside>

        {/* main */}
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Octo</h3>
              <p className="text-xs text-muted">
                Here&apos;s everything happening with your payments in Octo
              </p>
            </div>
            <div className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-muted">
              Get Report
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <p className="text-[11px] text-muted">{s.label}</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] text-burgundy-bright">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-foreground">Master Wallets</p>
            <div className="mt-3 flex gap-2">
              {["O", "C", "T", "P", "+2"].map((b) => (
                <span
                  key={b}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/40 text-xs text-muted"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
