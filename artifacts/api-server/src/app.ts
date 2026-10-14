import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { toNodeHandler } from "better-auth/node";
import router from "./routes";
import { logger } from "./lib/logger";
import { auth } from "./lib/auth";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Allow credentials and configurable allowed origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to permissive for dev preview
    },
    credentials: true,
  }),
);

import authDevRouter from "./routes/auth-dev";

// Dev Google Login Bridge (mounted before Better Auth catch-all)
app.use("/api/auth", authDevRouter);

// Better Auth catch-all handler for /api/auth/* (must be mounted before express.json parsing)
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Domain API routes
app.use("/api", router);

// Centralized error handler (Backend standard)
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error({ err, path: req.path, method: req.method }, "Request error");
  if (res.headersSent) return;

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: statusCode === 500 ? "Internal server error" : err.message,
    },
  });
};

app.use(errorHandler);

export default app;
