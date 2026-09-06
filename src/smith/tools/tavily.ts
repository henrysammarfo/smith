import { getEnv } from "../env";
import { SMITH_TOOLS, truncateToolText } from "./catalog";

export type TavilyResult = {
  title: string;
  url: string;
  content: string;
};

/** Namespaced tool id for agent prompts / traces */
export const TAVILY_TOOL_ID = SMITH_TOOLS["smith.tavily.search"]!.id;

export async function tavilySearch(
  query: string,
  opts?: { maxResults?: number },
): Promise<{ tool: string; answer?: string; results: TavilyResult[] }> {
  const key = getEnv().TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY missing");
  const maxChars = SMITH_TOOLS["smith.tavily.search"]!.maxChars;
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query,
      search_depth: "basic",
      include_answer: true,
      max_results: opts?.maxResults ?? 5,
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Tavily search failed (${res.status}): ${raw.slice(0, 200)}`);
  }
  const data = JSON.parse(raw) as {
    answer?: string;
    results?: Array<{ title?: string; url?: string; content?: string }>;
  };
  return {
    tool: TAVILY_TOOL_ID,
    answer: data.answer ? truncateToolText(data.answer, 400) : undefined,
    results: (data.results ?? []).map((r) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: truncateToolText(r.content ?? "", Math.floor(maxChars / 3)),
    })),
  };
}
