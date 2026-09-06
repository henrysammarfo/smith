import type { Metrics, Trace } from "./types";

/**
 * Anthropic-style multi-trial aggregation (Demystifying evals for AI agents):
 * - pass@k: task succeeds on ≥1 of k trials
 * - pass^k: task succeeds on all k trials (stricter reliability)
 */
export type TrialBundle = {
  caseId: string;
  trials: Trace[];
};

export type TrialMetrics = Metrics & {
  trialsPerCase: number;
  passAtK: number;
  passCaretK: number;
  suiteKind: "capability" | "regression" | "mixed";
};

export function bundleTrials(traces: Trace[], trialsPerCase: number): TrialBundle[] {
  if (trialsPerCase <= 1) {
    return traces.map((t) => ({ caseId: t.caseId, trials: [t] }));
  }
  const byCase = new Map<string, Trace[]>();
  for (const t of traces) {
    const list = byCase.get(t.caseId) ?? [];
    list.push(t);
    byCase.set(t.caseId, list);
  }
  return [...byCase.entries()].map(([caseId, trials]) => ({ caseId, trials }));
}

export function aggregateTrialMetrics(
  traces: Trace[],
  opts: {
    trialsPerCase: number;
    capabilityColdStart?: boolean;
    accuracyFromTraces?: (traces: Trace[]) => number;
  },
): TrialMetrics {
  const bundles = bundleTrials(traces, opts.trialsPerCase);
  const k = Math.max(1, opts.trialsPerCase);
  let passAt = 0;
  let passCaret = 0;
  for (const b of bundles) {
    const oks = b.trials.filter((t) => t.ok).length;
    if (oks >= 1) passAt += 1;
    if (oks === b.trials.length && b.trials.length > 0) passCaret += 1;
  }
  const caseCount = bundles.length;
  const representative =
    k <= 1
      ? traces
      : bundles.map((b) => b.trials.find((t) => t.ok) ?? b.trials[0]!);
  const passed = representative.filter((t) => t.ok).length;
  const accuracy =
    opts.accuracyFromTraces?.(representative) ??
    passed / Math.max(representative.length, 1);
  const suiteKind: TrialMetrics["suiteKind"] = opts.capabilityColdStart
    ? "capability"
    : accuracy >= 0.99
      ? "regression"
      : "mixed";
  return {
    accuracy,
    reliability: passCaret / Math.max(caseCount, 1),
    costUsd: traces.reduce((s, t) => s + t.costUsd, 0),
    latencyMs: traces.reduce((s, t) => s + t.latencyMs, 0) / Math.max(traces.length, 1),
    cases: caseCount,
    passed,
    trialsPerCase: k,
    passAtK: passAt / Math.max(caseCount, 1),
    passCaretK: passCaret / Math.max(caseCount, 1),
    suiteKind,
  };
}

export function evalTrialCount(): number {
  const raw = Number(process.env.SMITH_EVAL_TRIALS ?? "1");
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.min(5, Math.floor(raw));
}
