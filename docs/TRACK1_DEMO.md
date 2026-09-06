# Track 1 demo — SMITH.forge (≤3 min)

Judges care about **learning over time**, not fancy login screens.

## One-line pitch

SMITH builds a weak agent, tests it, learns, remembers, and builds a better one — Gen1 score 0 → Gen2 score 1.

## Judge questions → what to show

| Judge asks | Show this |
|---|---|
| How does it get better? | Gen1 fails → Gen2 uses memory and scores higher |
| Does it reflect + remember? | Forge page: reflection text + growing memory list |
| Do tools help later? | Hard invoice noise + TinyFish/Tavily lessons reused |
| Cost vs speed? | Report card: cost + time next to score |

## Shot list (3 minutes)

1. **0:00–0:20** Home `/` — “meta-agent forge / learning loop”  
2. **0:20–0:50** `/dashboard/forge` → Forge once → Gen1 low score  
3. **0:50–1:40** Forge again → Gen2 higher score + more memory  
4. **1:40–2:20** Optional: agents / runs pages  
5. **2:20–2:50** AO desktop open on this repo (real session)  
6. **2:50–3:00** Close: memory grew, reflection wrote, score moved  

## Do not waste time on

Login, 2FA, extra marketing polish.

## Live smoke we already ran

| Gen | Score | Memories |
|---|---|---|
| 1 | 0.000 (0/7) | 3 |
| 2 | 1.000 (7/7) | 6 |

Verified 2026-09-06 via `bun run smoke` (TensorMux `glm-4-7-flash`).
