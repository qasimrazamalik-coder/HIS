import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  const status = typeof err.status === "number" ? err.status : 500;
  const message = status >= 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
};

