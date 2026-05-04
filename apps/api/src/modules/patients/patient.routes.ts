import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { encryptField, decryptField } from "../../lib/crypto.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { audit } from "../../middleware/audit.js";
import { permissions } from "../../security/permissions.js";

const router = Router();

const patientSchema = z.object({
  mrn: z.string().min(3),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.coerce.date(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  medicalHistory: z.string().optional()
});

router.use(authenticate, requireRole(permissions.patient));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = String(req.query.search ?? "");
    const patients = await prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { mrn: { contains: search, mode: "insensitive" } },
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } }
            ]
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
      take: 50
    });
    res.json(patients.map(({ encryptedHistory, encryptedHistoryNonce, ...patient }) => patient));
  })
);

router.post(
  "/",
  audit("create", "patient"),
  asyncHandler(async (req, res) => {
    const input = patientSchema.parse(req.body);
    const encrypted = input.medicalHistory ? encryptField(input.medicalHistory) : undefined;
    const patient = await prisma.patient.create({
      data: {
        mrn: input.mrn,
        firstName: input.firstName,
        lastName: input.lastName,
        dateOfBirth: input.dateOfBirth,
        phone: input.phone,
        email: input.email,
        encryptedHistory: encrypted?.value,
        encryptedHistoryNonce: encrypted?.nonce
      }
    });
    res.status(201).json(patient);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = z.string().uuid().parse(req.params.id);
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { encounters: true, labOrders: { include: { results: true } }, appointments: true }
    });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json({ ...patient, medicalHistory: decryptField(patient.encryptedHistory, patient.encryptedHistoryNonce) });
  })
);

export default router;
