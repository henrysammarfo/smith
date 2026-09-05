# CURRENT_STATE — SMITH.forge

## Product
**SMITH** = meta-agent forge for Syndicate Track 1 (**Automated Agent Engineering**).
Loop: goal + tools + eval → propose architecture → run eval → fail taxonomy → mutate → report card.
Domains: (1) messy invoice line-items (2) GROUNDS-lite claim check.

## Stack
TanStack Start + Vite (Lovable), Zod, better-sqlite3, OpenAI-compatible LLM client
(**TensorMux primary** → AgentRouter → Ollama), Tavily, TinyFish.

## Live wiring (verified)
- **LLM:** TensorMux `https://api.tensormux.com/v1` + `glm-4-7-flash` (hackathon credits). Heal smoke `SMITH_OK`.
- AgentRouter apex still WAF; `co.agentrouter.org` key was 401 — kept as fallback probe only.
- Ollama local remains last-resort fallback.
- Forge smoke (invoices @ TensorMux): Gen1 **1.0** accuracy / 5/5 passed (no mock scores).
- Research: Tavily + TinyFish Search/Fetch (automation credits = 0).
- Persistence: SQLite under `data/` (gitignored).
- Server modules under `src/smith/**` (TanStack blocks `**/server/**` from client).

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
- `bun run unit` / `heal` / `smoke` / `build` OK against TensorMux
- Lint: 0 errors (UI-kit react-refresh warnings only)

## Non-goals (V1)
CFO track, payments/SSO, fake AO sessions, mock LLM scores, “unhackable” claims.
