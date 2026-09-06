import { createHash, randomBytes } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { getDb, newId, nowIso } from "../db/smith-db";

export const SESSION_COOKIE = "smith_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sessionCookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env["NODE_ENV"] === "production",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export function createSession(userId: string): string {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const id = newId("sess");
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000).toISOString();

  getDb()
    .prepare(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(id, userId, tokenHash, expiresAt, createdAt);

  setCookie(SESSION_COOKIE, token, sessionCookieOpts());
  return token;
}

export function destroySession(token: string): void {
  const tokenHash = hashToken(token);
  getDb().prepare(`DELETE FROM sessions WHERE token_hash = ?`).run(tokenHash);
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export function getSessionUser(): SessionUser | null {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;

  const tokenHash = hashToken(token);
  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name, u.created_at AS created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(tokenHash, nowIso()) as
    | { id: string; email: string; name: string; created_at: string }
    | undefined;

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function requireUser(): SessionUser {
  const user = getSessionUser();
  if (!user) {
    throw new Error("Unauthorized: please log in");
  }
  return user;
}

/** Clear cookie + DB row for the current request cookie (if any). */
export function destroyCurrentSession(): void {
  const token = getCookie(SESSION_COOKIE);
  if (token) {
    destroySession(token);
    return;
  }
  deleteCookie(SESSION_COOKIE, { path: "/" });
}
