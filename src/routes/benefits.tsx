import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/smith/PageShell";
import { benefits } from "@/lib/smith-data";
import {
  Hammer,
  Gauge,
  Boxes,
  Route as RouteIcon,
  ScrollText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const ICONS = {
  Hammer,
  Gauge,
  Boxes,
  Route: RouteIcon,
  ScrollText,
  ShieldCheck,
} as const;

export const Route = createFileRoute("/benefits")({
  head: () => ({
    meta: [
      { title: "Benefits — SMITH.forge" },
      {
        name: "description",
        content:
          "Why teams forge agents with SMITH: self-improving architectures, measured runs, failure taxonomy and replayable traces.",
      },
      { property: "og:title", content: "Benefits — SMITH.forge" },
      {
        property: "og:description",
        content:
          "Self-improving agent architectures with accuracy, cost, latency and reliability measured on every run.",
      },
    ],
  }),
  component: Benefits,
});

function Benefits() {
  return (
    <PageShell
      eyebrow="Why SMITH"
      title="Stop babysitting"
      accent="brittle agents."
      lede="One-off scripts rot the week they ship. SMITH treats agent building as engineering: declare the target, measure the miss, patch the architecture, prove the gain."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => {
          const Icon = ICONS[b.icon as keyof typeof ICONS];
          return (
            <div key={b.title} className="panel p-6">
              <Icon size={22} strokeWidth={1.6} className="text-stat" />
              <h2 className="mt-5 text-[17px] font-medium tracking-[-0.02em]">
                {b.title}
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                {b.body}
              </p>
            </div>
          );
        })}
      </div>

      <div className="panel mt-8 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
        <div>
          <h2 className="text-[22px] font-medium tracking-[-0.03em]">
            See a real before/after <em className="serif-accent">report card</em>
          </h2>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            Two domains, same forge, every generation scored.
          </p>
        </div>
        <Link to="/demo" className="btn-shine btn-solid-metal h-[42px] px-[18px]">
          Open the demo <ArrowRight size={16} />
        </Link>
      </div>
    </PageShell>
  );
}
