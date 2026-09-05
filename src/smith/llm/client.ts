import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { getEnv, resetEnvCache } from "../env";
import {
  chatCompletion,
  probeModels,
  type ChatMessage,
  type ChatResult,
  LlmError,
} from "./openai-compatible";

export { LlmError, type ChatMessage, type ChatResult };

const CANDIDATE_BASES = [
  "https://co.agentrouter.org/v1",
  "https://agentrouter.org/v1",
  "http://127.0.0.1:11434/v1",
];

function persistBaseUrl(baseUrl: string) {
  for (const file of [".env", ".env.local"]) {
    if (!existsSync(file)) continue;
    let text = readFileSync(file, "utf8");
    if (text.includes("AGENTROUTER_BASE_URL=")) {
      text = text.replace(/AGENTROUTER_BASE_URL=.*/g, `AGENTROUTER_BASE_URL=${baseUrl}`);
    } else {
      text += `\nAGENTROUTER_BASE_URL=${baseUrl}\n`;
    }
    writeFileSync(file, text);
  }
  process.env.AGENTROUTER_BASE_URL = baseUrl;
  resetEnvCache();
}

export type HealReport = {
  selectedBaseUrl: string;
  model: string;
  probes: Array<{
    baseUrl: string;
    ok: boolean;
    status: number;
    snippet: string;
  }>;
  smoke?: string;
};

/** Probe AgentRouter hosts then local Ollama; fail closed if none work. */
export async function healLlmEndpoint(): Promise<HealReport> {
  const env = getEnv();
  const bases = [
    env.AGENTROUTER_BASE_URL,
    env.AGENTROUTER_PRIMARY_BASE_URL,
    ...CANDIDATE_BASES,
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const probes: HealReport["probes"] = [];
  let model = env.LLM_MODEL;

  for (const baseUrl of bases) {
    const key =
      baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")
        ? env.AGENTROUTER_API_KEY || "ollama"
        : env.AGENTROUTER_API_KEY;
    const probe = await probeModels(baseUrl, key);
    probes.push({ baseUrl, ...probe });
    if (!probe.ok) continue;

    if (baseUrl.includes("11434")) {
      model = "llama3.2:1b";
    }

    try {
      const smoke = await chatCompletion({
        baseUrl,
        apiKey: key,
        model,
        messages: [{ role: "user", content: "Reply with exactly SMITH_OK" }],
        maxTokens: 16,
        temperature: 0,
      });
      persistBaseUrl(baseUrl);
      return {
        selectedBaseUrl: baseUrl,
        model,
        probes,
        smoke: smoke.content.slice(0, 80),
      };
    } catch {
      // try next
    }
  }

  throw new LlmError(
    `No live OpenAI-compatible LLM endpoint available. Probes: ${JSON.stringify(probes)}. Start Ollama or fix AGENTROUTER_API_KEY.`,
  );
}

export async function smithChat(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number; model?: string },
): Promise<ChatResult> {
  const env = getEnv();
  const baseUrl = env.AGENTROUTER_BASE_URL;
  const apiKey =
    baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")
      ? env.AGENTROUTER_API_KEY || "ollama"
      : env.AGENTROUTER_API_KEY;
  if (!apiKey && !baseUrl.includes("127.0.0.1")) {
    throw new LlmError("AGENTROUTER_API_KEY missing and no local LLM base configured");
  }
  const model = opts?.model ?? env.LLM_MODEL;
  try {
    return await chatCompletion({
      baseUrl,
      apiKey,
      model,
      messages,
      temperature: opts?.temperature,
      maxTokens: opts?.maxTokens,
    });
  } catch {
    const healed = await healLlmEndpoint();
    return chatCompletion({
      baseUrl: healed.selectedBaseUrl,
      apiKey: healed.selectedBaseUrl.includes("127.0.0.1")
        ? apiKey || "ollama"
        : env.AGENTROUTER_API_KEY,
      model: healed.model,
      messages,
      temperature: opts?.temperature,
      maxTokens: opts?.maxTokens,
    });
  }
}
