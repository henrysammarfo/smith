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
If you see **“No coding agent found” / “No agent CLI (Claude Code, Codex, etc.) was found on PATH”**, pick **one** and install it, then click **Check again** in AO (do not Quit).

| Agent | Install (pick one) | Verify |
|---|---|---|
| **Claude Code** (recommended for this track) | `npm i -g @anthropic-ai/claude-code` then `claude` login | `which claude && claude --version` |
| **Codex** | Follow OpenAI Codex CLI install docs for your OS | `which codex && codex --version` |
| **opencode** | Follow opencode terminal-agent install docs | `which opencode && opencode --version` |
| **Copilot CLI** | `npm i -g @github/copilot` (or current GH Copilot CLI package) | `which copilot && copilot --version` |

Tips:
- Install the CLI in the **same user environment** that launches AO (GUI apps on macOS often do not see Homebrew npm PATH — use a login-shell PATH or symlink into `/usr/local/bin`).
- After install, return to AO → **Check again**. **Install selected** in the AO UI also works if you prefer AO to drive the install.
- You do **not** need all four agents — one healthy CLI is enough for judging sessions.

Screenshot of this gate (your AO install): `docs/research/ao-coding-agent-gate.png`

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
