import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  DashboardShell,
  formatMs,
  formatPct,
  formatUsd,
} from "@/components/dashboard/DashboardShell";
import { getDashboardFn } from "@/smith/forge/api";

export const Route = createFileRoute("/dashboard/runs")({
  head: () => ({
    meta: [
      { title: "Runs — SMITH.forge" },
      {
        name: "description",
        content: "Eval runs, metrics, and failure classes from live forge executions.",
      },
    ],
  }),
  component: RunsPage,
});

function RunsPage() {
  const getDashboard = useServerFn(getDashboardFn);
  const q = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
  });

  return (
    <DashboardShell
      title="Eval runs"
      lede="Every run stores traces, metrics, and a failure taxonomy used to drive the next mutation."
    >
      <div className="space-y-4">
        {(q.data?.runs ?? []).length === 0 ? (
          <div className="panel p-6 text-muted-foreground">No runs yet.</div>
        ) : (
          q.data?.runs.map((run) => (
            <article key={run.id} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-mono text-[12px] text-muted-foreground">{run.id}</div>
                  <div className="mt-1 text-[14px]">
                    {run.packId} · gen {run.generationId}
                  </div>
                </div>
                <div className="text-[12.5px] text-muted-foreground">
                  {new Date(run.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-[13px] sm:grid-cols-4">
                <div>
                  <div className="text-muted-foreground">Accuracy</div>
                  <div>{formatPct(run.metrics.accuracy)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Reliability</div>
                  <div>{formatPct(run.metrics.reliability)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Cost</div>
                  <div>{formatUsd(run.metrics.costUsd)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Latency</div>
                  <div>{formatMs(run.metrics.latencyMs)}</div>
                </div>
              </div>
              <div className="mt-4 text-[13px]">
                <div className="text-muted-foreground">Taxonomy</div>
                <ul className="mt-1 space-y-1">
                  {run.taxonomy.length === 0 ? (
                    <li>Clean run</li>
                  ) : (
                    run.taxonomy.map((f) => (
                      <li key={f.id}>
                        {f.label} ×{f.count} → {f.suggestedPatch}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </article>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
