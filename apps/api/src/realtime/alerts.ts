import type { Server } from "socket.io";

let io: Server | undefined;

export function attachAlertServer(server: Server) {
  io = server;
}

export function publishAlert(payload: { type: string; severity: "info" | "warning" | "critical"; message: string; entityId?: string }) {
  io?.to("clinical-alerts").emit("alert", { ...payload, createdAt: new Date().toISOString() });
}

