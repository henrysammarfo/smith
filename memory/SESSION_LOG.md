# SESSION_LOG

## 2026-09-05 — Track-1 forge implementation
- Fact-checked Luma + official brief via Tavily/TinyFish.
- Confirmed AgentRouter apex WAF; `co.agentrouter.org` JSON API; provided key → 401.
- Healed live LLM via Ollama OpenAI-compatible endpoint (`llama3.2:1b`, smoke `SMITH_OK`).
- Scaffolded memory/, Cursor rules/skills, forge engine, two eval packs, dashboard routes, SUBMIT.md.
- Doctrine: no mock scores, no unhackable claims, Devpost-first submit.
## 2026-09-05 — Production forge ship
- Renamed `src/server` → `src/smith` so TanStack Start client import-protection allows server-fn RPCs.
- Live smoke: invoice pack accuracy 0.39 → 0.72 after mutate (Ollama llama3.2:1b).
- AO cloud attempt: AppImage v0.12.10 under xvfb; no fabricated sessions; judging path remains desktop AO.
- Added SUBMIT.md + docs/THREAT_MODEL.md; build green; lint errors autofixed.

## 2026-09-05 — TensorMux live
- Wired TensorMux OpenAI-compat (`api.tensormux.com/v1`, `glm-4-7-flash`) as primary heal candidate.
- Key stored only in gitignored `.env` (was pasted in Discord — rotate after hackathon).
- Heal smoke SMITH_OK; invoice forge smoke 5/5 accuracy=1.0 on TensorMux.
- AgentRouter/Ollama remain ordered fallbacks; no mock completions.
