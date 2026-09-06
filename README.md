# SMITH.forge

**A tool that builds agents, tests them, learns from mistakes, and builds better ones.**

Made for **Syndicate by Maximor** — track: **Automated Agent Engineering**.

## What we built

SMITH is a **meta-agent forge**. You give it a goal. It:

1. Builds an agent  
2. Runs hard tests  
3. Notes what failed  
4. Writes short lessons  
5. Saves those lessons in memory  
6. Builds a better agent  
7. Shows a clear report card  

We proved it works live: **Gen1 score 0.0 → Gen2 score 1.0** on messy invoices (7 tests).

## How the loop looks

![Learning loop](docs/diagrams/learning_loop.png)

![Gen1 to Gen2](docs/diagrams/gen1_to_gen2.png)

Open the same diagrams in Excalidraw:

- [learning_loop.excalidraw](docs/diagrams/learning_loop.excalidraw)
- [gen1_to_gen2.excalidraw](docs/diagrams/gen1_to_gen2.excalidraw)

Built with [mermaid-to-excalidraw](https://github.com/excalidraw/mermaid-to-excalidraw) + [Excalidraw](https://github.com/excalidraw/excalidraw).

## What works today

| Thing | Status |
|---|---|
| Real LLM calls (no fake scores) | Works |
| Gen1 → Gen2 learning on invoices | Works (0.0 → 1.0) |
| Saved memory + self-reflection | Works |
| TinyFish + Tavily tools | Works |
| Dashboard forge UI | Works |
| Agent Orchestrator (AO) desktop path | Documented |

## Clone and run

```powershell
git clone https://github.com/henrysammarfo/smith.git
cd smith
copy .env.example .env
# put your keys in .env (never commit .env)
bun install
bun run heal
bun run unit
bun run smoke
bun run dev
```

Then open:

- `/` — home  
- `/dashboard/forge` — run the learning loop  
- `/dashboard` — overview  

## Keys (simple)

Copy `.env.example` → `.env`. Fill:

- `TENSORMUX_API_KEY` (preferred)  
- or `AGENTROUTER_API_KEY`  
- optional: `TAVILY_API_KEY`, `TINYFISH_API_KEY`  

Never commit `.env`.

## For judges (3 minutes)

See **[docs/FOR_JUDGES.md](docs/FOR_JUDGES.md)** and **[docs/TRACK1_DEMO.md](docs/TRACK1_DEMO.md)**.

Short version: open `/dashboard/forge`, run forge twice, watch the score and memory grow.

## Submit

See **[SUBMIT.md](./SUBMIT.md)** — official submit is **Devpost** only.

## Live site

**https://smith-teamtitanlink.vercel.app**

Also: https://smith-tawny-omega.vercel.app

Forge on Vercel needs your API keys in the Vercel project env (same names as `.env.example`). Local `bun run smoke` already proved Gen1 → Gen2 learning.

## Honest notes

We do **not** claim perfect security. See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md).

Built with [Lovable](https://lovable.dev).
