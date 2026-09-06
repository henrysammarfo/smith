# Diagrams

These pictures explain SMITH for judges.

| File | Use |
|---|---|
| `*.mmd` | Mermaid source |
| `*.png` / `*.svg` | Ready to view in README / GitHub |
| `*.excalidraw` | Open in [Excalidraw](https://excalidraw.com) |

## Rebuild

```sh
# images
npx @mermaid-js/mermaid-cli -i docs/diagrams/learning_loop.mmd -o docs/diagrams/learning_loop.png -b white -s 2
npx @mermaid-js/mermaid-cli -i docs/diagrams/gen1_to_gen2.mmd -o docs/diagrams/gen1_to_gen2.png -b white -s 2

# excalidraw scenes (needs Chrome)
bun scripts/mermaid-to-excalidraw.mjs
```

Built with:

- https://github.com/excalidraw/mermaid-to-excalidraw  
- https://github.com/excalidraw/excalidraw  
