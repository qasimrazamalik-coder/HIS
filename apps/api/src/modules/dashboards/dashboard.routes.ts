import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { dashboardRoleSchema, getDashboardSummary } from "./dashboard.service.js";

const router = Router();

router.get(
  "/:role",
  asyncHandler(async (req, res) => {
    const role = dashboardRoleSchema.parse(req.params.role);
    res.json(getDashboardSummary(role));
  })
);

export default router;

