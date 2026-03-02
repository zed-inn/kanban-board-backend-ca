import db from "@config/db";
import app from "./app";
import { env } from "@config/env";

const startServer = async () => {
  try {
    await db.connect();
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

startServer();
