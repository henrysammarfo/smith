import type { FailClass, Trace } from "./types";

export function classifyFailures(traces: Trace[]): FailClass[] {
  const buckets = new Map<string, { count: number; examples: string[] }>();
  for (const t of traces) {
    if (t.ok) continue;
    const id = t.errorClass ?? "unknown_failure";
    const bucket = buckets.get(id) ?? { count: 0, examples: [] };
    bucket.count += 1;
    if (bucket.examples.length < 3) bucket.examples.push(t.caseId);
    buckets.set(id, bucket);
  }

  const patchFor = (id: string): FailClass["suggestedPatch"] => {
    if (id.includes("parse")) return "prompt";
    if (id.includes("tool") || id.includes("fetch") || id.includes("timeout")) {
      return "tool";
    }
    if (id.includes("memory") || id.includes("cross")) return "memory";
    if (id.includes("router") || id.includes("wrong_tool")) return "router";
    if (id.includes("line_count") || id.includes("partial")) return "prompt";
    if (id.includes("verdict")) return "prompt";
    return "prompt";
  };

  const labelFor = (id: string) =>
    id
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return [...buckets.entries()]
    .map(([id, v]) => ({
      id,
      label: labelFor(id),
      count: v.count,
      examples: v.examples,
      suggestedPatch: patchFor(id),
    }))
    .sort((a, b) => b.count - a.count);
}
