import { z } from "zod";

export const GlobalResponseSchemaWithData = <T extends z.ZodRawShape>(
  data: T,
) => z.object({ message: z.string(), data: z.object({ ...data }) });

export const GlobalResponseMessageSchema = z.object({
  message: z.string(),
});

export type GlobalResponseMessage = z.infer<typeof GlobalResponseMessageSchema>;
