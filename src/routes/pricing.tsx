import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/smith/PageShell";
import { pricing } from "@/lib/smith-data";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — SMITH.forge" },
      {
        name: "description",
        content:
          "Apprentice is free forever. Journeyman is $79 a month for unlimited forge generations. Master is agent engineering as shared infrastructure.",
      },
      { property: "og:title", content: "Pricing — SMITH.forge" },
      {
        property: "og:description",
        content: "Three tiers: Apprentice, Journeyman, Master. Start free.",
      },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <PageShell
      eyebrow="Pricing"
      title="Pay for generations, not"
      accent="promises."
      lede="Start on the free tier with one eval pack. Move up when the forge is running your operations."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {pricing.map((p) => (
          <div
            key={p.name}
            className={cn(
              "panel flex flex-col p-7",
              p.featured && "border-[rgba(255,255,255,0.3)] shadow-[0_0_40px_rgba(186,208,255,0.12)]",
            )}
          >
            {p.featured ? (
              <span className="badge-metal mb-4 self-start">Most forged</span>
            ) : null}
            <h2 className="text-[15.5px] tracking-[0.08em] text-muted-foreground uppercase">
              {p.name}
            </h2>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-[38px] leading-none font-medium tracking-[-0.04em]">
                {p.price}
              </span>
              <span className="pb-1 text-[13px] text-muted-foreground">
                {p.cadence}
              </span>
            </div>
            <p className="mt-3 text-[13.5px] text-muted-foreground">{p.blurb}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[13.5px]">
                  <Check size={16} className="mt-[2px] text-ember" strokeWidth={2} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/start"
              className={cn(
                "btn-shine mt-7 h-[42px] px-[18px]",
                p.featured ? "btn-solid-metal" : "btn-ghost-frost",
              )}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[13px] text-muted-foreground">
        All tiers include the failure taxonomy and run history. Model usage is
        billed at cost with no markup.
      </p>
    </PageShell>
  );
}
