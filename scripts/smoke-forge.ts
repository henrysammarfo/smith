#!/usr/bin/env bun
import { healLlmEndpoint } from "../src/smith/llm/client";
import { createWorkspace, forgeOnce } from "../src/smith/forge/engine";
import { listMemories, listReflections } from "../src/smith/forge/memory";

console.log("Healing LLM…");
const heal = await healLlmEndpoint();
console.log("LLM:", heal.selectedBaseUrl, heal.model, heal.smoke);

const ws = createWorkspace({
  goal: "Extract invoice line items from messy vendor text",
  packId: "invoices",
  tools: ["parse_invoice", "normalize_money"],
  name: "smoke-invoices-learn",
});
console.log("Workspace:", ws.id);

const gen1 = await forgeOnce(ws.id);
console.log("Gen1 metrics:", gen1.report.after);
console.log("Gen1 memoryCount:", gen1.report.memoryCount);
console.log("Gen1 reflection:", gen1.report.reflection?.slice(0, 200));
console.log(
  "Gen1 taxonomy:",
  gen1.report.taxonomy.map((t) => `${t.id}:${t.suggestedPatch}`),
);

const gen2 = await forgeOnce(ws.id);
console.log("Gen2 metrics:", gen2.report.after);
console.log("Gen2 memoryCount:", gen2.report.memoryCount);
console.log("Delta accuracy:", gen2.report.delta.accuracy);
console.log(
  "Trajectory:",
  gen2.report.trajectory?.map((t) => `G${t.generation}=${t.accuracy.toFixed(3)}`).join(" → "),
);

const memories = listMemories(ws.id);
const reflections = listReflections(ws.id);
console.log("Durable memories:", memories.length);
console.log("Reflections:", reflections.length);

const improved =
  gen2.report.after.accuracy > gen1.report.after.accuracy ||
  (gen1.report.after.accuracy < 0.99 && gen2.report.after.accuracy >= gen1.report.after.accuracy);
const learned = memories.length > 0 && reflections.length >= 2;

if (!learned) {
  console.error("SMOKE_FAIL: expected growing memory + reflections");
  process.exit(1);
}
console.log(
  improved
    ? "LEARNING_VISIBLE: accuracy improved or held after weak start"
    : "LEARNING_PARTIAL: memory grew; accuracy already high or flat",
);
console.log("SMOKE_OK");
