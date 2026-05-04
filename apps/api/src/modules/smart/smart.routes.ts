import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler.js";

const router = Router();

const integritySchema = z.object({
  entity: z.string().min(1),
  entityId: z.string().min(1),
  payloadHash: z.string().min(8)
});

const decisionSchema = z.object({
  patientId: z.string().min(1),
  age: z.number().int().nonnegative(),
  abnormalLabs: z.number().int().nonnegative(),
  priorAdmissions: z.number().int().nonnegative()
});

router.post(
  "/integrity-chain/anchor",
  asyncHandler(async (req, res) => {
    const input = integritySchema.parse(req.body);
    const anchor = crypto.createHash("sha256").update(`${input.entity}:${input.entityId}:${input.payloadHash}:${Date.now()}`).digest("hex");

    res.status(201).json({
      entity: input.entity,
      entityId: input.entityId,
      anchor,
      ledger: "his-permissioned-ledger",
      status: "anchored"
    });
  })
);

router.post(
  "/decision-support",
  asyncHandler(async (req, res) => {
    const input = decisionSchema.parse(req.body);
    const risk = Math.min(0.94, (input.age * 0.01 + input.abnormalLabs * 0.08 + input.priorAdmissions * 0.13) / 2.4);

    res.json({
      patientId: input.patientId,
      readmissionRisk: Number(risk.toFixed(3)),
      recommendations: ["Review discharge plan", "Check medication adherence", "Schedule follow-up within 7 days"],
      modelVersion: "clinical-assist-v1"
    });
  })
);

router.get(
  "/voice/intents",
  asyncHandler(async (_req, res) => {
    res.json({
      intents: [
        "open patient record",
        "create appointment",
        "dictate clinical note",
        "show abnormal labs",
        "start telemedicine consult"
      ]
    });
  })
);

export default router;

