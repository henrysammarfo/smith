# Findings — stress, AO, sponsor tooling (Syndicate)

Last updated: 2026-09-05. Honest residual risk; no “unhackable” claims.

## Scope

- SMITH forge: heal → forgeOnce → report card (TensorMux primary)
- AO desktop: operator path (countable sessions)
- Sponsors: TensorMux, Tavily, TinyFish

## Verified good

| Finding | Evidence |
|---|---|
| TensorMux OpenAI-compat works as drop-in | `bun run heal` → `SMITH_OK`; base `https://api.tensormux.com/v1` |
| Model id `glm-4-7-flash` | `/v1/models` list |
| GLM sometimes fills `reasoning` before `content` | Client falls back; prefer `chat_template_kwargs.enable_thinking=false` + enough `max_tokens` |
| Invoice pack stable at 1.0 on TensorMux | Smoke + stress×3: 5/5 passed |
| SQLite persistence survives multi-gen | Generations increment; report `before`/`after` populated |
| Cloud AO AppImage downloads | `data/ao-cloud-attempt/report.json` |
| Cloud AO does **not** register judging sessions | Same report; `sessionsFabricated=false` |

## Bugs / sharp edges (AO / TensorMux / SMITH)

| ID | Area | Symptom | Severity | Workaround (replayable) | Suggested product fix |
|---|---|---|---|---|---|
| TMX-1 | TensorMux GLM | `content: null` with short `max_tokens` while `reasoning` burns the budget | Med | Set `max_tokens≥128` and `chat_template_kwargs: { enable_thinking: false }` | Document thinking toggle; default content-first for tool agents |
| TMX-2 | TensorMux | Discord copy said model alias; `/models` is source of truth (`glm-4-7-flash`) | Low | Always `GET /v1/models` after key mint | Pin alias table in dashboard |
| AR-1 | AgentRouter | Apex host returns Aliyun WAF HTML | High for that path | Use `co.agentrouter.org` or TensorMux/Ollama | Publish stable OpenAI base in docs |
| AR-2 | AgentRouter | Provided key 401 Invalid API Key on bypass host | High | Fail closed → TensorMux/Ollama heal | Key provisioning / rotate flow |
| AO-1 | AO cloud | AppImage under xvfb launches extract but no countable session | High for “cloud sessions” claim | **Desktop AO only** for judging; document honestly | Headless session API or explicit “cloud session” product |
| AO-2 | AO install surface | Multiple asset name styles on release (`Agent.Orchestrator.*` vs `agent-orchestrator-*`) | Low | Prefer README “latest/download/…” links | Single canonical filename set |
| SM-1 | SMITH | No end-user auth/login yet (marketing + forge) | Med for “enterprise” | Ship as hackathon demo; put AO/GitHub behind operator machine | Add auth (e.g. Clerk) before multi-tenant |
| SM-2 | SMITH | Grounds pack needs live Tavily+TinyFish network; TinyFish automation credits=0 | Med | Use Search/Fetch only | Cache fixtures + credit meter in UI |
| SM-3 | SMITH | TanStack import-protection blocks `src/server/**` from client | Low | Keep modules under `src/smith/**` | Document in starter templates |

## Stress plan (this agent)

- [x] Heal / unit / smoke / build
- [x] Stress ×3 invoices (sanity)
- [ ] Stress ×100 invoices (running / queued)
- [ ] Stress ×20 grounds (network)
- [ ] Route crawl: `/`, `/start`, `/dashboard/*`, `/brand`
- [ ] Security pass: no secrets in git, threat model current

## AO findings to feed back to sponsors

1. **Judging path ≠ headless path.** AppImage+xvfb is useful CI evidence but does not create countable sessions — say this in docs so hackers do not burn hours.
2. **Installer matrix is good**; “latest/download/…” URLs are the right DX.
3. **Kanban + workers** is the differentiator — demo video should show board + session cards, not only a browser.
4. Ask for: session export JSON for Devpost proof; headless auth for CI; clearer pass deep-link after install.

## Security / standards posture (honest)

- Secrets: `.env` gitignored; rotate keys pasted in chat
- No mock LLM scores
- No fabricated AO sessions
- Threat model: `docs/THREAT_MODEL.md`
- Not claiming SOC2/ISO certification — hackathon demo with documented residual risk
- Missing for true multi-tenant enterprise: authN/Z, tenant isolation, audit log, rate limits, CSP review

## Next operator actions

1. Follow `docs/AO_DESKTOP_SETUP.md` end-to-end  
2. Accumulate real AO sessions while forge stress finishes  
3. Record demo video with AO counter visible  
4. Submit on Devpost using `SUBMIT.md`
