# Agent engineering breakthroughs → SMITH.forge

Sources: Anthropic evals/tools posts, Claude Managed Agents docs, Maximor patterns,
Reflexion (Shinn et al.), plus live Tavily + TinyFish crawl (`agent_engineering_sources.json`).

## What judges want (Track 1)

Learning loops > domain polish. Show: reflection, growing memory, tool lessons reused later, cost/speed.

## Breakthrough → implementation map

| Insight | Source | SMITH wiring |
|---|---|---|
| Eval = task × trials × graders × transcript + outcome | Anthropic *Demystifying evals* | `trials.ts` pass@k / pass^k; outcome graders on fixtures |
| Capability evals (hard, low pass) vs regression (near-100%) | Anthropic evals | Cold-start freeform = capability hill; hardened JSON contract = regression guard |
| Prefer code graders when possible; LLM graders for nuance | Anthropic evals | Invoice line scorer is deterministic; reflection uses LLM |
| Tools are contracts with non-deterministic agents | Anthropic *Writing tools* | `tools/catalog.ts` namespaced tool ids + token-trimmed returns |
| Meaningful, truncated tool context; clear descriptions | Anthropic tools | Tavily/TinyFish wrappers return capped snippets + `tool` id |
| Verbal RL: reflect → store episode → reuse next attempt | Reflexion (2303.11366) | `reflect.ts` + SQLite memories injected at eval time |
| Learn → run → escalate judgment → improve policy | Maximor CFO loop (Track 2 pattern, reused for meta-agents) | Forge: eval → taxonomy → reflect → mutate → next gen |
| Managed harness: session, tools, durable state | Claude Managed Agents | Workspace generations + AO desktop as outer harness |

## Papers / links (live-fetched)

- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- https://www.anthropic.com/engineering/writing-tools-for-agents
- https://platform.claude.com/docs/en/managed-agents/overview
- https://arxiv.org/abs/2303.11366 (Reflexion)
- https://www.maximor.ai/ (autonomous finance — pattern reference only; we are Track 1)
- https://www.youtube.com/@MaximorAI

## Honest limits

- Multi-trial raises cost; default `SMITH_EVAL_TRIALS=1`, set `3` for capability runs.
- TinyFish automation credits may be 0; Search/Fetch only.
- Never claim unhackable; AO judging sessions are desktop-only.
