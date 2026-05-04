import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { audit } from "../../middleware/audit.js";
import { permissions } from "../../security/permissions.js";

const router = Router();

const invoiceSchema = z.object({
  patientId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  insurer: z.string().optional(),
  claimRef: z.string().optional()
});

router.use(authenticate, requireRole(permissions.billing));

router.post(
  "/invoices",
  audit("create", "invoice"),
  asyncHandler(async (req, res) => {
    const input = invoiceSchema.parse(req.body);
    const invoice = await prisma.invoice.create({ data: input });
    res.status(201).json(invoice);
  })
);

router.get(
  "/invoices",
  asyncHandler(async (_req, res) => {
    const invoices = await prisma.invoice.findMany({ include: { patient: true, payments: true }, orderBy: { createdAt: "desc" } });
    res.json(invoices);
  })
);

export default router;

