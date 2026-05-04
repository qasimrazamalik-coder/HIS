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

const itemSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  quantityOnHand: z.number().int().nonnegative(),
  reorderPoint: z.number().int().nonnegative(),
  supplier: z.string().optional()
});

router.use(authenticate, requireRole(permissions.inventory));

router.post(
  "/items",
  audit("upsert", "inventory-item"),
  asyncHandler(async (req, res) => {
    const input = itemSchema.parse(req.body);
    const item = await prisma.inventoryItem.upsert({
      where: { sku: input.sku },
      update: input,
      create: input
    });
    if (item.quantityOnHand <= item.reorderPoint) {
      publishAlert({ type: "inventory.low_stock", severity: "warning", message: `${item.name} is at or below reorder point`, entityId: item.id });
    }
    res.status(201).json(item);
  })
);

router.get(
  "/items",
  asyncHandler(async (_req, res) => {
    res.json(await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } }));
  })
);

export default router;

