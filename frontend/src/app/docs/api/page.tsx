import Link from "next/link";
import { Prose, Code } from "@/components/docs/DocsUI";

export default function ApiOverview() {
  return (
    <Prose>
      <p className="text-xs font-semibold uppercase tracking-wide text-burgundy-bright">
        API Reference
      </p>
      <h1 className="mt-2 text-4xl font-semibold text-foreground">Overview</h1>

      <p>
        The Octo API is a JSON REST API. The base URL in local development is{" "}
        <code>http://localhost:8080</code>.
      </p>

      <h2>Response envelope</h2>
      <p>Every response uses the same envelope:</p>
      <Code>{`{
  "statusCode": 200,
  "message": "OK",
  "data": { /* object or array */ }
}`}</Code>
      <ul>
        <li>
          <code>statusCode</code> — mirrors the HTTP status.
        </li>
        <li>
          <code>message</code> — a short human-readable summary, or the error
          reason.
        </li>
        <li>
          <code>data</code> — the result (object or array), or <code>null</code>{" "}
          on error.
        </li>
      </ul>

      <h2>Errors</h2>
      <p>Errors use standard HTTP status codes and the same envelope:</p>
      <ul>
        <li>
          <code>400</code> — invalid request (bad input).
        </li>
        <li>
          <code>401</code> — missing or invalid credentials.
        </li>
        <li>
          <code>404</code> — not found, or not authorized for this resource.
        </li>
        <li>
          <code>409</code> — conflict (e.g. a reused idempotency key).
        </li>
      </ul>

      <p>
        Next: <Link href="/docs/api/authentication">Authentication</Link>.
      </p>
    </Prose>
  );
}
