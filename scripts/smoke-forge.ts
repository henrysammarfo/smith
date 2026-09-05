#!/usr/bin/env bun
import { healLlmEndpoint } from "../src/smith/llm/client";
import { createWorkspace, forgeOnce } from "../src/smith/forge/engine";

console.log("Healing LLM…");
const heal = await healLlmEndpoint();
console.log("LLM:", heal.selectedBaseUrl, heal.model, heal.smoke);

const ws = createWorkspace({
  goal: "Extract invoice line items from messy vendor text",
  packId: "invoices",
  tools: ["parse_invoice", "normalize_money"],
  name: "smoke-invoices",
});
console.log("Workspace:", ws.id);

const gen1 = await forgeOnce(ws.id);
console.log("Gen1 metrics:", gen1.report.after);
console.log(
  "Gen1 taxonomy:",
  gen1.report.taxonomy.map((t) => `${t.id}:${t.suggestedPatch}`),
);

const gen2 = await forgeOnce(ws.id);
console.log("Gen2 metrics:", gen2.report.after);
console.log("Delta accuracy:", gen2.report.delta.accuracy);
console.log("SMOKE_OK");
