import fastify from "fastify";
import { env } from "./config/env";

const app = fastify({
  logger: env.NODE_ENV === "dev",
  trustProxy: env.NODE_ENV == "prod", // Behind Servers
});

export default app;
