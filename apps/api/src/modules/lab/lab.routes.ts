import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { audit } from "../../middleware/audit.js";
import { permissions } from "../../security/permissions.js";
import { publishAlert } from "../../realtime/alerts.js";

const router = Router();

const orderSchema = z.object({
  patientId: z.string().uuid(),
  testCode: z.string().min(1)
});

const resultSchema = z.object({
  labOrderId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  value: z.string().min(1),
  unit: z.string().optional(),
  abnormal: z.boolean().default(false)
});

router.use(authenticate, requireRole(permissions.lab));

router.post(
  "/orders",
  audit("create", "lab-order"),
  asyncHandler(async (req, res) => {
    const input = orderSchema.parse(req.body);
    const order = await prisma.labOrder.create({ data: { ...input, orderedBy: req.user!.id } });
    res.status(201).json(order);
  })
);

router.post(
  "/results",
  audit("create", "lab-result"),
  asyncHandler(async (req, res) => {
    const input = resultSchema.parse(req.body);
    const result = await prisma.labResult.create({ data: input });
    await prisma.labOrder.update({ where: { id: input.labOrderId }, data: { status: "RESULTED" } });
    if (result.abnormal) {
      publishAlert({ type: "lab.abnormal_result", severity: "critical", message: "Abnormal lab result posted", entityId: result.id });
    }
    res.status(201).json(result);
  })
);

export default router;

