---
name: smith-forge-loop
description: Run the SMITH forge loop — propose architecture, eval, classify failures, mutate, report card. Use when forging agents, improving generations, or wiring dashboard forge actions.
---

# SMITH forge loop

1. Load workspace + eval pack id (`invoices` | `grounds`).
2. `proposeArchitecture` → persist generation.
3. `runEval` → traces + metrics.
4. `classifyFailures` → taxonomy.
5. `mutate` → next generation (prompt/tool/memory/router).
6. Render report card (accuracy, reliability, cost, latency) before/after.

Entry: `src/smith/forge/engine.ts`. No mock scores.
