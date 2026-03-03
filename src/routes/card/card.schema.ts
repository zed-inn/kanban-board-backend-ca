import { z } from "zod";
import { pgCardRepo } from "@interfaces/repo/card.repo";
import { pgColumnRepo } from "@interfaces/repo/column.repo";
import {
  GlobalQuerySchema,
  GlobalResponseSchema,
} from "@shared/schema/global.schema";

export const CardModel = pgCardRepo.model;
export const ColumnModel = pgColumnRepo.model;

export const CreateCardBodySchema = CardModel.pick({
  title: true,
  content: true,
});
export type CreateCardBody = z.infer<typeof CreateCardBodySchema>;

export const CreateCardParamsSchema = CardModel.pick({ columnId: true }).extend(
  ColumnModel.pick({ boardId: true }).shape,
);
export type CreateCardParams = z.infer<typeof CreateCardParamsSchema>;

export const UpdateCardBodyBodySchema = CardModel.pick({
  title: true,
  content: true,
});
export type UpdateCardBodyBody = z.infer<typeof UpdateCardBodyBodySchema>;

export const UpdateCardLocationBodySchema = CardModel.pick({ id: true });
export type UpdateCardLocationBody = z.infer<
  typeof UpdateCardLocationBodySchema
>;

export const UpdateCardParamsSchema = CardModel.pick({
  id: true,
  columnId: true,
}).extend(ColumnModel.pick({ boardId: true }).shape);
export type UpdateCardParams = z.infer<typeof UpdateCardParamsSchema>;

export const DeleteCardParamsSchema = CardModel.pick({
  id: true,
  columnId: true,
}).extend(ColumnModel.pick({ boardId: true }).shape);
export type DeleteCardParams = z.infer<typeof DeleteCardParamsSchema>;

export const GetCardsQuerySchema = GlobalQuerySchema.pick({ page: true });
export type GetCardsQuery = z.infer<typeof GetCardsQuerySchema>;

export const GetCardsParamsSchema = CardModel.pick({ columnId: true }).extend(
  ColumnModel.pick({ boardId: true }).shape,
);
export type GetCardsParams = z.infer<typeof GetCardsParamsSchema>;

export const GetCardsResponseSchema = GlobalResponseSchema({
  cards: z.array(CardModel),
});
export type GetCardsResponse = z.infer<typeof GetCardsResponseSchema>;
