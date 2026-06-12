const LOGOS = ["Coinbase", "Nestcoin", "Uber", "Paystack", "PayPal", "Turing", "Andela", "Discover"];

const CODE = `curl --request POST \\
  --url https://api.octo.dev/v1/wallets/{walletId}/addresses \\
  --header 'Authorization: Bearer YOUR_API_KEY' \\
  --data '{
    "customer_ref": "user_8492",
    "metadata": { "plan": "pro" }
  }'`;

export function Developers() {
  return (
    <section id="developers" className="relative overflow-hidden px-4 py-24">
      {/* logos */}
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm text-muted">
          Trusted by teams across blockchain, finance, and emerging technology
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="text-lg font-semibold tracking-tight text-foreground/40"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* developer centric */}
      <div className="relative mx-auto mt-24 max-w-6xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 glow-burgundy" />
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-5xl text-burgundy-bright sm:text-6xl">
              Developer
              <br />
              centric
            </h2>
            <p className="mt-6 max-w-md text-muted">
              Our stablecoin wallet solutions come with developer-friendly APIs
              that are blockchain-native and integrate seamlessly into your
              existing tech stack, so you can deploy in a day, not months.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/60">
            <div className="flex items-center gap-4 border-b border-white/10 px-4 py-2.5 text-xs text-muted">
              {["cURL", "Python", "JavaScript", "PHP", "Go", "Java"].map(
                (t, i) => (
                  <span
                    key={t}
                    className={
                      i === 0
                        ? "rounded-md bg-white/10 px-2 py-1 text-foreground"
                        : ""
                    }
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/80">
              <code>{CODE}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
