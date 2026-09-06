import { smithChat } from "../llm/client";
import {
  AgentArchitectureSchema,
  type AgentArchitecture,
  type FailClass,
  type Metrics,
} from "./types";

const INVOICE_JSON_CONTRACT =
  'Return ONLY a JSON array of objects {"description":string,"amount":number}. No markdown, no prose. Discounts/credits are negative amounts. Never include bank, MoMo, remittance, PO, or payment rows.';

function hardenColdStart(arch: AgentArchitecture): AgentArchitecture {
  if (arch.packId !== "invoices") return arch;
  if (arch.outputContract !== "freeform" && arch.routerHint !== "unstructured") {
    return arch;
  }
  return {
    ...arch,
    name: `${arch.name}->json_contract`,
    routerHint: "extract_lines_before_totals",
    memoryPolicy: "cross_run_durable_memory",
    toolPolicy: "llm_only_with_amount_normalization",
    outputContract: INVOICE_JSON_CONTRACT,
    systemPrompt:
      "You extract invoice line items from messy vendor text. " +
      INVOICE_JSON_CONTRACT +
      " Ignore payment instructions. Normalize currency symbols away from amounts.",
    notes: `${arch.notes}|hardened_from_cold_start`,
  };
}

function applyHeuristicMutate(arch: AgentArchitecture, taxonomy: FailClass[]): AgentArchitecture {
  const top = taxonomy[0];
  let next: AgentArchitecture = hardenColdStart({
    ...arch,
    notes: `mutated:${top?.id ?? "none"}`,
  });
  if (!top) {
    next.systemPrompt +=
      "\nBe stricter: follow the output contract exactly. Double-check amounts and verdicts.";
    return next;
  }
  switch (top.suggestedPatch) {
    case "tool":
      next.toolPolicy =
        arch.packId === "grounds"
          ? "tinyfish_fetch_and_tavily_search_retry"
          : "llm_only_with_amount_normalization";
      next.systemPrompt +=
        "\nIf evidence is thin, say ungrounded rather than guessing. Normalize currency symbols away from amounts.";
      break;
    case "memory":
      next.memoryPolicy = "cross_run_durable_memory";
      next.systemPrompt +=
        "\nApply learned memory: skip payment rows; treat discounts as negative amounts; emit JSON only.";
      break;
    case "router":
      next.routerHint =
        arch.packId === "grounds"
          ? "always_fetch_url_before_search"
          : "extract_lines_before_totals";
      next.systemPrompt +=
        "\nIgnore payment, bank, and transfer instructions; they are not line items.";
      break;
    case "prompt":
    default:
      if (arch.packId === "invoices") {
        next.outputContract = INVOICE_JSON_CONTRACT;
      }
      next.systemPrompt +=
        "\nReturn ONLY valid JSON matching the contract. No markdown fences. Include negative discounts as negative amounts. For verdicts use exactly grounded or ungrounded.";
      break;
  }
  next.name = `${next.name}->${top.suggestedPatch}`;
  return next;
}

export async function mutateArchitecture(
  arch: AgentArchitecture,
  taxonomy: FailClass[],
  metrics: Metrics,
): Promise<AgentArchitecture> {
  const heuristic = applyHeuristicMutate(arch, taxonomy);
  try {
    const result = await smithChat(
      [
        {
          role: "system",
          content:
            "You mutate agent architectures for SMITH.forge. Return ONLY JSON matching the architecture schema fields.",
        },
        {
          role: "user",
          content: JSON.stringify({
            current: arch,
            metrics,
            taxonomy,
            instruction:
              "Improve the architecture to raise accuracy/reliability. Keep packId unchanged.",
          }),
        },
      ],
      { temperature: 0.2, maxTokens: 900 },
    );
    const match = result.content.match(/\{[\s\S]*\}/);
    if (!match) return heuristic;
    return AgentArchitectureSchema.parse({
      ...heuristic,
      ...JSON.parse(match[0]),
      packId: arch.packId,
    });
  } catch {
    return heuristic;
  }
}
