import { getEnv } from "../env";

export type TavilyResult = {
  title: string;
  url: string;
  content: string;
};

export async function tavilySearch(
  query: string,
  opts?: { maxResults?: number },
): Promise<{ answer?: string; results: TavilyResult[] }> {
  const key = getEnv().TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY missing");
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
    answer: data.answer,
    results: (data.results ?? []).map((r) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: r.content ?? "",
    })),
  };
}
