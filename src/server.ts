import { env } from "@config/env";
import app from "@config/fastify-app";
import { setupIo } from "./io-server";
import { db } from "@config/db";
import { initRepo } from "./repo.init";
import { AppRouter } from "./app.routes";

const startServer = async () => {
  try {
    setupIo();

    await db.connect();
    initRepo();

    app.register(AppRouter);
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

startServer();
