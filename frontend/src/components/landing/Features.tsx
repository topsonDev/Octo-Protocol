const FEATURES = [
  {
    title: "Treasury\nManagement",
    body: "Funds land directly in your master wallet via muxed accounts — no sweeping, no per-user reserves, automated settlement.",
    log: ["Deposit detected", "Attributed to customer", "Webhook delivered"],
  },
  {
    title: "Instant\nWithdrawals",
    body: "Sign and submit payouts from your master wallet through one API, with idempotency keys that make double-spends impossible.",
    log: ["Withdrawal signed", "Submitted to Stellar", "Confirmed on-chain"],
  },
  {
    title: "Real-time\nDeposit Tracking",
    body: "Stream deposits as they confirm, attributed to the right customer by muxed id or memo — credited only once.",
    log: ["Payment received", "Successful: true", "Recorded (idempotent)"],
  },
  {
    title: "Dedicated\nAddresses",
    body: "Generate a unique deposit address per customer instantly and off-chain. Each comes with a G…+memo fallback for any sender.",
    log: ["M-address generated", "G…+memo fallback", "Metadata attached"],
  },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
          <h2 className="font-display text-5xl text-foreground sm:text-6xl">
            Our core
            <br />
            features
          </h2>
          <p className="max-w-md text-muted">
            Plug-and-play APIs, non-custodial wallets, automated settlement, and
            built-in security — simplifying blockchain complexity so you can
            focus on your customers.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  log,
}: {
  title: string;
  body: string;
  log: string[];
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-burgundy-soft/50 to-black/40 p-7 transition-colors hover:border-burgundy/50">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-burgundy/20 blur-3xl transition-opacity group-hover:opacity-80" />
      <h3 className="font-display whitespace-pre-line text-2xl text-foreground">
        {title}
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{body}</p>

      <a
        href="#"
        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-burgundy-bright"
      >
        Learn more ›
      </a>

      {/* mini activity-log preview */}
      <div className="mt-7 rounded-xl border border-white/10 bg-black/40 p-4">
        <p className="text-[11px] uppercase tracking-wide text-muted">
          Activity Log
        </p>
        <ul className="mt-3 space-y-2">
          {log.map((line) => (
            <li key={line} className="flex items-center gap-2 text-xs text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-burgundy-bright" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
