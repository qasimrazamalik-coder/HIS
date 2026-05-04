import { Router } from "express";
import { prisma } from "../../config/prisma.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { permissions } from "../../security/permissions.js";

const router = Router();

router.use(authenticate, requireRole(permissions.reporting));

router.get(
  "/hospital-performance",
  asyncHandler(async (_req, res) => {
    const [patients, appointments, openInvoices, inventoryItems] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({ where: { status: "SCHEDULED" } }),
      prisma.invoice.count({ where: { status: { in: ["SUBMITTED", "OVERDUE"] } } }),
      prisma.inventoryItem.findMany({ select: { quantityOnHand: true, reorderPoint: true } })
    ]);
    const lowStockItems = inventoryItems.filter((item) => item.quantityOnHand <= item.reorderPoint).length;

    res.json({ patients, scheduledAppointments: appointments, openInvoices, lowStockItems });
  })
);

export default router;
