import { z } from "zod";
import { PostgresColumnModel as ColumnModel } from "@postgres/repo/column.repository";
import { GlobalResponseSchemaWithData } from "@shared/schema/global-response.schema";

export const CreateColumnBodySchema = ColumnModel.pick({ name: true });
export type CreateColumnBody = z.infer<typeof CreateColumnBodySchema>;

export const CreateColumnParamsSchema = ColumnModel.pick({ boardId: true });
export type CreateColumnParams = z.infer<typeof CreateColumnParamsSchema>;

export const UpdateColumnNameBodySchema = ColumnModel.pick({ name: true });
export type UpdateColumnNameBody = z.infer<typeof UpdateColumnNameBodySchema>;

export const UpdateColumnPositionBodySchema = ColumnModel.pick({ id: true });
export type UpdateColumnPositionBody = z.infer<
  typeof UpdateColumnPositionBodySchema
>;

export const UpdateColumnParamsSchema = ColumnModel.pick({
  boardId: true,
  id: true,
});
export type UpdateColumnParams = z.infer<typeof UpdateColumnParamsSchema>;

export const DeleteColumnParamsSchema = ColumnModel.pick({
  boardId: true,
  id: true,
});
export type DeleteColumnParams = z.infer<typeof DeleteColumnParamsSchema>;

export const GetColumnQuerySchema = ColumnModel.pick({
  position: true,
}).partial();
export type GetColumnQuery = z.infer<typeof GetColumnQuerySchema>;

export const GetColumnParamsSchema = ColumnModel.pick({
  boardId: true,
});
export type GetColumnParams = z.infer<typeof GetColumnParamsSchema>;

export const GetColumnResponseSchema = GlobalResponseSchemaWithData({
  columns: z.array(ColumnModel),
  nextCursor: ColumnModel.shape.position,
});
export type GetColumnResponse = z.infer<typeof GetColumnResponseSchema>;
