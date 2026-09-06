# Claude Code + AgentRouter (for AO)

Use this to clear the AO “No coding agent found” gate and run Claude Code through AgentRouter.

Docs you pasted / official:
- AgentRouter: https://agentrouter.org/docs/index.html
- Claude Code install: https://code.claude.com/docs/en/install
- Claude Code overview: https://code.claude.com/docs/en

## Install Claude Code (pick one)

**Native installer (recommended today):**

```bash
# macOS / Linux / WSL
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```

Alternatives: `brew install --cask claude-code` · `winget install Anthropic.ClaudeCode`

**npm (still works; AgentRouter docs use this):**

```bash
node --version   # 18+ (AgentRouter); newer Node if npm path complains
npm install -g @anthropic-ai/claude-code@latest
claude --version
which claude
```

npm package page: https://www.npmjs.com/package/@anthropic-ai/claude-code

## Critical: Anthropic URL, not OpenAI `/v1`

| Client | Base URL | Auth |
|---|---|---|
| **Claude Code** | `https://agentrouter.org` (**omit** `/v1`) | `ANTHROPIC_AUTH_TOKEN` |
| OpenAI-compatible SDKs / SMITH forge | `…/v1` (TensorMux or AgentRouter OpenAI mode) | API key as Bearer |

Do **not** set Claude Code’s `ANTHROPIC_BASE_URL` to `https://agentrouter.org/v1`.

## Connect AgentRouter → Claude Code

```bash
# macOS / Linux
export ANTHROPIC_AUTH_TOKEN="YOUR_AGENTROUTER_API_KEY"
export ANTHROPIC_BASE_URL="https://agentrouter.org"
export ANTHROPIC_MODEL="claude-opus-4-5"   # or models listed by AgentRouter

claude
# prompt: only reply OK
# then: list files here and say if README exists — do not modify files
```

Windows PowerShell:

```powershell
$env:ANTHROPIC_AUTH_TOKEN="YOUR_AGENTROUTER_API_KEY"
$env:ANTHROPIC_BASE_URL="https://agentrouter.org"
$env:ANTHROPIC_MODEL="claude-opus-4-5"
claude
```

If Claude Code asks to use the API key from environment variables, confirm **Yes**.

Then in AO → **Check again**.

## vs SMITH.forge

- **AO / Claude Code** → AgentRouter + `ANTHROPIC_*` (this file)
- **SMITH forge evals** → TensorMux in gitignored `.env` (OpenAI-compatible `/v1`)

Both can coexist. Different clients, different URL shapes.

## Undo AgentRouter override (back to Claude subscription login)

```bash
unset ANTHROPIC_AUTH_TOKEN ANTHROPIC_BASE_URL ANTHROPIC_MODEL
# restart terminal, then:
claude
```
