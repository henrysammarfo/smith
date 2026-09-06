/**
 * Convert docs/diagrams/*.mmd → *.excalidraw using
 * @excalidraw/mermaid-to-excalidraw inside headless Chrome.
 *
 * Usage: bun scripts/mermaid-to-excalidraw.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = process.cwd();
const DIAGRAMS = join(ROOT, "docs/diagrams");
const BOOT = pathToFileURL(join(ROOT, "scripts/excalidraw-boot.html")).href;
const CHROME = process.env.CHROME_PATH || "/usr/bin/google-chrome";

const files = readdirSync(DIAGRAMS).filter((f) => f.endsWith(".mmd"));
if (!files.length) {
  console.error("No .mmd files in docs/diagrams");
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"],
});

const page = await browser.newPage();
page.setDefaultTimeout(180_000);
page.on("console", (msg) => console.log("browser:", msg.type(), msg.text()));
page.on("pageerror", (err) => console.error("pageerror:", err.message));

await page.goto(BOOT, { waitUntil: "networkidle0", timeout: 180_000 });
await page.waitForFunction("window.__ready === true || window.__err", {
  timeout: 180_000,
});
const bootErr = await page.evaluate(() => window.__err);
if (bootErr) {
  console.error("boot failed:", bootErr);
  await browser.close();
  process.exit(1);
}

for (const file of files) {
  const def = readFileSync(join(DIAGRAMS, file), "utf8");
  const name = basename(file, ".mmd");
  const scene = await page.evaluate(async (definition) => {
    const { elements, files } = await window.__parse(definition, {
      themeVariables: { fontSize: "20px" },
    });
    const converted = window.__convert(elements);
    return {
      type: "excalidraw",
      version: 2,
      source: "https://github.com/excalidraw/mermaid-to-excalidraw",
      elements: converted,
      appState: { viewBackgroundColor: "#ffffff", gridSize: null },
      files: files ?? {},
    };
  }, def);

  const out = join(DIAGRAMS, `${name}.excalidraw`);
  writeFileSync(out, JSON.stringify(scene, null, 2));
  console.log("wrote", out, "elements=", scene.elements.length);
}

await browser.close();
console.log("done");
