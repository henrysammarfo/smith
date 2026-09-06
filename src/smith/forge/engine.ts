import { getDb, newId, nowIso } from "../db/smith-db";
import { defaultInvoiceArchitecture, runInvoicePack } from "../evals/invoices/pack";
import { defaultGroundsArchitecture, runGroundsPack } from "../evals/grounds/pack";
import { classifyFailures } from "./taxonomy";
import { mutateArchitecture } from "./mutate";
import {
  formatMemoryBlock,
  listMemories,
  listReflections,
} from "./memory";
import { reflectAndRemember } from "./reflect";
import {
  AgentArchitectureSchema,
  type AgentArchitecture,
  type FailClass,
  type Metrics,
  type PackId,
  type ReportCard,
  type Trace,
} from "./types";

export type Workspace = {
  id: string;
  name: string;
  email: string;
  goal: string;
  tools: string;
  evalNotes: string;
  packId: PackId;
  createdAt: string;
  ownerId: string | null;
};

export type GenerationRecord = {
  id: string;
  workspaceId: string;
  packId: PackId;
  generation: number;
  architecture: AgentArchitecture;
  parentId: string | null;
  createdAt: string;
};

export type RunRecord = {
  id: string;
  workspaceId: string;
  generationId: string;
  packId: PackId;
  metrics: Metrics;
  taxonomy: FailClass[];
  traces: Trace[];
  createdAt: string;
};

/** Strip injected memory block so mutate/store stay clean. */
function stripMemoryBlock(prompt: string): string {
  return prompt
    .replace(/\n\nLearned memory \(apply on this run\):[\s\S]*$/m, "")
    .trim();
}

function baselineArchitecture(packId: PackId, goal: string, tools: string): AgentArchitecture {
  const base = packId === "invoices" ? defaultInvoiceArchitecture() : defaultGroundsArchitecture();
  return {
    ...base,
    systemPrompt: `${base.systemPrompt}\n\nOperator goal: ${goal}\nAvailable tools: ${tools || base.toolPolicy}`,
  };
}

async function executePack(architecture: AgentArchitecture) {
  if (architecture.packId === "invoices") return runInvoicePack(architecture);
  return runGroundsPack(architecture);
}

function mapWorkspace(row: {
  id: string;
  name: string;
  email: string;
  goal: string;
  tools: string;
  eval_notes: string;
  pack_id: string;
  created_at: string;
  owner_id?: string | null;
}): Workspace {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    goal: row.goal,
    tools: row.tools,
    evalNotes: row.eval_notes,
    packId: row.pack_id as PackId,
    createdAt: row.created_at,
    ownerId: row.owner_id ?? null,
  };
}

export function createWorkspace(input: {
  goal: string;
  packId: PackId;
  tools?: string[] | string;
  name?: string;
  email?: string;
  evalNotes?: string;
  ownerId?: string | null;
}): Workspace {
  const tools = typeof input.tools === "string" ? input.tools : (input.tools ?? []).join(",");
  const row = {
    id: newId("ws"),
    name: input.name?.trim() || `${input.packId}-workspace`,
    email: input.email?.trim() || "operator@local",
    goal: input.goal,
    tools,
    eval_notes: input.evalNotes ?? "",
    pack_id: input.packId,
    created_at: nowIso(),
    owner_id: input.ownerId ?? null,
  };
  getDb()
    .prepare(
      `INSERT INTO workspaces (id, name, email, goal, tools, eval_notes, pack_id, created_at, owner_id)
       VALUES (@id, @name, @email, @goal, @tools, @eval_notes, @pack_id, @created_at, @owner_id)`,
    )
    .run(row);
  return mapWorkspace(row);
}

export function getWorkspace(id: string): Workspace | null {
  const row = getDb().prepare(`SELECT * FROM workspaces WHERE id = ?`).get(id) as
    | Parameters<typeof mapWorkspace>[0]
    | undefined;
  return row ? mapWorkspace(row) : null;
}

export function listWorkspaces(ownerId?: string): Workspace[] {
  const db = getDb();
  const rows = (
    ownerId
      ? db
          .prepare(
            `SELECT * FROM workspaces WHERE owner_id = ? ORDER BY created_at DESC`,
          )
          .all(ownerId)
      : db.prepare(`SELECT * FROM workspaces ORDER BY created_at DESC`).all()
  ) as Array<Parameters<typeof mapWorkspace>[0]>;
  return rows.map(mapWorkspace);
}

