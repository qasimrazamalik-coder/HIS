import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url().default("postgresql://his:his_password@localhost:5432/his"),
  JWT_SECRET: z.string().min(32).default("development-only-jwt-secret-change-me"),
  FIELD_ENCRYPTION_KEY: z.string().min(16).default("development-only-field-key-change-me"),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  ML_SERVICE_URL: z.string().url().default("http://localhost:8000")
});

export const env = envSchema.parse(process.env);
