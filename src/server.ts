import { db } from "@config/db";
import { env } from "./config/env";
import app from "./config/fastify-app";
import { setupIo } from "./io-server.setup";
import { AppRouter } from "@routes/app.routes";
import { shutdown } from "./shutdown";

const startServer = async () => {
  try {
    setupIo();
    await db.connect();
    app.register(AppRouter);

    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown server
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGUSR2", async () => {
  await shutdown("SIGUSR2");
  process.kill(process.pid, "SIGUSR2");
});

process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err);
  shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err);
  process.exit(1);
});
