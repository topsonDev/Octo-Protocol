/** Octo wordmark + octopus mark. Burgundy on dark. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 512 512"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <g
          stroke="var(--burgundy-bright)"
          strokeWidth="34"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M196 286 a92 92 0 1 1 104 -18 c14 26 12 52 -10 74" />
          <path d="M150 268 c-30 -2 -52 18 -52 44 c0 20 16 34 34 34 c14 0 24 -10 24 -22 c0 -10 -8 -16 -16 -16 c-7 0 -12 5 -12 11" />
          <path d="M210 300 c-18 18 -26 40 -22 60 c3 16 16 26 30 24 c12 -2 19 -12 17 -23 c-2 -9 -10 -13 -17 -11" />
          <path d="M268 312 c10 22 8 46 -6 62 c-11 12 -26 13 -36 4 c-9 -8 -9 -20 -1 -27 c7 -6 16 -5 20 1" />
          <path d="M306 296 c28 6 50 28 50 54 c0 20 -16 34 -34 34 c-14 0 -24 -10 -24 -22 c0 -10 8 -16 16 -16 c7 0 12 5 12 11" />
        </g>
      </svg>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        Octo
      </span>
    </span>
  );
}
