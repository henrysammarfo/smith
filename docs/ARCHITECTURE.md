# Architecture (simple)

## Big idea

```
Goal → Build agent → Test → Find fails → Write lessons → Save memory → Improve → Report
```

## Picture

See `docs/diagrams/learning_loop.png` and `learning_loop.excalidraw`.

## Main folders

| Path | What it does |
|---|---|
| `src/smith/forge/` | The learning loop (build, test, reflect, remember, improve) |
| `src/smith/evals/` | Invoice + GROUNDS test packs |
| `src/smith/llm/` | Talks to live LLM (TensorMux → AgentRouter → Ollama) |
| `src/smith/tools/` | Tavily search + TinyFish fetch |
| `src/smith/db/` | SQLite memory store |
| `src/routes/dashboard/` | UI for forge + runs |
| `docs/diagrams/` | Mermaid + Excalidraw pictures for judges |

## Data we keep

- Workspaces (your goal)  
- Generations (each agent version)  
- Runs (scores + fail notes)  
- Memories (lessons that stick)  
- Reflections (what went wrong / next try)  

## Diagrams toolchain

```sh
# PNG from mermaid
npx @mermaid-js/mermaid-cli -i docs/diagrams/learning_loop.mmd -o docs/diagrams/learning_loop.png -b white -s 2

# .excalidraw from mermaid (Chrome + Excalidraw libs)
bun scripts/mermaid-to-excalidraw.mjs
```

Sources:

- https://github.com/excalidraw/mermaid-to-excalidraw  
- https://github.com/excalidraw/excalidraw  
