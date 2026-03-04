import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import { env } from "./env";
import { authenticate } from "../shared.old/plugin/authenticate.plugin";

const app = fastify({
  logger: env.NODE_ENV === "dev",
  trustProxy: env.NODE_ENV == "prod", // Behind Servers
});

app.register(fastifyCookie);
app.register(authenticate);

export default app;
