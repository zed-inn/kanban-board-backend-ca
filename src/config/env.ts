import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number("Server port is required").default(3000),
  HOST: z.string("Server host is required").default("localhost"),

  NODE_ENV: z
    .enum(["dev", "prod", "test"], "Node env should be defined")
    .default("dev"),

  PG_HOST: z.string("Postgresql host is required").min(1),
  PG_PORT: z.coerce.number("Postgresql port is required"),
  PG_USER: z.string("Postgresql user is required").min(1),
  PG_PASSWORD: z.string("Postgresql password is required"),
  PG_DATABASE: z.string("Postgresql database is required").min(1),

  JWT_SECRET: z.string("Jwt secret is required"),
});

export const env = EnvSchema.parse(process.env);
