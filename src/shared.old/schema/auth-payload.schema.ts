import { z } from "zod";

export const AuthPayloadSchema = z.object({ id: z.uuidv7() });

export type AuthPayload = z.infer<typeof AuthPayloadSchema>;
