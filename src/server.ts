import db from "@config/db";
import app from "@config/app";
import { env } from "@config/env";
import { initRepos } from "@shared/initializer/repo.initializer";
import { setupIo } from "./io-server";
import { AppRouter } from "@shared/router/app.router";

const startServer = async () => {
  try {
    setupIo();

    await db.connect();
    await initRepos();

    app.register(AppRouter);
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

startServer();
