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

## 2026-09-06 — Track-1 learning-loop alignment
- Judge tip: Track 1 scores learning (reflection, memory growth, tool context reuse, cost/speed) over domain polish/auth.
- Added SQLite `memories`/`reflections`, `reflectAndRemember`, eval-time memory inject, cold-start weaken + harder invoice fixtures.
- Mutate hardens freeform → JSON contract; forge UI shows trajectory/reflection/memory; `docs/TRACK1_DEMO.md`.
- Live smoke: Gen1 accuracy **0.0** → Gen2 **1.0** (7 cases); durable memories 3→6; reflections 2; `LEARNING_VISIBLE` / `SMOKE_OK`.

## 2026-09-06 — Research ingest + eval/tool breakthroughs + AO coding-agent gate
- Fetched Anthropic evals/tools posts, Claude Managed Agents, Maximor; Tavily+TinyFish live crawl → `docs/research/`.
- Wired Anthropic-style `passAtK`/`passCaretK`/`suiteKind`, tool catalog (namespaced + truncated), `bun run research`.
- Documented AO next step: install Claude Code/Codex/opencode/Copilot CLI on PATH (`docs/AO_DESKTOP_SETUP.md` §3a).
- Re-smoke: Gen1 0→Gen2 1, passAtK 0→1, suiteKind capability→regression, memories 4→8.

## 2026-09-06 — Public-ready: scrub, merge main, visibility
- Confirmed no live API keys in tracked MDs/JSON; `.env` gitignored; docs use `YOUR_*` placeholders.
- README: Windows clone + secrets doctrine + OpenCode/TensorMux AO path.
- Merge Track-1 branch → `main`; set GitHub repo visibility public for operator clone + Devpost.

## 2026-09-06 — Merged to main; public visibility needs owner
- Merged `cursor/smith-forge-track1-255e` → `main` (`39077e2`) and pushed.
- Secret scan clean; `.env` gitignored.
- `gh`/`API` cannot set visibility (403 Resource not accessible by integration). Owner must: Settings → Danger Zone → Change visibility → Public.

## 2026-09-06 — Judge docs + Excalidraw + Vercel
- Added simple README/FOR_JUDGES/ARCHITECTURE; mermaid→png + `.excalidraw` scenes.
- Script `scripts/mermaid-to-excalidraw.mjs` uses Excalidraw libs in headless Chrome.
- Preparing Vercel git project deploy for henrysammarfo/smith.

## 2026-09-06 — Prod polish: auth, hero video, brand, Vercel env request
- Session auth + owner-scoped workspaces (multitenant).
- Hero background video (CloudFront) at full opacity; no Lovable meta/OG.
- Favicon/OG = SMITH mark; /start select dark-theme fix.
- Requested VERCEL_TOKEN / dashboard env so live forge can call LLM.
- AO next: message agent on smith project with smoke + forge tasks (`docs/AO_NEXT.md`).

## 2026-09-06 — Vercel envs + forge workspace handoff + cursor demo
- Upserted TensorMux/AgentRouter/Tavily/TinyFish envs on Vercel `smith` via temporary token; production redeployed from `henrysammarfo/smith` main.
- Fixed `/start` → `/dashboard/forge?workspaceId=` so Forge once is enabled after open.
- Recording headed Chrome cursor/zoom demo (Gen1→Gen2) for Devpost.

## 2026-09-06 — Bundle eval fixtures for Vercel + cursor demo retry
- Production forge failed: `ENOENT ... /var/task/src/smith/evals/invoices/fixtures` (JSON not in serverless output).
- Fix: `import.meta.glob` eager bundle of invoice/grounds fixtures + Nitro `serverAssets` for `src/smith/evals`.
- Re-recording Gen1→Gen2 cursor/zoom demo after redeploy.

## 2026-09-06 — Cursor Gen1→Gen2 demo recorded
- Local headed Chrome demo with visible cursor + zoom: Gen1 **0.0%** → Gen2 **100.0%**, memories 4→7.
- Artifact: `/opt/cursor/artifacts/smith-cursor-forge-gen1-gen2.mp4`
- Vercel production auth flaky (SQLite sessions on serverless); fixtures bundled for forge ENOENT fix.
- Vercel envs refreshed with provided token (expires ~1h) — rotate after use.
