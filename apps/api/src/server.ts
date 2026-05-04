import http from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { attachAlertServer } from "./realtime/alerts.js";

const app = createApp();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: env.ALLOWED_ORIGINS.split(","), credentials: true }
});

io.on("connection", (socket) => {
  socket.join("clinical-alerts");
});

attachAlertServer(io);

httpServer.listen(env.PORT, () => {
  console.log(`HIS API listening on ${env.PORT}`);
});

