import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("localhost"),
  NODE_ENV: z.enum(["dev", "prod", "test"]).default("dev"),
});

export const env = EnvSchema.parse(process.env);
