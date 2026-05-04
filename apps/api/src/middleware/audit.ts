import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";

export const audit =
  (action: string, entity: string): RequestHandler =>
  (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode >= 400) return;
      const entityId = typeof req.params.id === "string" ? req.params.id : undefined;
      void prisma.auditLog.create({
        data: {
          actorId: req.user?.id,
          action,
          entity,
          entityId,
          ip: req.ip
        }
      });
    });
    next();
  };
