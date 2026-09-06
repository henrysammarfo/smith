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

## What judges want (Track 1)

Not domain polish. **Learning loops**: self-reflection, growing memory, tool/context reuse across runs, cost/speed balance. See `docs/TRACK1_DEMO.md`.

## Devpost checklist

- [ ] Project title: SMITH.forge
- [ ] Track = Automated Agent Engineering
- [ ] Public GitHub repo URL
- [ ] Live demo / deploy link
- [ ] Demo video (learning loop **and** AO desktop sessions visible)
- [ ] How we used AO (paste blurb below)
- [ ] What we built: meta-forge with durable memory + reflection (propose → eval → taxonomy → reflect → remember → mutate → report)
- [ ] Built with: TanStack Start, TensorMux/AgentRouter/Ollama OpenAI-compat, Tavily, TinyFish, SQLite

## AO how-we-used (paste-ready)

> We used Agent Orchestrator (aoagents.dev) as the mandatory session layer for Syndicate.
> Judging sessions were run on the operator’s desktop AO install so the demo video shows a real session count.
> Separately, `bun run ao:attempt` downloads the Linux AppImage and tries xvfb launch for build evidence
> (`data/ao-cloud-attempt/report.json`). We never fabricate AO sessions — if the cloud AppImage does not
> register, SUBMIT and the demo video say so.

## Demo video shot list

1. `/dashboard/forge` → new invoice workspace (cold-start freeform)
2. Forge once → Gen1 fails / low accuracy + taxonomy + self-reflection
3. Forge again → Gen2 accuracy Δ, trajectory chips, growing memory panel
4. Optional: Agents/Runs architecture mutate trail
5. AO desktop: start session, open this project, show session counter

Full script: `docs/TRACK1_DEMO.md` (≤3 min). Skip login/auth UI.

## Metric Δ (live smoke, invoice pack)

| Pack | Gen1 accuracy | Gen2 accuracy | Δ | Memories | Notes |
|---|---|---|---|---|---|
| invoices | (fill after `bun run smoke`) | | | | Cold-start weakened; harder fixtures inv_006/007 |
| grounds | (run before submit) | | | | Needs Tavily + TinyFish network |

## Discord

Join the mandatory Discord from the brief — announce/help as needed. Showcase ≠ official submit.

## Residual risk

See `docs/THREAT_MODEL.md`. Do not claim “unhackable.”
