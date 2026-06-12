"use client";

import { Sidebar } from "./Sidebar";

/** Dashboard chrome: test-mode banner, sidebar, topbar, content. */
export function DashboardShell({
  email,
  title,
  onLogout,
  children,
}: {
  email?: string;
  title: string;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* test-mode banner */}
      <div className="bg-burgundy/20 py-2 text-center text-xs text-burgundy-bright">
        You are currently on <strong>test mode</strong> (Stellar testnet).
        Mainnet support is coming soon.
      </div>

      <div className="flex flex-1">
        <Sidebar email={email} />

        <div className="flex flex-1 flex-col">
          {/* topbar */}
          <header className="flex items-center justify-between border-b border-white/10 px-8 py-4">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm text-muted">
                Test Mode
                <span className="relative inline-block h-5 w-9 rounded-full bg-burgundy/40">
                  <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-burgundy-bright" />
                </span>
              </span>
              <button
                onClick={onLogout}
                className="text-sm text-muted transition-colors hover:text-foreground"
                title="Log out"
              >
                ⏻
              </button>
            </div>
          </header>

          <main className="flex-1 px-8 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
