import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  DashboardShell,
  MetricCard,
  formatMs,
  formatPct,
  formatUsd,
} from "@/components/dashboard/DashboardShell";
import { getDashboardFn, healLlmFn } from "@/smith/forge/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SMITH.forge" },
      {
        name: "description",
        content: "Live forge metrics, generations, and failure taxonomy from SQLite.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const getDashboard = useServerFn(getDashboardFn);
  const healLlm = useServerFn(healLlmFn);
  const q = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    refetchInterval: 8_000,
  });
  const data = q.data;

  return (
    <DashboardShell
      title="Forge control room"
      lede="Live workspaces, generations, and report cards — no marketing mocks."
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-shine btn-ghost-frost h-[40px] px-4 text-[13px]"
            onClick={async () => {
              try {
                const report = await healLlm();
                toast.success(`LLM healed → ${report.selectedBaseUrl}`);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Heal failed");
              }
            }}
          >
            Heal LLM
          </button>
          <Link
            to="/dashboard/forge"
            className="btn-shine btn-solid-metal h-[40px] px-4 text-[13px]"
          >
            Open forge
          </Link>
        </div>
      }
    >
      {q.isLoading ? (
        <p className="text-muted-foreground">Loading live forge state…</p>
      ) : q.isError ? (
        <p className="text-red-400">
          {q.error instanceof Error ? q.error.message : "Failed to load dashboard"}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Workspaces" value={String(data?.workspaceCount ?? 0)} />
            <MetricCard label="Generations" value={String(data?.generationCount ?? 0)} />
            <MetricCard label="Runs" value={String(data?.runCount ?? 0)} />
            <MetricCard label="Memories" value={String(data?.memoryCount ?? 0)} />
            <MetricCard label="Reflections" value={String(data?.reflectionCount ?? 0)} />
            <MetricCard
              label="Latest accuracy"
              value={formatPct(data?.latestMetrics?.accuracy)}
              hint={`reliability ${formatPct(data?.latestMetrics?.reliability)}`}
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <section className="panel p-5">
              <h2 className="text-[15px] font-medium">Latest metrics</h2>
              <dl className="mt-4 space-y-2 text-[13.5px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Cost</dt>
                  <dd>{formatUsd(data?.latestMetrics?.costUsd)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Latency</dt>
                  <dd>{formatMs(data?.latestMetrics?.latencyMs)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Cases passed</dt>
                  <dd>
                    {data?.latestMetrics
                      ? `${data.latestMetrics.passed}/${data.latestMetrics.cases}`
                      : "—"}
                  </dd>
                </div>
              </dl>
            </section>
            <section className="panel p-5">
              <h2 className="text-[15px] font-medium">Failure taxonomy</h2>
              <ul className="mt-4 space-y-2 text-[13.5px]">
                {(data?.latestTaxonomy ?? []).length === 0 ? (
                  <li className="text-muted-foreground">No failures recorded yet.</li>
                ) : (
                  data?.latestTaxonomy.map((f) => (
                    <li key={f.id} className="flex justify-between gap-3">
                      <span>
                        {f.label}{" "}
                        <span className="text-muted-foreground">→ {f.suggestedPatch}</span>
                      </span>
                      <span>{f.count}</span>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>

          <section className="panel mt-8 overflow-x-auto p-5">
            <h2 className="text-[15px] font-medium">Workspaces</h2>
            <table className="mt-4 w-full min-w-[640px] text-left text-[13px]">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="pb-2 font-normal">Name</th>
                  <th className="pb-2 font-normal">Pack</th>
                  <th className="pb-2 font-normal">Goal</th>
                  <th className="pb-2 font-normal">Created</th>
                </tr>
              </thead>
              <tbody>
                {(data?.workspaces ?? []).map((w) => (
                  <tr key={w.id} className="border-t border-border">
                    <td className="py-3">{w.name}</td>
                    <td className="py-3">{w.packId}</td>
                    <td className="max-w-[280px] truncate py-3">{w.goal}</td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </DashboardShell>
  );
}
