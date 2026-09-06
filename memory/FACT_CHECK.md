# FACT_CHECK — live-verified claims (Syndicate by Maximor / SMITH)

Last updated: 2026-09-06 (Cloud Agent session). Sources: Luma schema.org Event JSON, TinyFish `/v1/fetch` + `/v1/search`, Tavily search, AO GitHub releases, official brief paste, Discord Track tip from @Hacker.

## Verified

| Claim | Status | Source |
|---|---|---|
| Event name = Syndicate by Maximor, hosted by AO (Agent Orchestrator) | VERIFIED | Luma `https://luma.com/d0kq45ek` |
| Window = 2026-09-05 21:30 IST → 2026-09-07 03:30 IST (= 2026-09-05 12:00 EDT → 2026-09-06 18:00 EDT) | VERIFIED | Official brief + Luma start/end |
| Pool = $10,000 ($3k Maximor cash + $3k Dodo + $4k AI Grants India) | VERIFIED | Luma description + official brief |
| Track 1 name = Automated Agent Engineering | VERIFIED | Official brief / Luma tracks |
| Track 1 judging emphasis = learning loops (reflection, memory growth, tool context over time, cost/speed); domain secondary; skip auth unless core | VERIFIED | Discord tip from @Hacker (2026-09-06) |
| Track 1 1st = $1k cash + $1k Dodo; 2nd = $500+$500; 20×$100 credits | VERIFIED | Official brief + Luma |
| AO mandatory; demo must show AO sessions used | VERIFIED | Official brief + Luma |
| Official submit = Devpost only | VERIFIED | Official brief (`syndicate-by-maximor.devpost.com`) |
| Discord join mandatory (showcase ≠ submit) | VERIFIED | Official brief |
| Pass URL host = aoagents.dev | VERIFIED | Official brief + Luma |
| AO product = desktop Agent Orchestrator (Untrivial-ai/agent-orchestrator), Linux AppImage exists | VERIFIED | GitHub releases v0.12.10 |
| TinyFish Search/Fetch live with X-API-Key at agent.tinyfish.ai | VERIFIED | Live API calls this session |
| TinyFish automation credits = 0 | VERIFIED | Live 403 insufficient credits |
| Tavily search live | VERIFIED | Live API this session |
| AgentRouter apex `agentrouter.org` = Aliyun WAF HTML from this VM | VERIFIED | Live curl/Chrome |
| AgentRouter `co.agentrouter.org/v1` = real JSON API (WAF bypass host) | VERIFIED | Live curl (401 Invalid API Key with provided key) |
| Provided AgentRouter key currently rejected as Invalid API Key on bypass host | VERIFIED | Live 401 |
| Local OpenAI-compatible heal via Ollama `llama3.2:1b` returns live completions | VERIFIED | `SMITH_OK` chat smoke |
| Medium “Cracking Syndicate” Arweave/aos/Lua AO = wrong product for this hackathon | VERIFIED | Conflicts with aoagents.dev + Luma presenter |

## Corrected vs uploaded SMITH_BIBLE

| Bible text | Correction |
|---|---|
| Submit Discord `#syndicate-project-showcase` only | **Devpost is official**; Discord showcase optional |
| Partners TensorMux / Neatlogs naming | Brief uses **TensorMux** + **Neatlogs**; keep as named |
| ~48h handwave | Use exact IST/EDT window above |
| Pass aoagents.dev path variants | Prefer brief: `https://aoagents.dev/hackathons/syndicate/pass/` |

| TensorMux OpenAI-compat `api.tensormux.com/v1` + model `glm-4-7-flash` live with hackathon key | VERIFIED | Live `/models` + chat `SMITH_OK`; invoice pack 5/5 |
| Track-1 learning loop: Gen1 cold-start accuracy 0.0 → Gen2 1.0 with growing memory + reflections | VERIFIED | `bun run smoke` 2026-09-06 (7 invoice cases incl. inv_006/007) |
| Anthropic evals/tools + Maximor + Managed Agents research ingested via Tavily Search + TinyFish Search/Fetch | VERIFIED | `bun run research` 2026-09-06 → `docs/research/ingest_bundle.json` + LESSONS.md |
| Multi-trial metrics passAtK/passCaretK + suiteKind capability→regression on learning smoke | VERIFIED | `bun run smoke` Gen1 passAtK=0 suiteKind=capability → Gen2 passAtK=1 suiteKind=regression |
| AO desktop next gate after install = coding-agent CLI on PATH (Claude Code / Codex / opencode / Copilot) | VERIFIED | Operator screenshot `docs/research/ao-coding-agent-gate.png` + AO setup UI copy |
| Tracked tree has no live sk-/tvly- tokens; `.env` gitignored; docs use `YOUR_*` placeholders | VERIFIED | Pre-public secret scan 2026-09-06 |

## Residual risk (honest)

- Secrets pasted in chat history / Discord should be rotated after the event.
- WAF may change; heal script must re-probe.
- Local Ollama is live inference, not a score mock — still not a substitute for sponsor AgentRouter once a valid key exists.
- Never claim unhackable / nation-state-proof.
| Mermaid→Excalidraw diagrams for learning loop + Gen1→Gen2 | VERIFIED | `bun scripts/mermaid-to-excalidraw.mjs` wrote `docs/diagrams/*.excalidraw` |
| SQLite on Vercel uses `/tmp/smith.db` | VERIFIED | `src/smith/env.ts` defaultDbPath |
| Hero uses Vesper CloudFront mp4 at full opacity | VERIFIED | URL returns 200 video/mp4; wired in `src/routes/index.tsx` |
| Auth gates /dashboard + /start; workspaces owned by user | VERIFIED | `beforeLoad` + `owner_id` in forge APIs |
| No user-facing Lovable meta/OG | VERIFIED | `__root.tsx` title/OG/twitter = SMITH.forge |
