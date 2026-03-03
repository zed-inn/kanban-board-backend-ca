import { z } from "zod";

export const GlobalSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export type GlobalDto = z.infer<typeof GlobalSchema>;

export const GlobalResponseSchema = () => z.object({ message: z.string() });

export type GlobalResponse = { message: string };
