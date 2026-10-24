import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { toNodeHandler } from "better-auth/node";
import router from "./routes";
import authDevRouter from "./routes/auth-dev";
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

const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const vercelOrigin = vercelHost ? `https://${vercelHost.replace(/^https?:\/\//, "")}` : null;
const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, "") : null;

// Allow credentials and configurable allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  ...(frontendUrl ? [frontendUrl] : []),
  ...(vercelOrigin ? [vercelOrigin] : []),
  ...((process.env.CORS_ORIGIN || "").split(",").map(o => o.trim()).filter(Boolean)),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    credentials: true,
  }),
);

// Dev Google Login Bridge (only mounted in non-production environments)
if (process.env.NODE_ENV !== "production") {
  app.use("/api/auth", authDevRouter);
}

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
