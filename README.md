# SMITH.forge

Meta-agent forge for **Syndicate by Maximor** — Track **Automated Agent Engineering**.

Loop: **goal → architecture → eval → fail taxonomy → mutate → report card**.

## Domains
1. Messy invoice line-item extraction
2. GROUNDS-lite claim check (TinyFish fetch + Tavily search)

## Stack
TanStack Start + Vite, Zod, better-sqlite3, OpenAI-compatible LLM client (AgentRouter heal → Ollama fallback), Tavily, TinyFish.

**No mock LLM / no fake scores.** If the LLM is unreachable after heal, the forge fails loud.

## Quick start

```sh
cp .env.example .env   # add keys; never commit .env
bun install
bun run heal           # probe AgentRouter + WAF path + Ollama
bun run unit           # scorer/taxonomy checks
bun run smoke          # live forgeOnce (needs LLM)
bun run dev
```

Routes: `/` marketing · `/start` · `/dashboard` · `/dashboard/forge` · `/dashboard/agents` · `/dashboard/runs` · `/brand`

## AO (mandatory for judging)
- **Desktop:** operator runs Agent Orchestrator locally; demo video must show sessions.
- **Cloud attempt:** `bun run ao:attempt` downloads Linux AppImage and tries xvfb — evidence only; never fabricate sessions.

## Submit
See **[SUBMIT.md](./SUBMIT.md)** — Devpost is official (`https://syndicate-by-maximor.devpost.com/`). Discord showcase does not count.

## Honesty
See `docs/THREAT_MODEL.md`. Residual risk remains; we do not claim unhackable.

Built with [Lovable](https://lovable.dev).
