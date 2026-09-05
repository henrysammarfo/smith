import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { healLlmEndpoint } from "../llm/client";
import {
  createWorkspace,
  dashboardSummary,
  forgeOnce,
  getGeneration,
  getWorkspace,
  listGenerations,
  listRuns,
  listWorkspaces,
} from "./engine";

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
  .handler(({ data }) =>
    createWorkspace({
      goal: data.goal,
      packId: data.packId,
      tools: data.tools,
      name: data.name,
      email: data.email,
    }),
  );

export const listWorkspacesFn = createServerFn({ method: "GET" }).handler(() => listWorkspaces());

export const getWorkspaceFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => {
    const ws = getWorkspace(data.id);
    if (!ws) throw new Error(`Workspace not found: ${data.id}`);
    return ws;
  });

export const listGenerationsFn = createServerFn({ method: "GET" })
  .validator(z.object({ workspaceId: z.string().min(1) }))
  .handler(({ data }) => listGenerations(data.workspaceId));

export const getGenerationFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(({ data }) => {
    const gen = getGeneration(data.id);
    if (!gen) throw new Error(`Generation not found: ${data.id}`);
    return gen;
  });

export const listRunsFn = createServerFn({ method: "GET" })
  .validator(z.object({ workspaceId: z.string().optional() }).optional())
  .handler(({ data }) => listRuns(data?.workspaceId));

export const forgeOnceFn = createServerFn({ method: "POST" })
  .validator(z.object({ workspaceId: z.string().min(1) }))
  .handler(({ data }) => forgeOnce(data.workspaceId));

export const getDashboardFn = createServerFn({ method: "GET" }).handler(() => dashboardSummary());

/** Alias used by forge UI */
export const dashboardSummaryFn = getDashboardFn;

export const healLlmFn = createServerFn({ method: "POST" }).handler(() => healLlmEndpoint());
