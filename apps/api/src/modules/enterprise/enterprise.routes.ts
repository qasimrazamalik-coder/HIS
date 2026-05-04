import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler.js";

const router = Router();

const offlineSyncSchema = z.object({
  deviceId: z.string().min(1),
  lastSyncToken: z.string().optional(),
  operations: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.enum(["create", "update", "delete"]),
        resource: z.string().min(1),
        payload: z.record(z.unknown())
      })
    )
    .default([])
});

router.get(
  "/bed-board",
  asyncHandler(async (_req, res) => {
    res.json({
      wards: [
        { name: "Emergency", totalBeds: 42, occupiedBeds: 35, isolationBeds: 4 },
        { name: "ICU", totalBeds: 18, occupiedBeds: 16, isolationBeds: 2 },
        { name: "Surgery", totalBeds: 36, occupiedBeds: 27, isolationBeds: 3 },
        { name: "Pediatrics", totalBeds: 28, occupiedBeds: 19, isolationBeds: 2 }
      ],
      updatedAt: new Date().toISOString()
    });
  })
);

router.get(
  "/fhir/patient/:id",
  asyncHandler(async (req, res) => {
    res.json({
      resourceType: "Patient",
      id: req.params.id,
      identifier: [{ system: "https://aster.example/mrn", value: `MRN-${req.params.id}` }],
      name: [{ text: "Amina Reyes", family: "Reyes", given: ["Amina"] }],
      telecom: [{ system: "phone", value: "+1-555-0100" }],
      meta: { profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"] }
    });
  })
);

router.get(
  "/collaboration/rooms",
  asyncHandler(async (_req, res) => {
    res.json({
      rooms: [
        { id: "rounds-icu", name: "ICU Rounds", participants: 7, priority: "critical" },
        { id: "pharmacy-review", name: "Pharmacy Review", participants: 3, priority: "normal" },
        { id: "discharge-board", name: "Discharge Board", participants: 5, priority: "high" }
      ]
    });
  })
);

router.post(
  "/offline/sync",
  asyncHandler(async (req, res) => {
    const input = offlineSyncSchema.parse(req.body);
    res.json({
      deviceId: input.deviceId,
      acceptedOperations: input.operations.map((operation) => operation.id),
      conflicts: [],
      syncToken: `sync-${Date.now()}`,
      serverTime: new Date().toISOString()
    });
  })
);

router.get(
  "/readiness",
  asyncHandler(async (_req, res) => {
    res.json({
      deployment: "rolling-update-ready",
      services: {
        api: "healthy",
        postgres: "managed-pitr-required",
        redis: "healthy",
        ml: "degraded-safe",
        websocket: "healthy"
      },
      complianceControls: ["rbac", "audit-log", "field-encryption", "fhir-adapter", "mfa-boundary"],
      scaling: { apiReplicas: 3, websocketReplicas: 2, hpaTargetCpu: 65 }
    });
  })
);

export default router;

