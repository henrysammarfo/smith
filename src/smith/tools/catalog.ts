/**
 * Agent-facing tool catalog (Anthropic "Writing effective tools for agents").
 * Namespaced ids, concrete descriptions, token-aware return contracts.
 */
export type ToolSpec = {
  /** Namespaced id — reduces tool confusion under many tools */
  id: string;
  title: string;
  description: string;
  whenToUse: string;
  returns: string;
  maxChars: number;
};

export const SMITH_TOOLS: Record<string, ToolSpec> = {
  "smith.tavily.search": {
    id: "smith.tavily.search",
    title: "Tavily web search",
    description:
      "Search the public web for current evidence snippets and a short answer summary.",
    whenToUse:
      "After fetching a primary evidence URL, or when a claim needs corroborating sources.",
    returns: "answer + up to N {title,url,content} snippets (content truncated).",
    maxChars: 1200,
  },
  "smith.tinyfish.search": {
    id: "smith.tinyfish.search",
    title: "TinyFish search",
    description: "Agent-oriented web search via TinyFish Search API.",
    whenToUse: "Discovery when Tavily is unavailable or alternate ranking is useful.",
    returns: "[{title,url,snippet}] truncated for token efficiency.",
    maxChars: 800,
  },
  "smith.tinyfish.fetch": {
    id: "smith.tinyfish.fetch",
    title: "TinyFish fetch",
    description: "Fetch and extract readable text from one or more evidence URLs.",
    whenToUse:
      "Always fetch the claim's primary evidence URL before judging groundedness.",
    returns: "[{url,title,text}] with text capped per URL.",
    maxChars: 4000,
  },
};

export function truncateToolText(text: string, maxChars: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, Math.max(0, maxChars - 1))}…`;
}

export function toolPromptBlock(ids: string[]): string {
  return ids
    .map((id) => SMITH_TOOLS[id])
    .filter(Boolean)
    .map(
      (t) =>
        `- ${t!.id}: ${t!.description} When: ${t!.whenToUse} Returns: ${t!.returns}`,
    )
    .join("\n");
}
