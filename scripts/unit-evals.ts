#!/usr/bin/env bun
import assert from "node:assert/strict";
import { scoreInvoiceLines } from "../src/smith/evals/invoices/pack";
import { classifyFailures } from "../src/smith/forge/taxonomy";
import type { Trace } from "../src/smith/forge/types";

const perfect = scoreInvoiceLines(
  [
    { description: "Widget A", amount: 10 },
    { description: "Widget B", amount: 5 },
  ],
  [
    { description: "widget a", amount: 10 },
    { description: "widget b", amount: 5 },
  ],
);
assert.equal(perfect.accuracy, 1);

const miss = scoreInvoiceLines(
  [{ description: "Widget A", amount: 10 }],
  [{ description: "Widget A", amount: 11 }],
);
assert.ok(miss.accuracy < 1);

const traces: Trace[] = [
  {
    caseId: "c1",
    ok: false,
    expected: "x",
    actual: "y",
    errorClass: "parse_failure",
    latencyMs: 1,
    costUsd: 0,
  },
  {
    caseId: "c2",
    ok: false,
    expected: "x",
    actual: "y",
    errorClass: "parse_failure",
    latencyMs: 1,
    costUsd: 0,
  },
  {
    caseId: "c3",
    ok: true,
    expected: "x",
    actual: "x",
    latencyMs: 1,
    costUsd: 0,
  },
];
const taxonomy = classifyFailures(traces);
assert.equal(taxonomy[0]?.id, "parse_failure");
assert.equal(taxonomy[0]?.count, 2);
assert.equal(taxonomy[0]?.suggestedPatch, "prompt");
console.log("UNIT_OK scorers+taxonomy");
