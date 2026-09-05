# CURRENT_STATE — SMITH.forge

## Product
**SMITH** = meta-agent forge for Syndicate Track 1 (**Automated Agent Engineering**).
Loop: goal + tools + eval → propose architecture → run eval → fail taxonomy → mutate → report card.
Domains: (1) messy invoice line-items (2) GROUNDS-lite claim check.

## Stack
TanStack Start + Vite (Lovable), Zod, better-sqlite3, OpenAI-compatible LLM client (AgentRouter heal → Ollama fallback), Tavily, TinyFish.

## Live wiring (verified this session)
- LLM heal: AgentRouter apex WAF; `co.agentrouter.org` JSON but key 401; Ollama `http://127.0.0.1:11434/v1` + `llama3.2:1b` smoke `SMITH_OK`.
- Forge smoke (invoices): Gen1 accuracy 0.390 → Gen2 0.723 (Δ +0.333). No mock scores.
- Research: Tavily + TinyFish Search/Fetch (automation credits = 0).
- Persistence: SQLite under `data/` (gitignored).
- Server modules live under `src/smith/**` (not `src/server/**` — TanStack import-protection blocks `**/server/**` from client).

## Routes
`/`, marketing pages, `/start`, `/dashboard`, `/dashboard/forge`, `/dashboard/agents`, `/dashboard/runs`, `/brand`.

## AO
- Judging: operator desktop AO sessions (mandatory for demo video).
- Cloud: `bun run ao:attempt` downloaded AppImage v0.12.10 under xvfb; **sessionsFabricated=false** (did not register countable session).

## Contest locks
- Track: Automated Agent Engineering
- Submit: Devpost `https://syndicate-by-maximor.devpost.com/`
- Discord join mandatory; showcase ≠ submit
- Window: 2026-09-05 21:30 IST → 2026-09-07 03:30 IST

## Quality
- `bun run unit` OK, `bun run heal` OK, `bun run smoke` OK, `bun run build` OK
- Lint: 0 errors (UI-kit react-refresh warnings only)

## Non-goals (V1)
CFO track, payments/SSO, fake AO sessions, mock LLM scores, “unhackable” claims.
