import { z } from "zod";
import { PostgresCardModel as CardModel } from "@postgres/repo/card.repository";
import { PostgresColumnModel as ColumnModel } from "@postgres/repo/column.repository";
import { GlobalResponseSchemaWithData } from "@shared/schema/global-response.schema";

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
}).partial();
export type UpdateCardBodyBody = z.infer<typeof UpdateCardBodyBodySchema>;

export const UpdateCardLocationBodySchema = CardModel.pick({
  id: true,
  columnId: true,
}).partial();
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

export const GetCardsQuerySchema = CardModel.pick({ position: true }).partial();
export type GetCardsQuery = z.infer<typeof GetCardsQuerySchema>;

export const GetCardsParamsSchema = CardModel.pick({ columnId: true }).extend(
  ColumnModel.pick({ boardId: true }).shape,
);
export type GetCardsParams = z.infer<typeof GetCardsParamsSchema>;

export const GetCardsResponseSchema = GlobalResponseSchemaWithData({
  cards: z.array(CardModel),
  nextCursor: CardModel.shape.position,
});
export type GetCardsResponse = z.infer<typeof GetCardsResponseSchema>;
