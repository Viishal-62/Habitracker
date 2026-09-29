import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
import { User, type UserDoc } from "./models/User.js";

export type AuthedRequest = Request & { user?: UserDoc };

type TokenPayload = { sub: string };

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies TokenPayload, env.jwtSecret, {
    expiresIn: "30d",
  });
}

function readBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

async function userFromToken(token: string): Promise<UserDoc | null> {
  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    if (!payload.sub) return null;
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}

export async function optionalAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = readBearer(req);
  if (token) {
    const user = await userFromToken(token);
    if (user) req.user = user;
  }
  next();
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = readBearer(req);
  if (!token) {
    res.status(401).json({ error: "Sign in first" });
    return;
  }
  const user = await userFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Session expired" });
    return;
  }
  req.user = user;
  next();
}
