import { ID } from "@config/constants/db-schema";
import fastify from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: ID;
    };
  }
}
