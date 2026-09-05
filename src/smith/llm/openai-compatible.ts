export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatResult = {
  content: string;
  model: string;
  baseUrl: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  costUsd: number;
};

export class LlmError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: string,
  ) {
    super(message);
    this.name = "LlmError";
  }
}

function estimateCostUsd(model: string, totalTokens: number): number {
  if (model.includes("llama") || model.includes("ollama")) return 0;
  return (totalTokens / 1_000_000) * 0.5;
}

export async function chatCompletion(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}): Promise<ChatResult> {
  const base = opts.baseUrl.replace(/\/$/, "");
  const started = Date.now();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (opts.apiKey) headers.Authorization = `Bearer ${opts.apiKey}`;

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 1200,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new LlmError(
      `LLM chat failed (${res.status}) at ${base}: ${raw.slice(0, 240)}`,
      res.status,
      raw,
    );
  }
  if (raw.trimStart().startsWith("<!DOCTYPE") || raw.includes("aliyun_waf")) {
    throw new LlmError(
      `LLM endpoint returned WAF HTML instead of JSON at ${base}`,
      res.status,
      raw.slice(0, 200),
    );
  }

  let data: {
    model?: string;
    choices?: Array<{ message?: { content?: string } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new LlmError(`LLM returned non-JSON at ${base}`, res.status, raw);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new LlmError(`LLM returned empty content at ${base}`, res.status, raw);
  }

  const promptTokens = data.usage?.prompt_tokens ?? 0;
  const completionTokens = data.usage?.completion_tokens ?? 0;
  const totalTokens = data.usage?.total_tokens ?? promptTokens + completionTokens;
  const model = data.model ?? opts.model;

  return {
    content,
    model,
    baseUrl: base,
    usage: { promptTokens, completionTokens, totalTokens },
    latencyMs: Date.now() - started,
    costUsd: estimateCostUsd(model, totalTokens),
  };
}

export async function probeModels(
  baseUrl: string,
  apiKey: string,
): Promise<{ ok: boolean; status: number; snippet: string }> {
  const base = baseUrl.replace(/\/$/, "");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  try {
    const res = await fetch(`${base}/models`, { headers });
    const text = await res.text();
    const looksJson = text.trimStart().startsWith("{") || text.trimStart().startsWith("[");
    const waf = text.includes("aliyun_waf") || text.includes("<!DOCTYPE");
    return {
      ok: res.ok && looksJson && !waf,
      status: res.status,
      snippet: text.slice(0, 160),
    };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      snippet: e instanceof Error ? e.message : String(e),
    };
  }
}
