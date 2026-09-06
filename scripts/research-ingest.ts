#!/usr/bin/env bun
/**
 * Research ingest: Tavily + TinyFish → docs/research + durable forge lessons.
 * Implements Anthropic tool ergonomics (namespaced tools, truncated context)
 * and Reflexion-style verbal memory seeding for Track-1 demos.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tavilySearch } from "../src/smith/tools/tavily";
import { tinyFishFetch, tinyFishSearch } from "../src/smith/tools/tinyfish";
import { createWorkspace, forgeOnce } from "../src/smith/forge/engine";
import { addMemories } from "../src/smith/forge/memory";

const QUERIES = [
  "Anthropic demystifying evals for AI agents pass@k transcript grading",
  "Anthropic writing effective tools for agents MCP tool design",
  "Reflexion verbal reinforcement learning language agents arxiv",
  "Maximor AI autonomous finance agent learn escalate improve",
  "Claude managed agents harness session tools evaluation",
];

const SEED_URLS = [
  "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents",
  "https://www.anthropic.com/engineering/writing-tools-for-agents",
  "https://platform.claude.com/docs/en/managed-agents/overview",
  "https://www.maximor.ai/",
];

const outDir = join(process.cwd(), "docs/research");
mkdirSync(outDir, { recursive: true });

const bundle: {
  fetchedAt: string;
  tavily: unknown[];
  tinyfishSearch: unknown[];
  tinyfishFetch: unknown[];
  lessons: string[];
} = {
  fetchedAt: new Date().toISOString(),
  tavily: [],
  tinyfishSearch: [],
  tinyfishFetch: [],
  lessons: [],
};

console.log("Ingesting research via Tavily + TinyFish…");

for (const q of QUERIES) {
  try {
    const t = await tavilySearch(q, { maxResults: 5 });
    bundle.tavily.push({ query: q, tool: t.tool, answer: t.answer, results: t.results });
    console.log("TAVILY_OK", q.slice(0, 48));
  } catch (e) {
    console.warn("TAVILY_FAIL", q.slice(0, 40), e instanceof Error ? e.message : e);
    bundle.tavily.push({ query: q, error: String(e) });
  }
  try {
    const s = await tinyFishSearch(q);
    bundle.tinyfishSearch.push({ query: q, tool: s.tool, results: s.results.slice(0, 5) });
    console.log("TINYFISH_SEARCH_OK", q.slice(0, 48));
  } catch (e) {
    console.warn("TINYFISH_SEARCH_FAIL", e instanceof Error ? e.message : e);
    bundle.tinyfishSearch.push({ query: q, error: String(e) });
  }
}

try {
  const fetched = await tinyFishFetch(SEED_URLS);
  bundle.tinyfishFetch.push({
    tool: fetched.tool,
    results: fetched.results.map((r) => ({
      url: r.url,
      title: r.title,
      text: r.text.slice(0, 2500),
    })),
  });
  console.log("TINYFISH_FETCH_OK", fetched.results.length);
} catch (e) {
  console.warn("TINYFISH_FETCH_FAIL", e instanceof Error ? e.message : e);
  bundle.tinyfishFetch.push({ error: String(e) });
}

bundle.lessons = [
  "Eval harness = tasks × trials × graders; report pass@k and pass^k, not a single lucky run.",
  "Keep a capability suite (hard, low pass) separate from a regression suite (near-100%).",
  "Prefer deterministic graders for structured outputs; use LLM graders only for nuance.",
  "Tool contracts must be agent-ergonomic: namespaced ids, concrete descriptions, truncated returns.",
  "Fetch primary evidence (TinyFish) before broad search (Tavily); thin evidence → ungrounded.",
  "Reflexion loop: reflect in natural language → store episode memory → reuse on later generations.",
  "Maximor pattern (Track-2 inspiration): learn policy → run work → escalate judgment → improve.",
  "Cost/latency are first-class metrics alongside accuracy for Track-1 cost-effectiveness.",
];

writeFileSync(join(outDir, "ingest_bundle.json"), JSON.stringify(bundle, null, 2));
writeFileSync(
  join(outDir, "LESSONS.md"),
  `# Research lessons (live ingest)\n\nFetched: ${bundle.fetchedAt}\n\n` +
    bundle.lessons.map((l) => `- ${l}`).join("\n") +
    `\n\nRaw: \`docs/research/ingest_bundle.json\`\n`,
);

// Seed a demo workspace memory with research lessons (no forge LLM required for seeding).
const ws = createWorkspace({
  goal: "Apply agent-eval research lessons while extracting messy invoice lines",
  packId: "invoices",
  tools: ["parse_invoice", "normalize_money"],
  name: "research-seed-invoices",
});
addMemories(
  ws.id,
  "research_ingest",
  0,
  bundle.lessons.map((content) => ({ kind: "policy" as const, content })),
);
console.log("Seeded workspace memories:", ws.id, "lessons", bundle.lessons.length);

// Optional one forge gen so reflection can cite research memory (skip if SMITH_INGEST_SKIP_FORGE=1)
if (process.env.SMITH_INGEST_SKIP_FORGE !== "1") {
  try {
    const run = await forgeOnce(ws.id);
    console.log("Forge after research seed:", {
      accuracy: run.report.after.accuracy,
      memoryCount: run.report.memoryCount,
      passAtK: run.report.after.passAtK,
      suiteKind: run.report.after.suiteKind,
    });
  } catch (e) {
    console.warn("FORGE_AFTER_SEED_FAIL", e instanceof Error ? e.message : e);
  }
}

console.log("RESEARCH_INGEST_OK");
