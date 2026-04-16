import { randomBytes } from "crypto";
import type { Request, Response } from "express";

export interface AuthUser {
  id: string;
  phone: string;
  email: string;
  fullName: string;
  role: "admin" | "user";
}

interface Session {
  user: AuthUser;
  createdAt: Date;
}

const SESSION_COOKIE = "bmt_sid";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const store = new Map<string, Session>();

export function createSession(res: Response, user: AuthUser): string {
  const sid = randomBytes(32).toString("hex");
  store.set(sid, { user, createdAt: new Date() });
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
  return sid;
}

export function getSession(req: Request): AuthUser | null {
  const sid = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (!sid) return null;
  const session = store.get(sid);
  if (!session) return null;
  if (Date.now() - session.createdAt.getTime() > SESSION_TTL_MS) {
    store.delete(sid);
    return null;
  }
  return session.user;
}

export function destroySession(req: Request, res: Response): void {
  const sid = req.cookies?.[SESSION_COOKIE] as string | undefined;
  if (sid) store.delete(sid);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}
