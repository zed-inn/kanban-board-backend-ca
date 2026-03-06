import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import { env } from "./env";
import { authenticate } from "@shared/middlewares/fastify-authenticate.plugin";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

const app = fastify({
  logger: env.NODE_ENV === "dev",
  trustProxy: env.NODE_ENV == "prod", // Behind Servers
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.decorateRequest("user", undefined);

app.register(fastifyCookie);
app.register(authenticate);

export default app;
