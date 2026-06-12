/** Small presentational primitives for the docs pages (Blockradar-style). */

export function Callout({
  type = "note",
  children,
}: {
  type?: "note" | "warning" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    note: "border-white/15 bg-white/[0.03] text-muted",
    warning: "border-burgundy/40 bg-burgundy/10 text-burgundy-bright",
    tip: "border-burgundy/30 bg-burgundy-soft/30 text-foreground",
  }[type];
  const icon = { note: "ℹ", warning: "⚠", tip: "✦" }[type];
  return (
    <div className={`my-5 flex gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <span className="select-none">{icon}</span>
      <div className="[&_a]:underline">{children}</div>
    </div>
  );
}

export function Code({
  children,
  label,
}: {
  children: string;
  label?: string;
}) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-white/10 bg-black/60">
      {label && (
        <div className="border-b border-white/10 px-4 py-2 text-xs text-muted">
          {label}
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-foreground/85">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mb-10 border-l border-white/10 pl-8">
      <span className="absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-burgundy text-xs font-semibold text-white">
        {n}
      </span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-muted [&_a]:text-burgundy-bright [&_a]:underline [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  );
}

export function ParamTable({
  rows,
}: {
  rows: { name: string; type: string; required?: boolean; desc: string }[];
}) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/[0.03] text-xs text-muted">
          <tr>
            <th className="px-4 py-2.5">Field</th>
            <th className="px-4 py-2.5">Type</th>
            <th className="px-4 py-2.5">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="px-4 py-3 font-mono text-foreground">
                {r.name}
                {r.required && (
                  <span className="ml-1 text-[10px] text-burgundy-bright">
                    required
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-muted">{r.type}</td>
              <td className="px-4 py-3 text-muted">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Endpoint({ method, path }: { method: string; path: string }) {
  const color =
    {
      GET: "bg-emerald-500/15 text-emerald-300",
      POST: "bg-burgundy/30 text-burgundy-bright",
    }[method] ?? "bg-white/10 text-foreground";
  return (
    <div className="my-4 flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-4 py-2.5">
      <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${color}`}>
        {method}
      </span>
      <code className="font-mono text-sm text-foreground">{path}</code>
    </div>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl text-sm leading-relaxed text-muted [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_strong]:text-foreground [&_a]:text-burgundy-bright [&_a]:underline [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-foreground">
      {children}
    </div>
  );
}
