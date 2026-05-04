import type { Role } from "@prisma/client";
import type { RequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";

export const requireRole =
  (roles: readonly Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, "Insufficient privileges"));
    }
    next();
  };

