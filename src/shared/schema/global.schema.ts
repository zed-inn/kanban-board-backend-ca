import { z } from "zod";

export const GlobalQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export type GlobalQueryDto = z.infer<typeof GlobalQuerySchema>;

export const GlobalResponseSchema = <T extends z.ZodRawShape>(data?: T) =>
  z.object({ message: z.string(), ...(data ? { data: z.object(data) } : {}) });

export type GlobalResponse<T extends unknown = void> = {
  message: string;
  data?: T;
};
