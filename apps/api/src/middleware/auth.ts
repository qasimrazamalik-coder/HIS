import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http-error.js";

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return next(new HttpError(401, "Authentication required"));

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as Express.Request["user"];
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
};

