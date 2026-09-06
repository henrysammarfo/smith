# AO Desktop Setup — Syndicate (you do this; judging path)

Countable AO sessions must run on **your desktop**. Our cloud AppImage attempt does **not** register judging sessions.

Official docs: https://aoagents.dev/docs · https://aoagents.dev/docs/installation  
Pass: https://aoagents.dev/hackathons/syndicate/pass/  
Releases: https://github.com/Untrivial-ai/agent-orchestrator/releases/latest  
Discord: https://discord.com/invite/UZv7JjxbwG

## 1) Download (latest — auto-updating)

| Platform | Download |
|---|---|
| **macOS Apple Silicon** | https://github.com/Untrivial-ai/agent-orchestrator/releases/latest/download/agent-orchestrator-darwin-arm64.dmg |
| **macOS Intel** | https://github.com/Untrivial-ai/agent-orchestrator/releases/latest/download/agent-orchestrator-darwin-x64.dmg |
| **Windows** | https://github.com/Untrivial-ai/agent-orchestrator/releases/latest/download/agent-orchestrator-win32-x64.exe |
| **Linux AppImage** | https://github.com/Untrivial-ai/agent-orchestrator/releases/latest/download/agent-orchestrator-linux-x64.AppImage |
| **Linux .deb** | https://github.com/Untrivial-ai/agent-orchestrator/releases/latest/download/agent-orchestrator-linux-x64.deb |
| **Linux .rpm** | https://github.com/Untrivial-ai/agent-orchestrator/releases/latest/download/agent-orchestrator-linux-x64.rpm |

Pinned v0.12.10 (known good for this hackathon): https://github.com/Untrivial-ai/agent-orchestrator/releases/tag/v0.12.10

## 2) Install

### macOS
1. Open the `.dmg` → drag **Agent Orchestrator** to Applications  
2. First launch: right-click → **Open** (Gatekeeper)  
3. Sign in when prompted  

### Windows
1. Run `agent-orchestrator-win32-x64.exe`  
2. If SmartScreen appears → More info → Run anyway  
3. Finish setup → launch AO  

### Linux AppImage
```bash
chmod +x agent-orchestrator-linux-x64.AppImage
./agent-orchestrator-linux-x64.AppImage
# if FUSE missing:
sudo apt install libfuse2
```

### Linux deb/rpm
```bash
sudo dpkg -i agent-orchestrator-linux-x64.deb   # or rpm -i on Fedora/RHEL
sudo apt -f install   # only if dpkg reports missing deps
```

## 3) First-run (do in order)

### 3a) Coding agent on PATH (blocks “No coding agent found”)

AO will refuse sessions until a coding-agent CLI is installed and visible on **PATH**.
If you see **“No coding agent found” / “No agent CLI (Claude Code, Codex, etc.) was found on PATH”**, install **Claude Code + AgentRouter** (recommended), then click **Check again** in AO (do not Quit).

#### Recommended: Claude Code ↔ AgentRouter (Anthropic-compatible)

Official AgentRouter docs: https://agentrouter.org/docs/index.html  
Claude Code package: https://www.npmjs.com/package/@anthropic-ai/claude-code  
Claude Code docs: https://docs.anthropic.com/en/docs/claude-code

**Important:** Claude Code uses **Anthropic-compatible** config. Base URL is `https://agentrouter.org` with **no** `/v1`.  
Do **not** mix that with the OpenAI-compatible URL `https://agentrouter.org/v1` (that style is for other OpenAI-SDK clients / SMITH forge fallbacks).