/** Throws if workspace missing or not owned by userId. */
export function requireOwnedWorkspace(workspaceId: string, userId: string): Workspace {
  const ws = getWorkspace(workspaceId);
  if (!ws) throw new Error(`Workspace not found: ${workspaceId}`);
  if (ws.ownerId !== userId) {
    throw new Error("Unauthorized: you do not own this workspace");
  }
  return ws;
}

function mapGeneration(row: {
  id: string;
  workspace_id: string;
  pack_id: string;
  generation: number;
  architecture_json: string;
  parent_id: string | null;
  created_at: string;
}): GenerationRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    packId: row.pack_id as PackId,
    generation: row.generation,
    architecture: AgentArchitectureSchema.parse(JSON.parse(row.architecture_json)),
    parentId: row.parent_id,
    createdAt: row.created_at,
  };
}

export function listGenerations(workspaceId?: string): GenerationRecord[] {
  const db = getDb();
  const rows = (
    workspaceId
      ? db
          .prepare(`SELECT * FROM generations WHERE workspace_id = ? ORDER BY generation ASC`)
          .all(workspaceId)
      : db.prepare(`SELECT * FROM generations ORDER BY created_at DESC LIMIT 50`).all()
  ) as Array<Parameters<typeof mapGeneration>[0]>;
  return rows.map(mapGeneration);
}

export function getGeneration(id: string): GenerationRecord | null {
  const row = getDb().prepare(`SELECT * FROM generations WHERE id = ?`).get(id) as
    Parameters<typeof mapGeneration>[0] | undefined;
  return row ? mapGeneration(row) : null;
}

function mapRun(row: {
  id: string;
  workspace_id: string;
  generation_id: string;
  pack_id: string;
  metrics_json: string;
  taxonomy_json: string;
  traces_json: string;
  created_at: string;
}): RunRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    generationId: row.generation_id,
    packId: row.pack_id as PackId,
    metrics: JSON.parse(row.metrics_json) as Metrics,
    taxonomy: JSON.parse(row.taxonomy_json) as FailClass[],
    traces: JSON.parse(row.traces_json) as Trace[],
    createdAt: row.created_at,
  };
}

export function listRuns(workspaceId?: string): RunRecord[] {
  const db = getDb();
  const rows = (
    workspaceId
      ? db
          .prepare(`SELECT * FROM runs WHERE workspace_id = ? ORDER BY created_at DESC`)
          .all(workspaceId)
      : db.prepare(`SELECT * FROM runs ORDER BY created_at DESC LIMIT 50`).all()
  ) as Array<Parameters<typeof mapRun>[0]>;
  return rows.map(mapRun);
}

