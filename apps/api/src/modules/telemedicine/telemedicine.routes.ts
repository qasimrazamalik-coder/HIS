import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { permissions } from "../../security/permissions.js";

const router = Router();

const sessionSchema = z.object({
  patientId: z.string().uuid(),
  clinicianId: z.string().uuid(),
  visitUrl: z.string().url(),
  startsAt: z.coerce.date()
});

router.use(authenticate, requireRole(permissions.telemedicine));

router.post(
  "/sessions",
  asyncHandler(async (req, res) => {
    const input = sessionSchema.parse(req.body);
    const session = await prisma.telemedicineSession.create({ data: input });
    res.status(201).json(session);
  })
);

export default router;

