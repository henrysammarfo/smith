import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb, newId, nowIso } from "../db/smith-db";
import { hashPassword, verifyPassword } from "./password.server";
import {
  createSession,
  destroyCurrentSession,
  getSessionUser,
  type SessionUser,
} from "./session.server";

export type AuthUser = SessionUser;

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(120),
});

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});

export const registerFn = createServerFn({ method: "POST" })
  .validator(registerSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const existing = getDb()
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .get(email) as { id: string } | undefined;
    if (existing) {
      throw new Error("An account with that email already exists");
    }

    const id = newId("user");
    const passwordHash = await hashPassword(data.password);
    const createdAt = nowIso();
    getDb()
      .prepare(
        `INSERT INTO users (id, email, name, password_hash, created_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(id, email, name, passwordHash, createdAt);

    createSession(id);
    return { id, email, name, createdAt } satisfies AuthUser;
  });

export const loginFn = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    const row = getDb()
      .prepare(
        `SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?`,
      )
      .get(email) as
      | {
          id: string;
          email: string;
          name: string;
          password_hash: string;
          created_at: string;
        }
      | undefined;

    if (!row || !(await verifyPassword(data.password, row.password_hash))) {
      throw new Error("Invalid email or password");
    }

    destroyCurrentSession();
    createSession(row.id);
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
    } satisfies AuthUser;
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(() => {
  destroyCurrentSession();
  return { ok: true as const };
});

export const meFn = createServerFn({ method: "GET" }).handler((): AuthUser | null => {
  return getSessionUser();
});
