const CASES = [
  {
    title: "Cross-border B2B payments",
    body: "Simplify and expedite international business transactions with stablecoins, reducing fees and settlement times compared to traditional banking.",
  },
  {
    title: "Stablecoin checkout",
    body: "Accept stablecoin payments with dedicated addresses and real-time deposit notifications, reconciled automatically to each customer.",
  },
  {
    title: "Treasury & payouts",
    body: "Hold balances in one master wallet per chain and disburse payouts programmatically with idempotent, signed withdrawals.",
  },
  {
    title: "Gas sponsorship",
    body: "Sponsor your users' Stellar transactions from your master wallet so they can transact without holding XLM for fees — abstracting gas away entirely.",
    soon: true,
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <h2 className="font-display text-5xl text-foreground sm:text-7xl">
            Use
            <br />
            cases
          </h2>
          <p className="max-w-md text-muted">
            Learn how fintechs use Octo to launch stablecoin rails that can be
            tailored to local use cases but also built to scale across borders.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CASES.map((c) => (
            <div
              key={c.title}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-burgundy-soft/40 to-black/40 p-7"
            >
              <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-burgundy/20 blur-3xl" />
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl text-foreground">
                  {c.title}
                </h3>
                {"soon" in c && c.soon && (
                  <span className="rounded-full border border-burgundy/40 bg-burgundy/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-burgundy-bright">
                    Coming soon
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{c.body}</p>
              {!("soon" in c && c.soon) && (
                <a
                  href="#"
                  className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-burgundy-bright"
                >
                  Read more ›
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
