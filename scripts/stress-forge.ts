#!/usr/bin/env bun
/**
 * Stress harness: N live forge generations (no mocks).
 * Usage: bun scripts/stress-forge.ts [runs=100] [pack=invoices|grounds]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { healLlmEndpoint } from "../src/smith/llm/client";
import { createWorkspace, forgeOnce } from "../src/smith/forge/engine";

const runs = Number(process.argv[2] ?? 100);
const packId = (process.argv[3] ?? "invoices") as "invoices" | "grounds";
const outDir = "data/stress";
mkdirSync(outDir, { recursive: true });

type Row = {
  i: number;
  ok: boolean;
  ms: number;
  accuracy?: number;
  passed?: number;
  cases?: number;
  error?: string;
  generation?: number;
};

console.log(`STRESS start pack=${packId} runs=${runs}`);
const heal = await healLlmEndpoint();
console.log(`LLM ${heal.selectedBaseUrl} ${heal.model} smoke=${heal.smoke}`);

const ws = createWorkspace({
  goal:
    packId === "invoices"
      ? "Extract invoice line items from messy vendor text under stress"
      : "Audit claim groundedness with TinyFish+Tavily under stress",
  packId,
  tools:
    packId === "invoices"
      ? ["parse_invoice", "normalize_money"]
      : ["tinyfish_fetch", "tavily_search", "claim_score"],
  name: `stress-${packId}-${Date.now()}`,
});
console.log(`workspace ${ws.id}`);

const rows: Row[] = [];
const t0 = Date.now();

for (let i = 1; i <= runs; i++) {
  const started = Date.now();
  try {
    const result = await forgeOnce(ws.id);
    const after = result.report.after;
    const row: Row = {
      i,
      ok: true,
      ms: Date.now() - started,
      accuracy: after.accuracy,
      passed: after.passed,
      cases: after.cases,
      generation: result.report.generation,
    };
    rows.push(row);
    console.log(
      `ok ${i}/${runs} gen=${row.generation} acc=${row.accuracy?.toFixed(3)} passed=${row.passed}/${row.cases} ms=${row.ms}`,
    );
  } catch (e) {
    const row: Row = {
      i,
      ok: false,
      ms: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    };
    rows.push(row);
    console.error(`FAIL ${i}/${runs} ${row.error}`);
  }
}

const ok = rows.filter((r) => r.ok).length;
const fail = rows.length - ok;
const accs = rows.filter((r) => r.accuracy != null).map((r) => r.accuracy!);
const summary = {
  packId,
  runs,
  ok,
  fail,
  elapsedMs: Date.now() - t0,
  accuracyMin: accs.length ? Math.min(...accs) : null,
  accuracyMax: accs.length ? Math.max(...accs) : null,
  accuracyAvg: accs.length ? accs.reduce((a, b) => a + b, 0) / accs.length : null,
  workspaceId: ws.id,
  llm: { base: heal.selectedBaseUrl, model: heal.model },
  finishedAt: new Date().toISOString(),
};

writeFileSync(
  `${outDir}/${packId}-${runs}.json`,
  JSON.stringify({ summary, rows }, null, 2),
);
console.log(JSON.stringify(summary, null, 2));
console.log(`wrote ${outDir}/${packId}-${runs}.json`);
if (fail > 0) process.exitCode = 2;
