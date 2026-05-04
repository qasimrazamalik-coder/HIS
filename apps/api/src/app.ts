import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.js";
import authRoutes from "./modules/auth/auth.routes.js";
import patientRoutes from "./modules/patients/patient.routes.js";
import appointmentRoutes from "./modules/appointments/appointment.routes.js";
import emrRoutes from "./modules/emr/emr.routes.js";
import billingRoutes from "./modules/billing/billing.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import labRoutes from "./modules/lab/lab.routes.js";
import telemedicineRoutes from "./modules/telemedicine/telemedicine.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import dashboardRoutes from "./modules/dashboards/dashboard.routes.js";
import { graphqlHandler } from "./modules/graphql/graphql.routes.js";
import smartRoutes from "./modules/smart/smart.routes.js";
import enterpriseRoutes from "./modules/enterprise/enterprise.routes.js";

export function createApp() {
  const app = express();
  const origins = env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

  app.use(helmet());
  app.use(cors({ origin: origins, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit({ windowMs: 60_000, limit: 300 }));
  app.use(pinoHttp());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/patients", patientRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/emr", emrRoutes);
  app.use("/api/billing", billingRoutes);
  app.use("/api/inventory", inventoryRoutes);
  app.use("/api/lab", labRoutes);
  app.use("/api/telemedicine", telemedicineRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/dashboards", dashboardRoutes);
  app.use("/api/smart", smartRoutes);
  app.use("/api/enterprise", enterpriseRoutes);
  app.all("/graphql", graphqlHandler);
  app.use(errorHandler);

  return app;
}
