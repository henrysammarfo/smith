import { z } from "zod";

export const PackIdSchema = z.enum(["invoices", "grounds"]);
export type PackId = z.infer<typeof PackIdSchema>;

export const AgentArchitectureSchema = z.object({
  name: z.string(),
  packId: PackIdSchema,
  systemPrompt: z.string(),
  routerHint: z.string(),
  memoryPolicy: z.string(),
  toolPolicy: z.string(),
  outputContract: z.string(),
  notes: z.string().default(""),
});
export type AgentArchitecture = z.infer<typeof AgentArchitectureSchema>;

export const MetricsSchema = z.object({
  accuracy: z.number(),
  reliability: z.number(),
  costUsd: z.number(),
  latencyMs: z.number(),
  cases: z.number(),
  passed: z.number(),
  /** Anthropic-style multi-trial: ≥1 success in k trials */
  passAtK: z.number().optional(),
  /** Anthropic-style multi-trial: success on all k trials */
  passCaretK: z.number().optional(),
  trialsPerCase: z.number().optional(),
  suiteKind: z.enum(["capability", "regression", "mixed"]).optional(),
});
export type Metrics = z.infer<typeof MetricsSchema>;

export const FailClassSchema = z.object({
  id: z.string(),
  label: z.string(),
  count: z.number(),
  examples: z.array(z.string()),
  suggestedPatch: z.enum(["prompt", "tool", "memory", "router"]),
});
export type FailClass = z.infer<typeof FailClassSchema>;

export const TraceSchema = z.object({
  caseId: z.string(),
  ok: z.boolean(),
  expected: z.string(),
  actual: z.string(),
  errorClass: z.string().optional(),
  latencyMs: z.number(),
  costUsd: z.number(),
  raw: z.string().optional(),
});
export type Trace = z.infer<typeof TraceSchema>;

export type LearningMemory = {
  id: string;
  kind: string;
  content: string;
  generation: number;
};

export type ReportCard = {
  before: Metrics | null;
  after: Metrics;
  delta: {
    accuracy: number;
    reliability: number;
    costUsd: number;
    latencyMs: number;
  };
  taxonomy: FailClass[];
  generation: number;
  /** Track-1: self-reflection after this run */
  reflection?: string;
  /** Track-1: new durable memories written this run */
  memoriesAdded?: LearningMemory[];
  /** Track-1: total memory size after this run */
  memoryCount?: number;
  /** Track-1: accuracy trajectory across generations in workspace */
  trajectory?: Array<{ generation: number; accuracy: number; costUsd: number; latencyMs: number }>;
};
