---
name: smith-agentrouter-heal
description: Heal AgentRouter OpenAI-compatible access (WAF bypass host probe, cookie harvest, local Ollama fallback endpoint). Use when LLM calls fail or before forge smoke tests.
---

# AgentRouter heal

Run: `bun run scripts/heal-agentrouter.ts`

Order:
1. Probe `https://co.agentrouter.org/v1/models` with Bearer key.
2. If WAF on apex, Chrome cookie harvest (optional) and retry.
3. If key invalid/unreachable, verify local Ollama `http://127.0.0.1:11434/v1` and write working `AGENTROUTER_BASE_URL` into `.env`.
4. Smoke `chat/completions`. Fail closed if nothing live — no mock completions.
