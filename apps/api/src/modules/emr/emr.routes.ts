import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { audit } from "../../middleware/audit.js";
import { permissions } from "../../security/permissions.js";

const router = Router();

const encounterSchema = z.object({
  patientId: z.string().uuid(),
  diagnosis: z.string().min(1),
  notes: z.string().min(1),
  prescription: z.string().optional()
});

router.use(authenticate, requireRole(permissions.emr));

router.post(
  "/encounters",
  audit("create", "encounter"),
  asyncHandler(async (req, res) => {
    const input = encounterSchema.parse(req.body);
    const encounter = await prisma.encounter.create({
      data: { ...input, clinicianId: req.user!.id }
    });
    res.status(201).json(encounter);
  })
);

router.get(
  "/patients/:patientId/timeline",
  asyncHandler(async (req, res) => {
    const patientId = z.string().uuid().parse(req.params.patientId);
    const encounters = await prisma.encounter.findMany({
      where: { patientId },
      include: { labResults: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(encounters);
  })
);

export default router;
