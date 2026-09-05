# Threat model — SMITH.forge (V1)

## Assets
- Operator goals, eval fixtures, forge traces in SQLite (`data/smith.db`)
- API keys in `.env` (AgentRouter, Tavily, TinyFish)
- Generated architectures / report cards

## Trust boundaries
- Browser UI → TanStack server functions → SQLite / external APIs
- LLM providers (AgentRouter / local Ollama) are untrusted for correctness
- TinyFish / Tavily responses are untrusted evidence text

## Risks (residual)
| Risk | Mitigation | Residual |
|---|---|---|
| Prompt injection via fixtures or fetched pages | Output contracts + scorers; fail taxonomy | High — LLM can still be steered |
| Secrets leakage via logs/chat | `.env` gitignored; never paste keys in chat | Medium — ops discipline |
| SQLite local file exposure | Local path; not multi-tenant auth | High if host shared |
| Fake eval confidence | No mock scores; fail closed without LLM | Low if heal works |
| Fabricated AO sessions | Explicitly forbidden; dual-path docs | N/A if followed |
| Supply-chain AppImage | Download from GitHub releases only; document outcome | Medium |

## Explicit non-claims
- Not “unhackable,” not nation-state resistant, not a security product.
- Report cards measure eval pack scores, not absolute agent safety.
