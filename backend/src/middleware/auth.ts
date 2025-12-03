import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const SECRET = process.env.JWT_SECRET || "fallback_secret";

export function signToken(userId: string) {
  return jwt.sign({ userId }, SECRET, { expiresIn: "30d" });
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Missing token" });

  const [, token] = header.split(" ");
  try {
    const payload = jwt.verify(token, SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
