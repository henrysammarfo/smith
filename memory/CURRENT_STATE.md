# CURRENT_STATE — SMITH.forge

## Product
**SMITH** = meta-agent forge for Syndicate Track 1 (**Automated Agent Engineering**).
Loop: goal + tools + eval → propose architecture → run eval → fail taxonomy → **self-reflect** → **durable memory** → mutate → report card with trajectory.
Domains: (1) messy invoice line-items (2) GROUNDS-lite claim check.

## Track-1 judging focus
Judges ask: learning over time, visible reflection/memory growth, contextual tool lessons reused later, cost/speed balance — **not** domain polish or auth.

## Stack
TanStack Start + Vite (Lovable), Zod, better-sqlite3, OpenAI-compatible LLM client
(**TensorMux primary** → AgentRouter → Ollama), Tavily, TinyFish.

## Live wiring (verified)
- **LLM:** TensorMux `https://api.tensormux.com/v1` + `glm-4-7-flash` (hackathon credits). Heal smoke `SMITH_OK`.
- AgentRouter apex still WAF; `co.agentrouter.org` key was 401 — kept as fallback probe only.
- Ollama local remains last-resort fallback.
- Persistence: SQLite under `data/` (gitignored) — workspaces, generations, runs, **memories**, **reflections**.
- Server modules under `src/smith/**` (TanStack blocks `**/server/**` from client).

## Learning loop (Track 1)
- Cold-start invoice arch is intentionally weak (`freeform` / unstructured).
- Harder fixtures: `inv_006`, `inv_007` (MoMo/bank noise, negative credits).
- Post-run `reflectAndRemember` writes reflection + durable lessons.
- Next gen: mutate hardens JSON contract; memory block injected at eval time only.
- UI `/dashboard/forge` shows reflection, new memories, trajectory, growing memory panel.

## Routes
`/`, marketing, `/start`, `/dashboard`, `/dashboard/forge`, `/dashboard/agents`, `/dashboard/runs`, `/brand`.

## AO
- Judging: operator desktop AO sessions (mandatory for demo video).
- Cloud AppImage attempt: no countable session; `sessionsFabricated=false`.

## Contest locks
- Track: Automated Agent Engineering
- Submit: Devpost `https://syndicate-by-maximor.devpost.com/`
- Discord join mandatory; showcase ≠ submit
- Window: 2026-09-05 21:30 IST → 2026-09-07 03:30 IST
- Inference sponsor: TensorMux (50M tokens, ~30h window from announcement)

## Quality
- `bun run unit` OK; `bun run smoke` OK — Gen1 **0.0** → Gen2 **1.0**, memories 3→6, reflections 2 (TensorMux)
- Lint: 0 errors (UI-kit react-refresh warnings only)

## Non-goals (V1)
CFO track, payments/SSO, fake AO sessions, mock LLM scores, “unhackable” claims.
