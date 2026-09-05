#!/usr/bin/env bun
import { healLlmEndpoint } from "../src/smith/llm/client";

const report = await healLlmEndpoint();
console.log(JSON.stringify(report, null, 2));
if (!report.selectedBaseUrl) {
  console.error("HEAL_FAILED: no base URL");
  process.exit(1);
}
console.log("HEAL_OK", report.selectedBaseUrl, report.model, report.smoke);
