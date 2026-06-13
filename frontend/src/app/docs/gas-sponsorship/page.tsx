import Link from "next/link";
import { Prose, Callout, Code } from "@/components/docs/DocsUI";

export default function GasSponsorship() {
  return (
    <Prose>
      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-bright">
          Essentials
        </p>
        <span className="rounded-full border border-burgundy/40 bg-burgundy/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-burgundy-bright">
          Coming soon
        </span>
      </div>
      <h1 className="mt-2 text-4xl font-semibold text-foreground">
        Gas sponsorship
      </h1>

      <p>
        Soon, app developers will be able to <strong>sponsor their users&apos;
        Stellar transactions</strong> directly from their master wallet — so
        users can transact without holding XLM to cover network fees.
      </p>

      <Callout type="warning">
        This feature is not available yet. The shape below is a preview and may
        change before release.
      </Callout>

      <h2>How it will work</h2>
      <p>
        Stellar natively supports fee-bump and sponsored-reserve operations: one
        account can pay the fees (and base reserves) for another account&apos;s
        transaction. Octo will let your master wallet act as that sponsor, so:
      </p>
      <ul>
        <li>
          your users can hold and move stablecoins without ever buying XLM for
          gas;
        </li>
        <li>
          fees come out of your master wallet, which you already top up and
          monitor;
        </li>
        <li>
          it&apos;s opt-in per wallet, with spend controls so sponsorship
          can&apos;t be abused.
        </li>
      </ul>

      <h2>Planned API (preview)</h2>
      <Code label="cURL (preview — not live)">{`# wrap a user's transaction so your master wallet pays the fee
curl -X POST http://localhost:8080/v1/wallets/<WALLET_ID>/sponsor \\
  -H "authorization: Bearer octo_sk_test_…" \\
  -H "content-type: application/json" \\
  -d '{ "transaction_xdr": "<user-signed-xdr>" }'`}</Code>

      <p>
        Want this sooner? Let us know your use case. In the meantime, see{" "}
        <Link href="/docs/getting-started">From 0 to integration</Link> for
        what&apos;s available today.
      </p>
    </Prose>
  );
}
