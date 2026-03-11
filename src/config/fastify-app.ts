import fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import { env } from "./env";
import { authenticate } from "@shared/middlewares/authenticate-fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { globalErrorHandler } from "@shared/middlewares/global-error-handler";

const app = fastify({
  logger: env.NODE_ENV === "dev",
  trustProxy: env.NODE_ENV == "prod", // Behind Servers
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.decorateRequest("user", undefined);

app.setErrorHandler(globalErrorHandler);

app.register(fastifyCookie);
app.register(authenticate);

export default app;
