import { createHandler } from "graphql-http/lib/use/express";
import { buildSchema } from "graphql";
import { dashboardRoleSchema, getDashboardSummary } from "../dashboards/dashboard.service.js";

const schema = buildSchema(`
  type Metrics {
    admissions: Int
    staffUtilization: Float
    revenueCents: Int
    criticalAlerts: Int
    carePlan: String
    upcomingAppointments: Int
    newLabResults: Int
    balanceCents: Int
    assignedTasks: Int
    pendingLabs: Int
    rounds: Int
    lowSupplies: Int
  }

  type Analytics {
    occupancy: Float
    readmissionRiskAverage: Float
    cacheHitRate: Float
    readmissionRisk: Float
    adherenceScore: Float
    workloadIndex: Float
    predictedDelayMinutes: Int
  }

  type DashboardSummary {
    role: String!
    metrics: Metrics!
    notifications: [String!]!
    analytics: Analytics!
  }

  type Query {
    dashboard(role: String!): DashboardSummary!
  }
`);

export const graphqlHandler = createHandler({
  schema,
  rootValue: {
    dashboard: ({ role }: { role: string }) => getDashboardSummary(dashboardRoleSchema.parse(role))
  }
});
