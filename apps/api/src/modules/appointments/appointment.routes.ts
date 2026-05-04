import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { HttpError } from "../../lib/http-error.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { audit } from "../../middleware/audit.js";
import { permissions } from "../../security/permissions.js";

const router = Router();

const appointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  reason: z.string().optional()
});

router.use(authenticate, requireRole(permissions.appointment));

router.get(
  "/availability/:doctorId",
  asyncHandler(async (req, res) => {
    const doctorId = z.string().uuid().parse(req.params.doctorId);
    const day = z.coerce.date().parse(req.query.day ?? new Date());
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const appointments = await prisma.appointment.findMany({
      where: { doctorId, startsAt: { gte: start, lt: end }, status: "SCHEDULED" },
      orderBy: { startsAt: "asc" }
    });
    res.json({ doctorId, busy: appointments });
  })
);

router.post(
  "/",
  audit("schedule", "appointment"),
  asyncHandler(async (req, res) => {
    const input = appointmentSchema.parse(req.body);
    if (input.endsAt <= input.startsAt) throw new HttpError(400, "Appointment end must be after start");
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: input.doctorId,
        status: "SCHEDULED",
        startsAt: { lt: input.endsAt },
        endsAt: { gt: input.startsAt }
      }
    });
    if (conflict) throw new HttpError(409, "Doctor is unavailable for that time");
    const appointment = await prisma.appointment.create({ data: input });
    res.status(201).json(appointment);
  })
);

export default router;
