import crypto from "node:crypto";
import { env } from "../config/env.js";

const key = crypto.createHash("sha256").update(env.FIELD_ENCRYPTION_KEY).digest();

export function encryptField(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    value: Buffer.concat([encrypted, tag]).toString("base64"),
    nonce: iv.toString("base64")
  };
}

export function decryptField(value?: string | null, nonce?: string | null) {
  if (!value || !nonce) return null;
  const payload = Buffer.from(value, "base64");
  const encrypted = payload.subarray(0, -16);
  const tag = payload.subarray(-16);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(nonce, "base64"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

