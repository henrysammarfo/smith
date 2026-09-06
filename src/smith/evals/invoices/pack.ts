import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { smithChat } from "../../llm/client";
import { aggregateTrialMetrics, evalTrialCount } from "../../forge/trials";
import type { AgentArchitecture, Metrics, Trace } from "../../forge/types";

export type InvoiceLine = { description: string; amount: number };
export type InvoiceCase = {
  id: string;
  vendor: string;
  text: string;
  expected: InvoiceLine[];
};

function fixturesDir() {
  return join(process.cwd(), "src/smith/evals/invoices/fixtures");
}

export function loadInvoiceCases(): InvoiceCase[] {
  return readdirSync(fixturesDir())
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map(
      (f) =>
        JSON.parse(readFileSync(join(fixturesDir(), f), "utf8")) as InvoiceCase,
    );
}

function normDesc(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function scoreInvoiceLines(
  expected: InvoiceLine[],
  actual: InvoiceLine[],
): { accuracy: number; detail: string } {
  if (expected.length === 0) {
    return { accuracy: actual.length === 0 ? 1 : 0, detail: "empty" };
  }
  let hits = 0;
  for (const e of expected) {
    const match = actual.find(
      (a) =>
        Math.abs(a.amount - e.amount) < 0.01 &&
        (normDesc(a.description).includes(normDesc(e.description).slice(0, 12)) ||
          normDesc(e.description).includes(normDesc(a.description).slice(0, 12))),
    );
    if (match) hits += 1;
  }
  const precisionPenalty = Math.max(0, actual.length - expected.length) * 0.05;
  const accuracy = Math.max(0, hits / expected.length - precisionPenalty);
  return { accuracy, detail: `${hits}/${expected.length} lines` };
}

function parseLines(content: string): InvoiceLine[] {
  const fenced = content.match(/\[[\s\S]*\]/);
  const jsonText = fenced ? fenced[0] : content;
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        const r = row as { description?: unknown; amount?: unknown };
        const description = String(r.description ?? "");
        const amount = Number(r.amount);
        if (!description || Number.isNaN(amount)) return null;
        return { description, amount };
      })
      .filter((x): x is InvoiceLine => Boolean(x));
  } catch {
    return [];
  }
}

export function defaultInvoiceArchitecture(): AgentArchitecture {
  // Intentionally weak cold-start so Track-1 learning is visible (capability suite).
  return {
    name: "invoice-line-smith-v0-cold",
    packId: "invoices",
    systemPrompt:
      "Read the invoice text and list products with prices. You may answer in plain English. Be helpful.",
    routerHint: "unstructured",
    memoryPolicy: "none",
    toolPolicy: "llm_only",
    outputContract: "freeform",
    notes: "cold-start baseline — expect parse failures until learning loop hardens contract",
  };
}

export async function runInvoiceCase(
  architecture: AgentArchitecture,
  testCase: InvoiceCase,
): Promise<Trace> {
  const started = Date.now();
  const result = await smithChat(
    [
      { role: "system", content: architecture.systemPrompt },
      {
        role: "user",
        content: `${architecture.outputContract}\nRouter: ${architecture.routerHint}\nMemory: ${architecture.memoryPolicy}\n\nInvoice text:\n${testCase.text}`,
      },
    ],
    { temperature: 0, maxTokens: 500 },
  );
  const actual = parseLines(result.content);
  const scored = scoreInvoiceLines(testCase.expected, actual);
  const ok = scored.accuracy >= 0.999;
  return {
    caseId: testCase.id,
    ok,
    expected: JSON.stringify(testCase.expected),
    actual: JSON.stringify(actual),
    errorClass: ok
      ? undefined
      : scored.accuracy === 0
        ? "parse_or_total_miss"
        : actual.length !== testCase.expected.length
          ? "line_count_mismatch"
          : "partial_line_mismatch",
    latencyMs: Date.now() - started,
    costUsd: result.costUsd,
    raw: result.content.slice(0, 500),
  };
}

export async function runInvoicePack(
  architecture: AgentArchitecture,
): Promise<{ metrics: Metrics; traces: Trace[] }> {
  const cases = loadInvoiceCases();
  const trialsPerCase = evalTrialCount();
  const traces: Trace[] = [];
  for (const c of cases) {
    for (let i = 0; i < trialsPerCase; i += 1) {
      traces.push(await runInvoiceCase(architecture, c));
    }
  }
  const cold =
    architecture.outputContract === "freeform" ||
    architecture.routerHint === "unstructured";
  const metrics = aggregateTrialMetrics(traces, {
    trialsPerCase,
    capabilityColdStart: cold,
    accuracyFromTraces: (reps) =>
      reps.reduce((sum, t) => {
        const expected = JSON.parse(t.expected) as InvoiceLine[];
        const actual = JSON.parse(t.actual) as InvoiceLine[];
        return sum + scoreInvoiceLines(expected, actual).accuracy;
      }, 0) / Math.max(reps.length, 1),
  });
  return { metrics, traces };
}
