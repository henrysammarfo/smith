# Research lessons (live ingest)

Fetched: 2026-09-06T06:35:19.268Z

- Eval harness = tasks × trials × graders; report pass@k and pass^k, not a single lucky run.
- Keep a capability suite (hard, low pass) separate from a regression suite (near-100%).
- Prefer deterministic graders for structured outputs; use LLM graders only for nuance.
- Tool contracts must be agent-ergonomic: namespaced ids, concrete descriptions, truncated returns.
- Fetch primary evidence (TinyFish) before broad search (Tavily); thin evidence → ungrounded.
- Reflexion loop: reflect in natural language → store episode memory → reuse on later generations.
- Maximor pattern (Track-2 inspiration): learn policy → run work → escalate judgment → improve.
- Cost/latency are first-class metrics alongside accuracy for Track-1 cost-effectiveness.

Raw: `docs/research/ingest_bundle.json`
