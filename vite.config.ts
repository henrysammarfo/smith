// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = Boolean(process.env["VERCEL"]);

export default defineConfig({
  // On Vercel, Nitro auto-picks the vercel preset; pin when VERCEL=1 for local prod builds.
  // Also keep eval fixtures as server assets in case any path still reads from disk.
  ...(isVercel
    ? {
        nitro: {
          preset: "vercel",
          serverAssets: [
            {
              baseName: "smith-evals",
              dir: "./src/smith/evals",
            },
          ],
        },
      }
    : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
