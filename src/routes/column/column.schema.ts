import { z } from "zod";
import {
  GlobalQuerySchema,
  GlobalResponseSchema,
} from "../../shared/schema/global.schema";
import { ColumnModel } from "@interfaces/repo/column.repository";

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

export const GetColumnQuerySchema = GlobalQuerySchema.pick({ page: true });
export type GetColumnQuery = z.infer<typeof GetColumnQuerySchema>;

export const GetColumnParamsSchema = ColumnModel.pick({
  boardId: true,
});
export type GetColumnParams = z.infer<typeof GetColumnParamsSchema>;

export const GetColumnResponseSchema = GlobalResponseSchema({
  columns: z.array(ColumnModel.omit({ createdAt: true, updatedAt: true })),
});
export type GetColumnResponse = z.infer<typeof GetColumnResponseSchema>;
