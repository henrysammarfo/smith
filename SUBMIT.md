# SUBMIT — Syndicate by Maximor (Track 1)

Official submit is **Devpost only**. Discord showcase is optional and does **not** count.

## Locked contest facts (FACT_CHECK)

| Item | Value |
|---|---|
| Track | **Automated Agent Engineering** |
| Devpost | https://syndicate-by-maximor.devpost.com/ |
| Discord (mandatory join) | https://discord.gg/Sy3EwRBQX3 |
| Pass | https://aoagents.dev/hackathons/syndicate/pass/ |
| AO product | https://aoagents.dev — Untrivial-ai/agent-orchestrator (desktop) |
| Window | 2026-09-05 21:30 IST → 2026-09-07 03:30 IST |

## Devpost checklist

- [ ] Project title: SMITH.forge
- [ ] Track = Automated Agent Engineering
- [ ] Public GitHub repo URL
- [ ] Live demo / deploy link
- [ ] Demo video (product loop **and** AO desktop sessions visible)
- [ ] How we used AO (paste blurb below)
- [ ] What we built (meta-forge: propose → eval → taxonomy → mutate → report card)
- [ ] Built with: TanStack Start, AgentRouter/Ollama OpenAI-compat, Tavily, TinyFish, SQLite

## AO how-we-used (paste-ready)

> We used Agent Orchestrator (aoagents.dev) as the mandatory session layer for Syndicate.
> Judging sessions were run on the operator’s desktop AO install so the demo video shows a real session count.
> Separately, `bun run ao:attempt` downloads the Linux AppImage and tries xvfb launch for build evidence
> (`data/ao-cloud-attempt/report.json`). We never fabricate AO sessions — if the cloud AppImage does not
> register, SUBMIT and the demo video say so.

## Demo video shot list

1. `/start` → create workspace with a goal
2. `/dashboard/forge` → Forge once → report card metrics
3. Agents + Runs pages showing generations / taxonomy
4. Second forge generation showing mutation / accuracy Δ
5. AO desktop: start session, open this project, show session counter

## Metric Δ (live smoke, invoice pack, Ollama llama3.2:1b)

| Pack | Gen1 accuracy | Gen2 accuracy | Δ | Notes |
|---|---|---|---|---|
| invoices | 0.390 | 0.723 | +0.333 | Live LLM; no mock scores |
| grounds | (run before submit) | | | Needs Tavily + TinyFish network |

## Discord

Join the mandatory Discord from the brief — announce/help as needed. Showcase ≠ official submit.

## Residual risk

See `docs/THREAT_MODEL.md`. Do not claim “unhackable.”
