import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import { env } from "./env";

const app = fastify({
  logger: env.NODE_ENV === "dev",
  trustProxy: env.NODE_ENV == "prod", // Behind Servers
});

app.register(fastifyCookie);

export default app;
