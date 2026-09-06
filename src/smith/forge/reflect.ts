import { smithChat } from "../llm/client";
import type { FailClass, Metrics, Trace } from "./types";
import {
  addMemories,
  saveReflection,
  type AgentMemory,
  type MemoryKind,
  type Reflection,
} from "./memory";

export type LearningBundle = {
  reflection: Reflection;
  memoriesAdded: AgentMemory[];
};

function heuristicLessons(
  taxonomy: FailClass[],
  traces: Trace[],
  packId: string,
): Array<{ kind: MemoryKind; content: string }> {
  const out: Array<{ kind: MemoryKind; content: string }> = [];
  for (const f of taxonomy.slice(0, 4)) {
    out.push({
      kind: "failure",
      content: `Failure class ${f.id}: prefer ${f.suggestedPatch} patch. Examples: ${f.examples.join(", ")}`,
    });
  }
  const parseFails = traces.filter(
    (t) => !t.ok && (t.errorClass ?? "").includes("parse"),
  );
  if (parseFails.length) {
    out.push({
      kind: "policy",
      content:
        "Emit raw JSON only — no markdown fences — matching the output contract exactly.",
    });
  }
  if (packId === "invoices") {
    out.push({
      kind: "domain",
      content:
        "Never treat bank/MoMo/payment instructions as line items; discounts are negative amounts.",
    });
  }
  if (packId === "grounds") {
    out.push({
      kind: "tool",
      content:
        "Fetch evidence URL with TinyFish before Tavily search; if evidence is thin, verdict=ungrounded.",
    });
  }
  return out;
}

export async function reflectAndRemember(input: {
  workspaceId: string;
  runId: string;
  generation: number;
  packId: string;
  goal: string;
  metrics: Metrics;
  taxonomy: FailClass[];
  traces: Trace[];
  priorMemoryCount: number;
}): Promise<LearningBundle> {
  let lessonItems = heuristicLessons(input.taxonomy, input.traces, input.packId);
  let reflectionText = `Gen ${input.generation}: accuracy=${input.metrics.accuracy.toFixed(3)}, passed=${input.metrics.passed}/${input.metrics.cases}, latencyMs=${Math.round(input.metrics.latencyMs)}, costUsd=${input.metrics.costUsd.toFixed(4)}.`;
  let lessons = lessonItems.map((l) => l.content);

  try {
    const result = await smithChat(
      [
        {
          role: "system",
          content:
            'You are SMITH self-reflection for Track-1 agent engineering. Return ONLY JSON: {"reflection":string,"memories":[{"kind":"tool"|"domain"|"failure"|"policy","content":string}]}. Memories are durable lessons for later runs. Max 5. Be concrete about tools and domain quirks.',
        },
        {
          role: "user",
          content: JSON.stringify({
            goal: input.goal,
            packId: input.packId,
            generation: input.generation,
            metrics: input.metrics,
            taxonomy: input.taxonomy,
            failedTraces: input.traces
              .filter((t) => !t.ok)
              .slice(0, 6)
              .map((t) => ({
                caseId: t.caseId,
                errorClass: t.errorClass,
                expected: t.expected.slice(0, 160),
                actual: t.actual.slice(0, 160),
              })),
            priorMemoryCount: input.priorMemoryCount,
          }),
        },
      ],
      { temperature: 0.2, maxTokens: 700 },
    );
    const match = result.content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]) as {
        reflection?: string;
        memories?: Array<{ kind?: string; content?: string }>;
      };
      if (parsed.reflection) reflectionText = parsed.reflection;
      const mems = (parsed.memories ?? [])
        .map((m) => ({
          kind: (["tool", "domain", "failure", "policy"].includes(m.kind ?? "")
            ? (m.kind as MemoryKind)
            : "policy"),
          content: String(m.content ?? "").trim(),
        }))
        .filter((m) => m.content.length > 8);
      if (mems.length) {
        lessonItems = mems;
        lessons = mems.map((m) => m.content);
      }
    }
  } catch {
    // keep heuristic lessons
  }

  const reflection = saveReflection({
    workspaceId: input.workspaceId,
    runId: input.runId,
    generation: input.generation,
    reflection: reflectionText,
    lessons,
  });
  const memoriesAdded = addMemories(
    input.workspaceId,
    input.runId,
    input.generation,
    lessonItems,
  );
  return { reflection, memoriesAdded };
}
