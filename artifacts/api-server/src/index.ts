import "./env";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

const handleShutdown = (signal: string) => {
  logger.info({ signal }, "Graceful shutdown initiated");
  server.close((err) => {
    if (err) {
      logger.error({ err }, "Error during HTTP server shutdown");
      process.exit(1);
    }
    logger.info("HTTP server closed cleanly");
    process.exit(0);
  });

  // Force shutdown if connections do not close in 10s
  setTimeout(() => {
    logger.error("Forced process termination after shutdown timeout");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

export default app;
