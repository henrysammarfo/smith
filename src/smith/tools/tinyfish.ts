import { getEnv } from "../env";

export type TinyFishSearchHit = {
  title: string;
  url: string;
  snippet: string;
};

export async function tinyFishSearch(query: string): Promise<TinyFishSearchHit[]> {
  const env = getEnv();
  if (!env.TINYFISH_API_KEY) throw new Error("TINYFISH_API_KEY missing");
  const base = env.TINYFISH_BASE_URL.replace(/\/$/, "");
  const url = new URL(`${base}/search`);
  url.searchParams.set("query", query);
  const res = await fetch(url, {
    headers: {
      "X-API-Key": env.TINYFISH_API_KEY,
      Accept: "application/json",
    },
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`TinyFish search failed (${res.status}): ${raw.slice(0, 200)}`);
  }
  const data = JSON.parse(raw) as {
    results?: Array<{ title?: string; url?: string; snippet?: string }>;
  };
  return (data.results ?? []).map((r) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    snippet: r.snippet ?? "",
  }));
}

export async function tinyFishFetch(
  urls: string[],
): Promise<Array<{ url: string; title: string; text: string }>> {
  const env = getEnv();
  if (!env.TINYFISH_API_KEY) throw new Error("TINYFISH_API_KEY missing");
  const base = env.TINYFISH_BASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/fetch`, {
    method: "POST",
    headers: {
      "X-API-Key": env.TINYFISH_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ urls }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`TinyFish fetch failed (${res.status}): ${raw.slice(0, 200)}`);
  }
  const data = JSON.parse(raw) as {
    results?: Array<{ url?: string; title?: string; text?: string }>;
  };
  return (data.results ?? []).map((r) => ({
    url: r.url ?? "",
    title: r.title ?? "",
    text: r.text ?? "",
  }));
}
