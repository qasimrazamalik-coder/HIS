import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { permissions } from "../../security/permissions.js";

const router = Router();

const riskSchema = z.object({
  patientId: z.string().uuid(),
  age: z.number().int().nonnegative(),
  priorAdmissions: z.number().int().nonnegative(),
  comorbidityScore: z.number().nonnegative(),
  abnormalLabs: z.number().int().nonnegative()
});

router.use(authenticate, requireRole(permissions.reporting));

router.post(
  "/readmission-risk",
  asyncHandler(async (req, res) => {
    const input = riskSchema.parse(req.body);
    const response = await fetch(`${env.ML_SERVICE_URL}/predict/readmission-risk`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!response.ok) return res.status(502).json({ error: "Prediction service unavailable" });
    res.json(await response.json());
  })
);

export default router;

