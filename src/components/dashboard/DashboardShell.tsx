import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/smith/SiteHeader";
import { SmithLogo } from "@/components/smith/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", to: "/dashboard" as const },
  { label: "Forge", to: "/dashboard/forge" as const },
  { label: "Agents", to: "/dashboard/agents" as const },
  { label: "Runs", to: "/dashboard/runs" as const },
];

export function DashboardShell({
  title,
  lede,
  children,
  actions,
}: {
  title: string;
  lede?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="grain" />
      <div className="forge-glow pointer-events-none absolute inset-x-0 top-0 h-[40vh]" />
      <div className="relative z-1">
        <SiteHeader />
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[200px_1fr] md:px-10">
          <aside className="space-y-6">
            <SmithLogo />
            <nav className="flex flex-col gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md border border-transparent px-3 py-2 text-[13.5px] text-muted-foreground transition-colors hover:border-border hover:text-foreground",
                  )}
                  activeProps={{
                    className: "border-border bg-[rgba(255,255,255,0.04)] text-foreground",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-medium tracking-[-0.04em] md:text-[36px]">
                  {title}
                </h1>
                {lede ? (
                  <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">{lede}</p>
                ) : null}
              </div>
              {actions}
            </div>
            <div className="mt-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="panel p-5">
      <div className="text-[12px] tracking-[0.12em] text-muted-foreground uppercase">{label}</div>
      <div className="mt-2 text-[28px] font-medium tracking-[-0.03em]">{value}</div>
      {hint ? <div className="mt-1 text-[12.5px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function formatPct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(1)}%`;
}

export function formatUsd(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return `$${n.toFixed(4)}`;
}

export function formatMs(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n)} ms`;
}
