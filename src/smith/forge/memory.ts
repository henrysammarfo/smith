import { getDb, newId, nowIso } from "../db/smith-db";

export type MemoryKind = "tool" | "domain" | "failure" | "policy";

export type AgentMemory = {
  id: string;
  workspaceId: string;
  kind: MemoryKind;
  content: string;
  sourceRunId: string | null;
  generation: number;
  createdAt: string;
};

export type Reflection = {
  id: string;
  workspaceId: string;
  runId: string;
  generation: number;
  reflection: string;
  lessons: string[];
  createdAt: string;
};

export function ensureLearningTables() {
  getDb().exec(`
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
}

export function listMemories(workspaceId: string): AgentMemory[] {
  ensureLearningTables();
  const rows = getDb()
    .prepare(
      `SELECT * FROM memories WHERE workspace_id = ? ORDER BY created_at ASC`,
    )
    .all(workspaceId) as Array<{
    id: string;
    workspace_id: string;
    kind: string;
    content: string;
    source_run_id: string | null;
    generation: number;
    created_at: string;
  }>;
  return rows.map((r) => ({
    id: r.id,
    workspaceId: r.workspace_id,
    kind: r.kind as MemoryKind,
    content: r.content,
    sourceRunId: r.source_run_id,
    generation: r.generation,
    createdAt: r.created_at,
  }));
}

export function addMemories(
  workspaceId: string,
  runId: string,
  generation: number,
  items: Array<{ kind: MemoryKind; content: string }>,
): AgentMemory[] {
  ensureLearningTables();
  const existing = new Set(
    listMemories(workspaceId).map((m) => m.content.toLowerCase().trim()),
  );
  const inserted: AgentMemory[] = [];
  const stmt = getDb().prepare(
    `INSERT INTO memories (id, workspace_id, kind, content, source_run_id, generation, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const item of items) {
    const key = item.content.toLowerCase().trim();
    if (!key || existing.has(key)) continue;
    existing.add(key);
    const row: AgentMemory = {
      id: newId("mem"),
      workspaceId,
      kind: item.kind,
      content: item.content.trim(),
      sourceRunId: runId,
      generation,
      createdAt: nowIso(),
    };
    stmt.run(
      row.id,
      row.workspaceId,
      row.kind,
      row.content,
      row.sourceRunId,
      row.generation,
      row.createdAt,
    );
    inserted.push(row);
  }
  return inserted;
}

export function saveReflection(input: {
  workspaceId: string;
  runId: string;
  generation: number;
  reflection: string;
  lessons: string[];
}): Reflection {
  ensureLearningTables();
  const row: Reflection = {
    id: newId("ref"),
    workspaceId: input.workspaceId,
    runId: input.runId,
    generation: input.generation,
    reflection: input.reflection,
    lessons: input.lessons,
    createdAt: nowIso(),
  };
  getDb()
    .prepare(
      `INSERT INTO reflections (id, workspace_id, run_id, generation, reflection, lessons_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      row.workspaceId,
      row.runId,
      row.generation,
      row.reflection,
      JSON.stringify(row.lessons),
      row.createdAt,
    );
  return row;
}

export function listReflections(workspaceId: string): Reflection[] {
  ensureLearningTables();
  const rows = getDb()
    .prepare(
      `SELECT * FROM reflections WHERE workspace_id = ? ORDER BY generation ASC`,
    )
    .all(workspaceId) as Array<{
    id: string;
    workspace_id: string;
    run_id: string;
    generation: number;
    reflection: string;
    lessons_json: string;
    created_at: string;
  }>;
  return rows.map((r) => ({
    id: r.id,
    workspaceId: r.workspace_id,
    runId: r.run_id,
    generation: r.generation,
    reflection: r.reflection,
    lessons: JSON.parse(r.lessons_json) as string[],
    createdAt: r.created_at,
  }));
}

export function formatMemoryBlock(memories: AgentMemory[]): string {
  if (memories.length === 0) return "";
  const lines = memories
    .slice(-24)
    .map((m) => `- [${m.kind}/g${m.generation}] ${m.content}`);
  return `Learned memory (apply on this run):\n${lines.join("\n")}`;
}
