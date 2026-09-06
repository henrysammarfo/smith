# OpenCode for AO (skip AgentRouter quota)

Use **OpenCode** as the AO coding-agent CLI when AgentRouter Claude Code hits 402/quota.

## Install (Windows PowerShell)

```powershell
# if npm.ps1 is blocked:
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

npm install -g opencode-ai
# or: scoop install opencode
# or: choco install opencode

opencode --version
Get-Command opencode
```

Then in AO → **Check again** (it looks for `opencode` on PATH).

## Wire TensorMux (OpenAI-compatible — use your working forge key)

AgentRouter quota is separate. OpenCode should talk to **TensorMux** `/v1` (same stack as SMITH.forge).

1. Set env (replace with your TensorMux key from `.env`):

```powershell
$env:TENSORMUX_API_KEY="YOUR_TENSORMUX_KEY"
[System.Environment]::SetEnvironmentVariable("TENSORMUX_API_KEY", $env:TENSORMUX_API_KEY, "User")
```

2. Create config `%USERPROFILE%\.config\opencode\opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "tensormux": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "TensorMux",
      "options": {
        "baseURL": "https://api.tensormux.com/v1",
        "apiKey": "{env:TENSORMUX_API_KEY}"
      },
      "models": {
        "glm-4-7-flash": {
          "name": "GLM 4.7 Flash"
        }
      }
    }
  }
}
```

3. Run in your SMITH repo folder:

```powershell
cd C:\path\to\smith
opencode
```

In the TUI you can also `/connect` and pick a custom / OpenAI-compatible provider if the UI offers it — base URL must include `/v1` for TensorMux.

## vs Claude Code + AgentRouter

| Path | When |
|---|---|
| OpenCode + TensorMux | AgentRouter quota exhausted (your case) |
| Claude Code + AgentRouter | Quota restored; Anthropic URL **without** `/v1` |

AO only needs **one** CLI on PATH (`opencode` is enough).

## Next in AO

1. Import / open the SMITH project  
2. Start real tasks (forge smoke, Gen1 vs Gen2, etc.)  
3. Keep AO open for the demo video  
