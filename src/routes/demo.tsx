import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/smith/PageShell";
import { Play, RotateCcw, ArrowRight } from "lucide-react";

const GENERATIONS = [
  {
    gen: 1,
    accuracy: 41,
    cost: 0.061,
    latency: 5200,
    note: "First guess. Single prompt, one tool.",
  },
  {
    gen: 3,
    accuracy: 58,
    cost: 0.048,
    latency: 3900,
    note: "Router added after wrong-tool failures.",
  },
  {
    gen: 5,
    accuracy: 69,
    cost: 0.031,
    latency: 2600,
    note: "Output validator killed schema drift.",
  },
  {
    gen: 7,
    accuracy: 78,
    cost: 0.021,
    latency: 2140,
    note: "Memory window fixed multi-line invoices.",
  },
];

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Demo — SMITH.forge" },
      {
        name: "description",
        content:
          "Watch the forge loop take messy invoice extraction from 41% to 78% accuracy while cost and latency fall.",
      },
      { property: "og:title", content: "Live Demo — SMITH.forge" },
      {
        property: "og:description",
        content: "Generation by generation: accuracy up, cost down, latency down.",
      },
    ],
  }),
  component: Demo,
});

function Demo() {
  const [shown, setShown] = useState(1);
  const visible = GENERATIONS.slice(0, shown);
  const done = shown >= GENERATIONS.length;

  return (
    <PageShell
      eyebrow="Forge session"
      title="Domain A: messy invoices,"
      accent="seven generations."
      lede="Press forge and step through the same eval pack as SMITH rewrites the architecture between runs."
    >
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShown((s) => Math.min(s + 1, GENERATIONS.length))}
          disabled={done}
          className="btn-shine btn-solid-metal h-[42px] px-[18px] disabled:opacity-50"
        >
          <Play size={16} /> {done ? "Loop complete" : "Forge next generation"}
        </button>
        <button
          type="button"
          onClick={() => setShown(1)}
          className="btn-shine btn-ghost-frost h-[42px] px-[18px]"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      <div className="panel mt-8 overflow-x-auto">
        <table className="w-full min-w-[620px] text-[13.5px]">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-6 py-4 font-normal">Generation</th>
              <th className="px-6 py-4 font-normal">Accuracy</th>
              <th className="px-6 py-4 font-normal">Cost / run</th>
              <th className="px-6 py-4 font-normal">Latency</th>
              <th className="px-6 py-4 font-normal">Patch</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((g) => (
              <tr key={g.gen} className="border-t border-border">
                <td className="px-6 py-4">Gen {g.gen}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-3">
                    <span className="w-9">{g.accuracy}%</span>
                    <span className="h-[6px] w-24 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-stat"
                        style={{ width: `${g.accuracy}%` }}
                      />
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4">${g.cost.toFixed(3)}</td>
                <td className="px-6 py-4">{(g.latency / 1000).toFixed(1)}s</td>
                <td className="px-6 py-4 text-muted-foreground">{g.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { k: "Accuracy", v: "+37 pts" },
          { k: "Cost per run", v: "−66%" },
          { k: "Latency", v: "−59%" },
        ].map((m) => (
          <div key={m.k} className="panel p-6">
            <p className="text-[12.5px] tracking-[0.1em] text-muted-foreground uppercase">{m.k}</p>
            <p className="mt-2 text-[28px] font-medium tracking-[-0.04em]">{m.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/dashboard" className="btn-shine btn-solid-metal h-[42px] px-[18px]">
          Open the dashboard <ArrowRight size={16} />
        </Link>
        <Link to="/how-it-works" className="btn-shine btn-ghost-frost h-[42px] px-[18px]">
          Read the loop
        </Link>
      </div>
    </PageShell>
  );
}
