import db from "./config.old/db";
import app from "./config.old/app";
import { env } from "./config.old/env";
import { initRepos } from "./shared.old/initializer/repo.initializer";
import { setupIo } from "./io-server";
import { AppRouter } from "./shared.old/router/app.router";

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
