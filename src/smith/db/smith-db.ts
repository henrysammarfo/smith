import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { getEnv } from "../env";

let dbSingleton: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbSingleton) return dbSingleton;
  const path = getEnv().SMITH_DB_PATH;
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      goal TEXT NOT NULL,
      tools TEXT NOT NULL,
      eval_notes TEXT NOT NULL,
      pack_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS generations (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      pack_id TEXT NOT NULL,
      generation INTEGER NOT NULL,
      architecture_json TEXT NOT NULL,
      parent_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
    );
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      generation_id TEXT NOT NULL,
      pack_id TEXT NOT NULL,
      metrics_json TEXT NOT NULL,
      taxonomy_json TEXT NOT NULL,
      traces_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(generation_id) REFERENCES generations(id)
    );
    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      content TEXT NOT NULL,
      source_run_id TEXT,
      generation INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reflections (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      run_id TEXT NOT NULL,
      generation INTEGER NOT NULL,
      reflection TEXT NOT NULL,
      lessons_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  dbSingleton = db;
  return db;
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
