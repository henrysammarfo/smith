import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "../auth/session.server";
import { healLlmEndpoint } from "../llm/client";
import {
  createWorkspace,
  dashboardSummary,
  forgeOnce,
  getGeneration,
  listGenerations,
  listRuns,
  listWorkspaces,
  requireOwnedWorkspace,
} from "./engine";
import { listMemories, listReflections } from "./memory";

const packIdSchema = z.enum(["invoices", "grounds"]);

export const createWorkspaceFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      goal: z.string().min(1),
      packId: packIdSchema,
      tools: z.array(z.string()).default([]),
      name: z.string().optional(),
      email: z.string().optional(),
    }),
  )
  .handler(({ data }) => {
    const user = requireUser();
    return createWorkspace({
      goal: data.goal,
      packId: data.packId,
      tools: data.tools,
      ...(data.name ? { name: data.name } : {}),
      email: data.email ?? user.email,
      ownerId: user.id,
    });
  });

export const listWorkspacesFn = createServerFn({ method: "GET" }).handler(() => {
  const user = requireUser();
  return listWorkspaces(user.id);
});

export const getWorkspaceFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => {
    const user = requireUser();
    return requireOwnedWorkspace(data.id, user.id);
  });

export const listGenerationsFn = createServerFn({ method: "GET" })
  .validator(z.object({ workspaceId: z.string().min(1) }))
  .handler(({ data }) => {
    const user = requireUser();
    requireOwnedWorkspace(data.workspaceId, user.id);
    return listGenerations(data.workspaceId);
  });

export const getGenerationFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => {
    const user = requireUser();
    const gen = getGeneration(data.id);
    if (!gen) throw new Error(`Generation not found: ${data.id}`);
    requireOwnedWorkspace(gen.workspaceId, user.id);
    return gen;
  });

export const listRunsFn = createServerFn({ method: "GET" })
  .validator(z.object({ workspaceId: z.string().optional() }).optional())
  .handler(({ data }) => {
    const user = requireUser();
    if (data?.workspaceId) {
      requireOwnedWorkspace(data.workspaceId, user.id);
      return listRuns(data.workspaceId);
    }
    const owned = new Set(listWorkspaces(user.id).map((w) => w.id));
    return listRuns().filter((r) => owned.has(r.workspaceId));
  });

export const listLearningFn = createServerFn({ method: "GET" })
  .validator(z.object({ workspaceId: z.string().min(1) }))
  .handler(({ data }) => {
    const user = requireUser();
    requireOwnedWorkspace(data.workspaceId, user.id);
    return {
      memories: listMemories(data.workspaceId),
      reflections: listReflections(data.workspaceId),
    };
  });

export const forgeOnceFn = createServerFn({ method: "POST" })
  .validator(z.object({ workspaceId: z.string().min(1) }))
  .handler(({ data }) => {
    const user = requireUser();
    requireOwnedWorkspace(data.workspaceId, user.id);
    return forgeOnce(data.workspaceId);
  });

export const getDashboardFn = createServerFn({ method: "GET" }).handler(() => {
  const user = requireUser();
  return dashboardSummary(user.id);
});

/** Alias used by forge UI */
export const dashboardSummaryFn = getDashboardFn;

export const healLlmFn = createServerFn({ method: "POST" }).handler(() => {
  requireUser();
  return healLlmEndpoint();
});
