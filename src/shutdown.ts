import { db } from "@config/db";
import app from "@config/fastify-app";
import { io } from "@config/io-server";

export const shutdown = async (signal: string) => {
  try {
    app.log.info(`${signal} received. Starting graceful shutdown...`);

    await io.close((err) => {
      if (err) app.log.error(err);
      else app.log.info("Socket closed.");
    });

    await db.close();
    app.log.info("Postgres closed.");

    await app.close();
    app.log.info("Fastify application closed.");

    app.log.info("Shutdown successfull.");
    process.exit(0);
  } catch (err) {
    console.log("Some error occured :", err);
    process.exit(1);
  }
};
