import { Role } from "@prisma/client";

export const permissions = {
  patient: [Role.ADMIN, Role.DOCTOR, Role.NURSE],
  appointment: [Role.ADMIN, Role.DOCTOR, Role.NURSE],
  emr: [Role.ADMIN, Role.DOCTOR, Role.NURSE],
  billing: [Role.ADMIN, Role.BILLING],
  inventory: [Role.ADMIN, Role.INVENTORY_MANAGER],
  lab: [Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.LAB_TECH],
  reporting: [Role.ADMIN, Role.DOCTOR],
  telemedicine: [Role.ADMIN, Role.DOCTOR, Role.NURSE, Role.PATIENT],
  admin: [Role.ADMIN]
} as const;

