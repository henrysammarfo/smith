import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { smithChat } from "../../llm/client";
import { tinyFishFetch } from "../../tools/tinyfish";
import { tavilySearch } from "../../tools/tavily";
import { toolPromptBlock } from "../../tools/catalog";
import { aggregateTrialMetrics, evalTrialCount } from "../../forge/trials";
import type { AgentArchitecture, Metrics, Trace } from "../../forge/types";

export type GroundsCase = {
  id: string;
  claim: string;
  evidenceUrl: string;
  expected: "grounded" | "ungrounded";
};

// Bundle fixtures into the server build. Vercel serverless has no
// eval fixture tree on disk under `/var/task`.
const bundledGroundsFixtures = import.meta.glob("./fixtures/*.json", {
  eager: true,
  import: "default",
}) as Record<string, GroundsCase>;

function fixturesDir() {
  return join(process.cwd(), "src/smith/evals/grounds/fixtures");
}

export function loadGroundsCases(): GroundsCase[] {
  const fromBundle = Object.keys(bundledGroundsFixtures)
    .sort()
    .map((k) => bundledGroundsFixtures[k]!);
  if (fromBundle.length > 0) return fromBundle;

  return readdirSync(fixturesDir())
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map(
      (f) =>
        JSON.parse(readFileSync(join(fixturesDir(), f), "utf8")) as GroundsCase,
    );
}

export function defaultGroundsArchitecture(): AgentArchitecture {
  const tools = toolPromptBlock([
    "smith.tinyfish.fetch",
    "smith.tavily.search",
  ]);
  return {
    name: "grounds-lite-v1",
    packId: "grounds",
    systemPrompt:
      'You are a claim auditor. Given a claim and evidence text, answer with ONLY JSON: {"verdict":"grounded"|"ungrounded","rationale":string}. Grounded means the evidence supports the claim. Ungrounded means it contradicts or does not support the claim. Never invent evidence.\n\nAvailable tools:\n' +
      tools,
    routerHint: "fetch_evidence_then_judge",
    memoryPolicy: "per_case_only",
    toolPolicy: "tinyfish_fetch_and_tavily_search",
    outputContract: '{"verdict":"grounded"|"ungrounded","rationale":string}',
    notes: "baseline — TinyFish fetch before Tavily search",
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
  const toolTrace: string[] = [];
  try {
    if (architecture.toolPolicy.includes("tinyfish")) {
      const fetched = await tinyFishFetch([testCase.evidenceUrl]);
      toolTrace.push(fetched.tool);
      evidence += fetched.results
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
      toolTrace.push(search.tool);
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
    errorClass: ok
      ? undefined
      : verdict === "unknown"
        ? "parse_failure"
        : "wrong_verdict",
    latencyMs: Date.now() - started,
    costUsd,
    raw: `${toolTrace.join(",")} | ${result.content.slice(0, 400)}`,
  };
}

export async function runGroundsPack(
  architecture: AgentArchitecture,
): Promise<{ metrics: Metrics; traces: Trace[] }> {
  const cases = loadGroundsCases();
  const trialsPerCase = evalTrialCount();
  const traces: Trace[] = [];
  for (const c of cases) {
    for (let i = 0; i < trialsPerCase; i += 1) {
      traces.push(await runGroundsCase(architecture, c));
    }
  }
  const metrics = aggregateTrialMetrics(traces, {
    trialsPerCase,
    capabilityColdStart: architecture.toolPolicy.includes("llm_only"),
  });
  return { metrics, traces };
}
