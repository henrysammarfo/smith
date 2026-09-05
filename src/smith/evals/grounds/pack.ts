import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { smithChat } from "../../llm/client";
import { tinyFishFetch } from "../../tools/tinyfish";
import { tavilySearch } from "../../tools/tavily";
import type { AgentArchitecture, Metrics, Trace } from "../../forge/types";

export type GroundsCase = {
  id: string;
  claim: string;
  evidenceUrl: string;
  expected: "grounded" | "ungrounded";
};

function fixturesDir() {
  return join(process.cwd(), "src/smith/evals/grounds/fixtures");
}

export function loadGroundsCases(): GroundsCase[] {
  return readdirSync(fixturesDir())
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(fixturesDir(), f), "utf8")) as GroundsCase);
}

export function defaultGroundsArchitecture(): AgentArchitecture {
  return {
    name: "grounds-lite-v1",
    packId: "grounds",
    systemPrompt:
      'You are a claim auditor. Given a claim and evidence text, answer with ONLY JSON: {"verdict":"grounded"|"ungrounded","rationale":string}. Grounded means the evidence supports the claim. Ungrounded means it contradicts or does not support the claim. Never invent evidence.',
    routerHint: "fetch_evidence_then_judge",
    memoryPolicy: "per_case_only",
    toolPolicy: "tinyfish_fetch_and_tavily_search",
    outputContract: '{"verdict":"grounded"|"ungrounded","rationale":string}',
    notes: "baseline",
  };
}

function parseVerdict(content: string): "grounded" | "ungrounded" | "unknown" {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return "unknown";
  try {
    const parsed = JSON.parse(match[0]) as { verdict?: string };
    const v = (parsed.verdict ?? "").toLowerCase();
    if (v === "grounded" || v === "ungrounded") return v;
    return "unknown";
  } catch {
    return "unknown";
  }
}

export async function runGroundsCase(
  architecture: AgentArchitecture,
  testCase: GroundsCase,
): Promise<Trace> {
  const started = Date.now();
  let evidence = "";
  let costUsd = 0;
  try {
    if (architecture.toolPolicy.includes("tinyfish")) {
      const fetched = await tinyFishFetch([testCase.evidenceUrl]);
      evidence += fetched
        .map((f) => f.text)
        .join("\n")
        .slice(0, 6000);
    }
  } catch (e) {
    evidence += `\n[tinyfish_fetch_error] ${e instanceof Error ? e.message : String(e)}`;
  }
  try {
    if (architecture.toolPolicy.includes("tavily")) {
      const search = await tavilySearch(testCase.claim, { maxResults: 3 });
      evidence += `\nSEARCH_ANSWER: ${search.answer ?? ""}\n`;
      evidence += search.results
        .map((r) => `${r.title}: ${r.content}`)
        .join("\n")
        .slice(0, 3000);
    }
  } catch (e) {
    evidence += `\n[tavily_error] ${e instanceof Error ? e.message : String(e)}`;
  }

  const result = await smithChat(
    [
      { role: "system", content: architecture.systemPrompt },
      {
        role: "user",
        content: `Claim: ${testCase.claim}\nEvidence URL: ${testCase.evidenceUrl}\nEvidence:\n${evidence.slice(0, 8000)}\n\nReturn ${architecture.outputContract}`,
      },
    ],
    { temperature: 0, maxTokens: 400 },
  );
  costUsd += result.costUsd;
  const verdict = parseVerdict(result.content);
  const ok = verdict === testCase.expected;
  return {
    caseId: testCase.id,
    ok,
    expected: testCase.expected,
    actual: verdict,
    errorClass: ok ? undefined : verdict === "unknown" ? "parse_failure" : "wrong_verdict",
    latencyMs: Date.now() - started,
    costUsd,
    raw: result.content.slice(0, 500),
  };
}

export async function runGroundsPack(
  architecture: AgentArchitecture,
): Promise<{ metrics: Metrics; traces: Trace[] }> {
  const cases = loadGroundsCases();
  const traces: Trace[] = [];
  for (const c of cases) {
    traces.push(await runGroundsCase(architecture, c));
  }
  const passed = traces.filter((t) => t.ok).length;
  return {
    metrics: {
      accuracy: passed / Math.max(traces.length, 1),
      reliability: passed / Math.max(traces.length, 1),
      costUsd: traces.reduce((s, t) => s + t.costUsd, 0),
      latencyMs: traces.reduce((s, t) => s + t.latencyMs, 0) / Math.max(traces.length, 1),
      cases: traces.length,
      passed,
    },
    traces,
  };
}
