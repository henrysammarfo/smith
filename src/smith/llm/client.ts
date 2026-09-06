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

type Candidate = { baseUrl: string; apiKey: string; model?: string };

function persistActiveEndpoint(baseUrl: string, model: string) {
  for (const file of [".env", ".env.local"]) {
    if (!existsSync(file)) continue;
    let text = readFileSync(file, "utf8");
    if (text.includes("AGENTROUTER_BASE_URL=")) {
      text = text.replace(
        /AGENTROUTER_BASE_URL=.*/g,
        `AGENTROUTER_BASE_URL=${baseUrl}`,
      );
    } else {
      text += `\nAGENTROUTER_BASE_URL=${baseUrl}\n`;
    }
    if (text.includes("LLM_MODEL=")) {
      text = text.replace(/LLM_MODEL=.*/g, `LLM_MODEL=${model}`);
    } else {
      text += `\nLLM_MODEL=${model}\n`;
    }
    writeFileSync(file, text);
  }
  process.env.AGENTROUTER_BASE_URL = baseUrl;
  process.env.LLM_MODEL = model;
  resetEnvCache();
}

function candidates(): Candidate[] {
  const env = getEnv();
  const list: Candidate[] = [];

  if (env.TENSORMUX_API_KEY) {
    list.push({
      baseUrl: env.TENSORMUX_BASE_URL,
      apiKey: env.TENSORMUX_API_KEY,
      model: "glm-4-7-flash",
    });
  }

  list.push(
    {
      baseUrl: env.AGENTROUTER_BASE_URL,
      apiKey: env.AGENTROUTER_API_KEY || env.TENSORMUX_API_KEY,
      model: env.LLM_MODEL,
    },
    {
      baseUrl: env.AGENTROUTER_PRIMARY_BASE_URL,
      apiKey: env.AGENTROUTER_API_KEY,
      model: env.LLM_MODEL,
    },
    {
      baseUrl: "https://co.agentrouter.org/v1",
      apiKey: env.AGENTROUTER_API_KEY,
    },
    {
      baseUrl: "https://agentrouter.org/v1",
      apiKey: env.AGENTROUTER_API_KEY,
    },
    {
      baseUrl: "http://127.0.0.1:11434/v1",
      apiKey: env.AGENTROUTER_API_KEY || "ollama",
      model: "llama3.2:1b",
    },
  );

  const seen = new Set<string>();
  return list.filter((c) => {
    if (!c.baseUrl || seen.has(c.baseUrl)) return false;
    seen.add(c.baseUrl);
    return true;
  });
}

function keyFor(baseUrl: string, apiKey: string): string {
  if (baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")) {
    return apiKey || "ollama";
  }
  return apiKey;
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

/** Probe TensorMux → AgentRouter → Ollama. Fail closed if none work. */
export async function healLlmEndpoint(): Promise<HealReport> {
  const env = getEnv();
  const probes: HealReport["probes"] = [];

  for (const candidate of candidates()) {
    const apiKey = keyFor(candidate.baseUrl, candidate.apiKey);
    const probe = await probeModels(candidate.baseUrl, apiKey);
    probes.push({ baseUrl: candidate.baseUrl, ...probe });
    if (!probe.ok) continue;

    let model = candidate.model ?? env.LLM_MODEL;
    if (candidate.baseUrl.includes("11434")) model = "llama3.2:1b";
    if (candidate.baseUrl.includes("tensormux.com")) model = "glm-4-7-flash";

    try {
      const smoke = await chatCompletion({
        baseUrl: candidate.baseUrl,
        apiKey,
        model,
        messages: [{ role: "user", content: "Reply with exactly SMITH_OK" }],
        maxTokens: 128,
        temperature: 0,
      });
      persistActiveEndpoint(candidate.baseUrl, model);
      return {
        selectedBaseUrl: candidate.baseUrl,
        model,
        probes,
        smoke: smoke.content.slice(0, 80),
      };
    } catch {
      // try next
    }
  }

  throw new LlmError(
    `No live OpenAI-compatible LLM endpoint available. Probes: ${JSON.stringify(probes)}. Set TENSORMUX_API_KEY, fix AGENTROUTER_API_KEY, or start Ollama.`,
  );
}

export async function smithChat(
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number; model?: string },
): Promise<ChatResult> {
  const env = getEnv();
  const baseUrl = env.AGENTROUTER_BASE_URL.includes("tensormux.com")
    ? env.AGENTROUTER_BASE_URL
    : env.TENSORMUX_API_KEY
      ? env.TENSORMUX_BASE_URL
      : env.AGENTROUTER_BASE_URL;

  const apiKey = baseUrl.includes("tensormux.com")
    ? env.TENSORMUX_API_KEY || env.AGENTROUTER_API_KEY
    : baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")
      ? env.AGENTROUTER_API_KEY || "ollama"
      : env.AGENTROUTER_API_KEY || env.TENSORMUX_API_KEY;

  if (!apiKey && !baseUrl.includes("127.0.0.1")) {
    throw new LlmError(
      "No LLM API key configured (TENSORMUX_API_KEY / AGENTROUTER_API_KEY)",
    );
  }

  const model =
    opts?.model ??
    (baseUrl.includes("tensormux.com") ? "glm-4-7-flash" : env.LLM_MODEL);

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
    const healedKey = healed.selectedBaseUrl.includes("tensormux.com")
      ? env.TENSORMUX_API_KEY || env.AGENTROUTER_API_KEY
      : healed.selectedBaseUrl.includes("127.0.0.1")
        ? apiKey || "ollama"
        : env.AGENTROUTER_API_KEY || env.TENSORMUX_API_KEY;
    return chatCompletion({
      baseUrl: healed.selectedBaseUrl,
      apiKey: healedKey,
      model: healed.model,
      messages,
      temperature: opts?.temperature,
      maxTokens: opts?.maxTokens,
    });
  }
}
