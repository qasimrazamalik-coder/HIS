import { z } from "zod";

export const dashboardRoleSchema = z.enum(["admin", "patient", "employee"]);
export type DashboardRole = z.infer<typeof dashboardRoleSchema>;

export function getDashboardSummary(role: DashboardRole) {
  if (role === "patient") {
    return {
      role,
      metrics: { carePlan: "Active", upcomingAppointments: 3, newLabResults: 2, balanceCents: 18000 },
      notifications: ["Medication reminder due at 8 PM", "Cardiology follow-up confirmed"],
      analytics: { readmissionRisk: 0.18, adherenceScore: 0.91 }
    };
  }

  if (role === "employee") {
    return {
      role,
      metrics: { assignedTasks: 18, pendingLabs: 24, rounds: 12, lowSupplies: 11 },
      notifications: ["Room 310 handoff pending", "Abnormal CBC awaiting review"],
      analytics: { workloadIndex: 0.74, predictedDelayMinutes: 16 }
    };
  }

  return {
    role,
    metrics: { admissions: 148, staffUtilization: 0.87, revenueCents: 41_200_000, criticalAlerts: 9 },
    notifications: ["Readmission risk threshold crossed", "IV tubing below reorder point"],
    analytics: { occupancy: 0.82, readmissionRiskAverage: 0.31, cacheHitRate: 0.91 }
  };
}

