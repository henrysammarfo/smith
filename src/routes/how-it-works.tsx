import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/smith/PageShell";
import { forgeLoop, failTaxonomy } from "@/lib/smith-data";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — SMITH.forge" },
      {
        name: "description",
        content:
          "The six-step forge loop: declare the job, generate an architecture, run the eval, classify failures, mutate, ship the report card.",
      },
      { property: "og:title", content: "How It Works — SMITH.forge" },
      {
        property: "og:description",
        content:
          "Goal plus tools plus eval, in. A measurably better agent generation, out.",
      },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <PageShell
      eyebrow="The forge loop"
      title="Six steps from a goal to a"
      accent="better generation."
      lede="Nothing here is magic. It is a loop that refuses to stop at the first guess."
    >
      <ol className="grid gap-4 md:grid-cols-2">
        {forgeLoop.map((s) => (
          <li key={s.step} className="panel p-6">
            <span className="text-[12.5px] tracking-[0.14em] text-muted-foreground">
              {s.step}
            </span>
            <h2 className="mt-3 text-[18px] font-medium tracking-[-0.02em]">
              {s.title}
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </li>
        ))}
      </ol>

      <section className="mt-14">
        <h2 className="text-[24px] font-medium tracking-[-0.03em]">
          What the forge <em className="serif-accent">actually reads</em>
        </h2>
        <p className="mt-2 max-w-[520px] text-[13.5px] text-muted-foreground">
          Failures are sorted into classes, each with the patch that historically
          fixes it.
        </p>
        <div className="panel mt-6 divide-y divide-border">
          {failTaxonomy.map((f) => (
            <div
              key={f.label}
              className="flex flex-wrap items-center gap-4 px-6 py-4"
            >
              <span className="min-w-[220px] flex-1 text-[14px]">{f.label}</span>
              <div className="h-[6px] w-40 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-stat"
                  style={{ width: `${f.share}%` }}
                />
              </div>
              <span className="w-12 text-right text-[13px] text-muted-foreground">
                {f.share}%
              </span>
              <span className="text-[13px] text-ember">{f.patch}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/start" className="btn-shine btn-solid-metal h-[42px] px-[18px]">
          Forge your first agent <ArrowRight size={16} />
        </Link>
        <Link to="/pricing" className="btn-shine btn-ghost-frost h-[42px] px-[18px]">
          See pricing
        </Link>
      </div>
    </PageShell>
  );
}
