#!/usr/bin/env bun
/**
 * AO dual-path attempt (cloud evidence only).
 * Judging sessions MUST be recorded on the operator's desktop AO install.
 * This script never fabricates session counts.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, chmodSync, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const OUT = "data/ao-cloud-attempt";
mkdirSync(OUT, { recursive: true });

type Report = {
  startedAt: string;
  finishedAt?: string;
  appImagePath?: string;
  downloadOk: boolean;
  xvfbPresent: boolean;
  launchAttempted: boolean;
  launchExitCode: number | null;
  notes: string[];
  sessionsFabricated: false;
};

const report: Report = {
  startedAt: new Date().toISOString(),
  downloadOk: false,
  xvfbPresent: false,
  launchAttempted: false,
  launchExitCode: null,
  notes: [
    "Judging path = operator desktop AO sessions (mandatory for demo video).",
    "This cloud attempt is additive engineering evidence only.",
  ],
  sessionsFabricated: false,
};

async function resolveAppImageUrl(): Promise<string | null> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/Untrivial-ai/agent-orchestrator/releases/latest",
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) {
      report.notes.push(`GitHub releases API ${res.status}`);
      return null;
    }
    const data = (await res.json()) as {
      tag_name?: string;
      assets?: Array<{ name: string; browser_download_url: string }>;
    };
    report.notes.push(`Latest release: ${data.tag_name ?? "unknown"}`);
    const asset = (data.assets ?? []).find((a) => a.name.toLowerCase().includes("appimage"));
    if (!asset) {
      report.notes.push(
        `No AppImage asset. Assets: ${(data.assets ?? []).map((a) => a.name).join(", ") || "none"}`,
      );
      return null;
    }
    return asset.browser_download_url;
  } catch (e) {
    report.notes.push(`release lookup failed: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

async function download(url: string, dest: string) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(`download failed ${res.status}`);
  // @ts-expect-error web stream to node
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  chmodSync(dest, 0o755);
}

const xvfb = spawnSync("which", ["xvfb-run"], { encoding: "utf8" });
report.xvfbPresent = xvfb.status === 0;

const url = await resolveAppImageUrl();
const dest = `${OUT}/AgentOrchestrator.AppImage`;
if (url) {
  try {
    if (!existsSync(dest)) {
      report.notes.push(`Downloading ${url}`);
      await download(url, dest);
    } else {
      report.notes.push("Reusing existing AppImage");
    }
    report.downloadOk = true;
    report.appImagePath = dest;
  } catch (e) {
    report.notes.push(`download error: ${e instanceof Error ? e.message : e}`);
  }
}

if (report.downloadOk && report.appImagePath) {
  report.launchAttempted = true;
  const cmd = report.xvfbPresent
    ? ["xvfb-run", "-a", report.appImagePath, "--help"]
    : [report.appImagePath, "--help"];
  const result = spawnSync(cmd[0]!, cmd.slice(1), {
    encoding: "utf8",
    timeout: 60_000,
    env: { ...process.env, APPIMAGE_EXTRACT_AND_RUN: "1" },
  });
  report.launchExitCode = result.status;
  report.notes.push(
    `launch stdout=${(result.stdout ?? "").slice(0, 300)} stderr=${(result.stderr ?? "").slice(0, 300)}`,
  );
  if (result.status !== 0) {
    report.notes.push(
      "Cloud AppImage did not register a countable AO session here. Judging path remains operator desktop AO.",
    );
  }
} else {
  report.notes.push(
    "Skipped launch — no AppImage. Document desktop AO path in SUBMIT.md / demo video.",
  );
}

report.finishedAt = new Date().toISOString();
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log("sessionsFabricated=false");