export async function forgeOnce(workspaceId: string): Promise<{
  generation: GenerationRecord;
  run: RunRecord;
  report: ReportCard;
}> {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) throw new Error(`Workspace not found: ${workspaceId}`);

  const priorGens = listGenerations(workspaceId);
  const priorRuns = listRuns(workspaceId);
  const latestGen = priorGens[priorGens.length - 1];
  const beforeMetrics = priorRuns[0]?.metrics ?? null;

  let architecture: AgentArchitecture;
  let parentId: string | null = null;
  let generationNum = 1;

  if (!latestGen) {
    architecture = baselineArchitecture(workspace.packId, workspace.goal, workspace.tools);
  } else {
    parentId = latestGen.id;
    generationNum = latestGen.generation + 1;
    const latestRun = priorRuns.find((r) => r.generationId === latestGen.id) ?? priorRuns[0];
    // Mutate the clean parent architecture (memory is injected at eval time only).
    const parentClean: AgentArchitecture = {
      ...latestGen.architecture,
      systemPrompt: stripMemoryBlock(latestGen.architecture.systemPrompt),
    };
    architecture = await mutateArchitecture(
      parentClean,
      latestRun?.taxonomy ?? [],
      latestRun?.metrics ?? {
        accuracy: 0,
        reliability: 0,
        costUsd: 0,
        latencyMs: 0,
        cases: 0,
        passed: 0,
      },
    );
  }

  // Track-1: inject growing cross-run memory at eval time (do not bake into stored arch forever).
  const priorMemories = listMemories(workspaceId);
  const memoryBlock = formatMemoryBlock(priorMemories);
  const evalArchitecture: AgentArchitecture = memoryBlock
    ? {
        ...architecture,
        memoryPolicy: "cross_run_durable_memory",
        systemPrompt: `${stripMemoryBlock(architecture.systemPrompt)}\n\n${memoryBlock}`,
        notes: `${architecture.notes}|memories:${priorMemories.length}`,
      }
    : architecture;

  const generation: GenerationRecord = {
    id: newId("gen"),
    workspaceId,
    packId: workspace.packId,
    generation: generationNum,
    architecture,
    parentId,
    createdAt: nowIso(),
  };
  getDb()
    .prepare(
      `INSERT INTO generations (id, workspace_id, pack_id, generation, architecture_json, parent_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      generation.id,
      generation.workspaceId,
      generation.packId,
      generation.generation,
      JSON.stringify(generation.architecture),
      generation.parentId,
      generation.createdAt,
    );

  const { metrics, traces } = await executePack(evalArchitecture);
  const taxonomy = classifyFailures(traces);
  const run: RunRecord = {
    id: newId("run"),
    workspaceId,
    generationId: generation.id,
    packId: workspace.packId,
    metrics,
    taxonomy,
    traces,
    createdAt: nowIso(),
  };
  getDb()
    .prepare(
      `INSERT INTO runs (id, workspace_id, generation_id, pack_id, metrics_json, taxonomy_json, traces_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      run.id,
      run.workspaceId,
      run.generationId,
      run.packId,
      JSON.stringify(run.metrics),
      JSON.stringify(run.taxonomy),
      JSON.stringify(run.traces),
      run.createdAt,
    );

  const learning = await reflectAndRemember({
    workspaceId,
    runId: run.id,
    generation: generationNum,
    packId: workspace.packId,
    goal: workspace.goal,
    metrics,
    taxonomy,
    traces,
    priorMemoryCount: priorMemories.length,
  });

  const trajectory = listRuns(workspaceId)
    .slice()
    .reverse()
    .map((r, idx) => ({
      generation: listGenerations(workspaceId).find((g) => g.id === r.generationId)
        ?.generation ?? idx + 1,
      accuracy: r.metrics.accuracy,
      costUsd: r.metrics.costUsd,
      latencyMs: r.metrics.latencyMs,
    }));

  const allMemories = listMemories(workspaceId);
  const report: ReportCard = {
    before: beforeMetrics,
    after: metrics,
    delta: {
      accuracy: metrics.accuracy - (beforeMetrics?.accuracy ?? 0),
      reliability: metrics.reliability - (beforeMetrics?.reliability ?? 0),
      costUsd: metrics.costUsd - (beforeMetrics?.costUsd ?? 0),
      latencyMs: metrics.latencyMs - (beforeMetrics?.latencyMs ?? 0),
    },
    taxonomy,
    generation: generationNum,
    reflection: learning.reflection.reflection,
    memoriesAdded: learning.memoriesAdded.map((m) => ({
      id: m.id,
      kind: m.kind,
      content: m.content,
      generation: m.generation,
    })),
    memoryCount: allMemories.length,
    trajectory,
  };

  return { generation, run, report };
}

export function dashboardSummary(ownerId?: string) {
  const workspaces = listWorkspaces(ownerId);
  const ownedIds = new Set(workspaces.map((w) => w.id));
  const generations = (
    ownerId
      ? listGenerations().filter((g) => ownedIds.has(g.workspaceId))
      : listGenerations()
  );
  const runs = (
    ownerId ? listRuns().filter((r) => ownedIds.has(r.workspaceId)) : listRuns()
  );
  const latest = runs[0];
  const memoryCount = workspaces.reduce(
    (n, w) => n + listMemories(w.id).length,
    0,
  );
  const reflectionCount = workspaces.reduce(
    (n, w) => n + listReflections(w.id).length,
    0,
  );
  return {
    workspaceCount: workspaces.length,
    generationCount: generations.length,
    runCount: runs.length,
    memoryCount,
    reflectionCount,
    latestMetrics: latest?.metrics ?? null,
    latestTaxonomy: latest?.taxonomy ?? [],
    workspaces,
    generations: generations.slice(0, 20),
    runs: runs.slice(0, 20),
  };
}