```bash
# 1) Node 18+
node --version

# 2) Install Claude Code CLI
npm install -g @anthropic-ai/claude-code@latest

# 3) Verify
claude --version
which claude

# 4) AgentRouter env (macOS / Linux) — put YOUR key, not a pasted chat key
export ANTHROPIC_AUTH_TOKEN="YOUR_AGENTROUTER_API_KEY"
export ANTHROPIC_BASE_URL="https://agentrouter.org"
export ANTHROPIC_MODEL="claude-opus-4-5"   # or another model AgentRouter lists

# Make permanent (zsh):
# echo 'export ANTHROPIC_AUTH_TOKEN=...' >> ~/.zshrc
# echo 'export ANTHROPIC_BASE_URL=https://agentrouter.org' >> ~/.zshrc
# echo 'export ANTHROPIC_MODEL=claude-opus-4-5' >> ~/.zshrc
# source ~/.zshrc

# 5) Test
claude
# prompt: only reply OK
# then: list files in this directory and say if README exists — do not modify files
```

Windows PowerShell:

```powershell
$env:ANTHROPIC_AUTH_TOKEN="YOUR_AGENTROUTER_API_KEY"
$env:ANTHROPIC_BASE_URL="https://agentrouter.org"
$env:ANTHROPIC_MODEL="claude-opus-4-5"
claude
```

If Claude Code asks to use the API key from environment variables on first launch, confirm **Yes**.

| Config | Value |
|---|---|
| `ANTHROPIC_AUTH_TOKEN` | Your AgentRouter API key (sent as Bearer) |
| `ANTHROPIC_BASE_URL` | `https://agentrouter.org` (**no** `/v1`) |
| `ANTHROPIC_MODEL` | e.g. `claude-opus-4-5` (see AgentRouter model list) |

Other AO-accepted CLIs (only if you prefer them): Codex / opencode / Copilot CLI — still need to be on PATH.

Tips:
- Install the CLI in the **same user environment** that launches AO (GUI apps on macOS often do not see Homebrew npm PATH — use a login-shell PATH or symlink into `/usr/local/bin`).
- After install + env exports, return to AO → **Check again**. **Install selected** in the AO UI also works for the binary; you still need the AgentRouter env vars for Claude Code to call models.
- You do **not** need all four agents — one healthy CLI is enough for judging sessions.
- To undo AgentRouter override and return to Claude subscription login: unset `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, then restart the terminal and run `claude`.

Screenshot of this gate (your AO install): `docs/research/ao-coding-agent-gate.png`

**Split of keys (do not mix):**
- **Claude Code / AO worker** → AgentRouter via `ANTHROPIC_*` (this section)
- **SMITH.forge app** → TensorMux in project `.env` (`TENSORMUX_*`) for invoice/grounds evals — separate from Claude Code

### 3b) Then continue

1. Sign in (so sessions attach to your AO account)  
2. Confirm you can see **session / worker cards** (Kanban)  
3. **Add this repo** as a project (point AO at your local SMITH clone)  
4. Start a **New task** or orchestrator plan that uses the repo  
5. Keep AO open while you browse `/start` → `/dashboard/forge`  
6. Repeat real tasks until the session/worker count is obviously high for the demo video  

## 4) Meaningful AO usage (what judges want)

Use AO as the control plane for SMITH — not idle opens:

- Task: “Run forge once on invoices and summarize the report card”  
- Task: “Compare Gen1 vs Gen2 accuracy and taxonomy”  
- Task: “Open `/dashboard/runs` and list failure classes”  
- Task: “Propose a safer output contract for invoice JSON”  
- Task: “Document any UI/API bug found while driving the forge”  

Wire env in the project (already in gitignored `.env`): TensorMux `glm-4-7-flash`, Tavily, TinyFish.

## 5) Demo video shot list

1. AO open — Kanban / session count visible  
2. Browser `/start` → create workspace  
3. `/dashboard/forge` → Forge → report card  
4. Second generation → show Δ  
5. `/dashboard/agents` + `/dashboard/runs`  
6. Back to AO session list  

## 6) Split of labor

| Work | Owner |
|---|---|
| Install AO, sign in, accumulate real sessions, record demo, Devpost | **You** |
| Heal/smoke/unit/build, 100+ automated forge runs, route stress, bug findings doc | **Cloud agent** |

**Never invent session counts.** If it is not in the AO UI, it does not count.
