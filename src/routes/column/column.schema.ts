import { z } from "zod";
import { pgColumnRepo } from "@interfaces/repo/column.repo";

export const ColumnModel = pgColumnRepo.model;

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
