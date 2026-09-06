# SMITH.forge

Meta-agent forge for **Syndicate by Maximor** — Track **Automated Agent Engineering**.

Loop: **goal → architecture → eval → fail taxonomy → self-reflect → durable memory → mutate → report card**.

## Domains
1. Messy invoice line-item extraction
2. GROUNDS-lite claim check (TinyFish fetch + Tavily search)

## Stack
TanStack Start + Vite, Zod, better-sqlite3, OpenAI-compatible LLM client (**TensorMux** → AgentRouter → Ollama), Tavily, TinyFish.

**No mock LLM / no fake scores.** If the LLM is unreachable after heal, the forge fails loud.

## Clone (Windows / any PC)

Repo: `https://github.com/henrysammarfo/smith`

```powershell
git clone https://github.com/henrysammarfo/smith.git
cd smith
copy .env.example .env
# edit .env — paste YOUR keys only (never commit .env)
bun install
bun run heal
bun run unit
bun run smoke   # needs LLM key
bun run dev
```

Routes: `/` marketing · `/start` · `/dashboard` · `/dashboard/forge` · `/dashboard/agents` · `/dashboard/runs` · `/brand`

## Secrets (safe-by-default)
- Commit only `.env.example` (empty placeholders).
- Real keys live in gitignored `.env` / `.env.local` on your machine.
- Docs use `YOUR_*` placeholders — no live tokens in markdown.
- Rotate any key that was ever pasted into chat/Discord after the event.

## AO (mandatory for judging)
- **Desktop:** install [Agent Orchestrator](https://aoagents.dev), then put **one** coding CLI on PATH.
- Prefer **OpenCode + TensorMux** if AgentRouter quota is exhausted — see `docs/OPENCODE_AO_SETUP.md`.
- Claude Code + AgentRouter: `docs/CLAUDE_CODE_AGENTROUTER.md` + `docs/AO_DESKTOP_SETUP.md`.
- Cloud evidence only: `bun run ao:attempt` — never fabricate sessions.

## Submit
See **[SUBMIT.md](./SUBMIT.md)** — Devpost is official (`https://syndicate-by-maximor.devpost.com/`). Discord showcase does not count.

## Honesty
See `docs/THREAT_MODEL.md`. Residual risk remains; we do not claim unhackable.

Built with [Lovable](https://lovable.dev).
