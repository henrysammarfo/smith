# Track 1 demo script — SMITH.forge (≤3 min)

Judges care about **learning over time**, not domain polish or auth.

## One-line pitch

SMITH is a meta-agent forge: weak cold-start → eval → fail taxonomy → self-reflect → durable memory → mutate → measurable GenN lift.

## Judge questions → demo answers

| Judge question | What to show |
|---|---|
| How does it get better over time? | Cold-start `freeform` invoice agent fails; Gen2 hardens JSON contract + injects memory; trajectory rises. |
| Self-reflection + growing memory? | `/dashboard/forge` report: reflection text, new memories, memory size; SQLite `memories` / `reflections`. |
| Complex context from tools later? | Invoice: MoMo/bank noise, negative discounts. GROUNDS: TinyFish fetch + Tavily search lessons stored and reapplied. |
| Cost vs speed? | Report card shows costUsd + latencyMs per gen; trajectory chips show both next to accuracy. |

## Shot list (3 minutes)

1. **0:00–0:20** Brand `/` → “meta-agent forge / learning loop” (not a login page).
2. **0:20–0:50** `/dashboard/forge` → create invoice workspace → Forge once → Gen1 low accuracy + taxonomy + first reflection.
3. **0:50–1:40** Forge again → Gen2 accuracy Δ, trajectory chips, growing memory panel.
4. **1:40–2:20** Optional second pack or Agents/Runs pages (architecture mutate names).
5. **2:20–2:50** AO desktop: real session open on this repo (do not fabricate).
6. **2:50–3:00** Close on judge questions: memory grew, reflection wrote, accuracy moved.

## Do not waste time on

Login, 2FA, multi-tenant auth, extra marketing sections, polishing unrelated UI.

## Live smoke (fill after run)

| Gen | Accuracy | Cost | Latency | Memories |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |

Command: `bun run smoke`
