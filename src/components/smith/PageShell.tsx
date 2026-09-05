import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Sparkle } from "./Sparkle";

export function PageShell({
  eyebrow,
  title,
  accent,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="grain" />
      <div className="forge-glow pointer-events-none absolute inset-x-0 top-0 h-[60vh]" />
      <div className="relative z-1">
        <SiteHeader />
        <main className="px-5 pt-10 md:px-10 md:pt-16">
          <div className="mx-auto max-w-6xl">
            <span
              className="badge-metal appear appear-pop"
              style={{ ["--d" as string]: "0.22s" }}
            >
              <Sparkle size={16} />
              {eyebrow}
            </span>
            <h1
              className="appear appear-mask mt-6 text-[36px] leading-[1.12] font-medium tracking-[-0.045em] md:text-[54px]"
              style={{ ["--d" as string]: "0.42s" }}
            >
              {title} {accent ? <em className="serif-accent">{accent}</em> : null}
            </h1>
            <p
              className="appear appear-soft mt-5 max-w-[560px] text-[15.5px] leading-[1.55] tracking-[-0.015em] text-muted-foreground"
              style={{ ["--d" as string]: "0.62s" }}
            >
              {lede}
            </p>
            <div className="mt-14">{children}</div>
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
