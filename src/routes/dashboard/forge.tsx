import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  DashboardShell,
  MetricCard,
  formatPct,
  formatUsd,
} from "@/components/dashboard/DashboardShell";
import {
  createWorkspaceFn,
  getDashboardFn,
  forgeOnceFn,
  listLearningFn,
  listWorkspacesFn,
} from "@/smith/forge/api";

export const Route = createFileRoute("/dashboard/forge")({
  component: ForgePage,
});

type ReportView = {
  before: {
    accuracy: number;
    reliability: number;
    costUsd: number;
    latencyMs: number;
  } | null;
  after: {
    accuracy: number;
    reliability: number;
    costUsd: number;
    latencyMs: number;
  };
  delta: {
    accuracy: number;
    reliability: number;
    costUsd: number;
    latencyMs: number;
  };
  taxonomy: Array<{
    id: string;
    label: string;
    count: number;
    suggestedPatch: string;
  }>;
  generation: number;
  reflection?: string;
  memoriesAdded?: Array<{ id: string; kind: string; content: string; generation: number }>;
  memoryCount?: number;
  trajectory?: Array<{
    generation: number;
    accuracy: number;
    costUsd: number;
    latencyMs: number;
  }>;
};

function ForgePage() {
  const qc = useQueryClient();
  const listWorkspaces = useServerFn(listWorkspacesFn);
  const createWorkspace = useServerFn(createWorkspaceFn);
  const forgeOnce = useServerFn(forgeOnceFn);
  const dashSummary = useServerFn(getDashboardFn);
  const listLearning = useServerFn(listLearningFn);

  const [workspaceId, setWorkspaceId] = useState("");
  const [goal, setGoal] = useState(
    "Extract invoice line items accurately from messy vendor PDFs/text.",
  );
  const [packId, setPackId] = useState<"invoices" | "grounds">("invoices");
  const [lastReport, setLastReport] = useState<ReportView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workspacesQ = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => listWorkspaces(),
  });

  const dashQ = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => dashSummary(),
  });

  const learningQ = useQuery({
    queryKey: ["learning", workspaceId],
    queryFn: () => listLearning({ data: { workspaceId } }),
    enabled: Boolean(workspaceId),
  });

  const createMut = useMutation({
    mutationFn: () =>
      createWorkspace({
        data: {
          goal,
          packId,
          tools:
            packId === "invoices"
              ? ["parse_invoice", "normalize_money"]
              : ["tinyfish_fetch", "tavily_search", "claim_score"],
        },
      }),
    onSuccess: (ws) => {
      setWorkspaceId(ws.id);
      setLastReport(null);
      setError(null);
      void qc.invalidateQueries({ queryKey: ["workspaces"] });
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const forgeMut = useMutation({
    mutationFn: () => {
      if (!workspaceId) throw new Error("Create or select a workspace first");
      return forgeOnce({ data: { workspaceId } });
    },
    onSuccess: (result) => {
      setLastReport(result.report);
      setError(null);
      void qc.invalidateQueries({ queryKey: ["dashboard"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      void qc.invalidateQueries({ queryKey: ["runs"] });
      void qc.invalidateQueries({ queryKey: ["generations", workspaceId] });
      void qc.invalidateQueries({ queryKey: ["learning", workspaceId] });
    },
    onError: (e: Error) => setError(e.message),
  });

  return (
    <DashboardShell
      title="Forge loop"
      lede="Propose → eval → classify → reflect → remember → mutate. Live LLM + SQLite — learning visible across generations."
    >
      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Workspaces" value={String(dashQ.data?.workspaceCount ?? "—")} />
        <MetricCard label="Generations" value={String(dashQ.data?.generationCount ?? "—")} />
        <MetricCard label="Runs" value={String(dashQ.data?.runCount ?? "—")} />
        <MetricCard label="Memories" value={String(dashQ.data?.memoryCount ?? "—")} />
        <MetricCard label="Reflections" value={String(dashQ.data?.reflectionCount ?? "—")} />
        <MetricCard
          label="Latest accuracy"
          value={formatPct(dashQ.data?.latestMetrics?.accuracy)}
        />
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-display text-xl text-cream">New workspace</h2>
          <label className="mt-4 block text-xs tracking-[0.14em] text-cream/45 uppercase">
            Goal
          </label>
          <textarea
            className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-cream"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <label className="mt-4 block text-xs tracking-[0.14em] text-cream/45 uppercase">
            Eval pack
          </label>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-cream"
            value={packId}
            onChange={(e) => setPackId(e.target.value as "invoices" | "grounds")}
          >
            <option value="invoices">Messy invoices</option>
            <option value="grounds">GROUNDS-lite claim check</option>
          </select>
          <button
            type="button"
            className="btn-primary mt-4"
            disabled={createMut.isPending}
            onClick={() => createMut.mutate()}
          >
            {createMut.isPending ? "Creating…" : "Create workspace"}
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-display text-xl text-cream">Run generation</h2>
          <label className="mt-4 block text-xs tracking-[0.14em] text-cream/45 uppercase">
            Workspace
          </label>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-ink px-3 py-2 text-sm text-cream"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          >
            <option value="">Select…</option>
            {(workspacesQ.data ?? []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.packId} — {w.goal.slice(0, 48)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-primary mt-4"
            disabled={forgeMut.isPending || !workspaceId}
            onClick={() => forgeMut.mutate()}
          >
            {forgeMut.isPending ? "Forging…" : "Forge once"}
          </button>
          <p className="mt-3 text-sm text-cream/55">
            Cold-start is intentionally weak. Forge again to show memory + mutation lift. Or start
            from{" "}
            <Link to="/start" className="text-ember underline-offset-2 hover:underline">
              /start
            </Link>
            .
          </p>
        </div>
      </section>

      {lastReport ? (
        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-display text-xl text-cream">
            Report card — gen {lastReport.generation}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <MetricCard
              label="Accuracy Δ"
              value={formatPct(lastReport.delta.accuracy)}
              hint={`now ${formatPct(lastReport.after.accuracy)}`}
            />
            <MetricCard
              label="Reliability Δ"
              value={formatPct(lastReport.delta.reliability)}
              hint={`now ${formatPct(lastReport.after.reliability)}`}
            />
            <MetricCard
              label="Cost"
              value={formatUsd(lastReport.after.costUsd)}
              hint={`Δ ${formatUsd(lastReport.delta.costUsd)}`}
            />
            <MetricCard
              label="Memory size"
              value={String(lastReport.memoryCount ?? 0)}
              hint={`+${lastReport.memoriesAdded?.length ?? 0} this run`}
            />
          </div>

          {lastReport.trajectory && lastReport.trajectory.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm tracking-[0.12em] text-cream/45 uppercase">
                Accuracy trajectory
              </h3>
              <ol className="mt-3 flex flex-wrap gap-2">
                {lastReport.trajectory.map((t) => (
                  <li
                    key={`traj-${t.generation}-${t.accuracy}`}
                    className="rounded-lg border border-white/10 bg-ink/60 px-3 py-2 text-sm text-cream"
                  >
                    G{t.generation}: {formatPct(t.accuracy)}
                    <span className="ml-2 text-cream/45">
                      {formatUsd(t.costUsd)} · {Math.round(t.latencyMs)}ms
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {lastReport.reflection ? (
            <div className="mt-6">
              <h3 className="text-sm tracking-[0.12em] text-cream/45 uppercase">Self-reflection</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-cream/80">
                {lastReport.reflection}
              </p>
            </div>
          ) : null}

          {lastReport.memoriesAdded && lastReport.memoriesAdded.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-sm tracking-[0.12em] text-cream/45 uppercase">
                New durable memories
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-cream/75">
                {lastReport.memoriesAdded.map((m) => (
                  <li key={m.id}>
                    <span className="text-ember">[{m.kind}]</span> {m.content}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <ul className="mt-6 space-y-2 text-sm text-cream/70">
            {lastReport.taxonomy.map((t) => (
              <li key={t.id}>
                <span className="text-cream">{t.label}</span> ×{t.count} → patch{" "}
                <code className="text-ember">{t.suggestedPatch}</code>
              </li>
            ))}
            {lastReport.taxonomy.length === 0 ? (
              <li>No failures classified this generation.</li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {workspaceId && learningQ.data ? (
        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-xl text-cream">
              Growing memory ({learningQ.data.memories.length})
            </h2>
            <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto text-sm text-cream/70">
              {learningQ.data.memories.length === 0 ? (
                <li>Empty until first forge writes lessons.</li>
              ) : (
                learningQ.data.memories.map((m) => (
                  <li key={m.id}>
                    <span className="text-ember">
                      [{m.kind}/g{m.generation}]
                    </span>{" "}
                    {m.content}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-xl text-cream">
              Reflections ({learningQ.data.reflections.length})
            </h2>
            <ul className="mt-4 max-h-72 space-y-4 overflow-y-auto text-sm text-cream/70">
              {learningQ.data.reflections.length === 0 ? (
                <li>No reflections yet.</li>
              ) : (
                learningQ.data.reflections.map((r) => (
                  <li key={r.id}>
                    <div className="text-cream">Gen {r.generation}</div>
                    <p className="mt-1 whitespace-pre-wrap">{r.reflection}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      ) : null}
    </DashboardShell>
  );
}
