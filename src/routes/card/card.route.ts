import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { CardHandler } from "./card.handler";
import {
  CreateCardBodySchema,
  CreateCardParamsSchema,
  DeleteCardParamsSchema,
  GetCardsParamsSchema,
  GetCardsResponseSchema,
  UpdateCardBodyBodySchema,
  UpdateCardLocationBodySchema,
  UpdateCardParamsSchema,
} from "./card.schema";
import { GlobalResponseSchema } from "@shared/schema/global.schema";
import { RestrictTo } from "@shared/hook/restrict-access.hook";
import { GetBoardsQuerySchema } from "@routes/board/board.schema";

export const CardRouter = async (router: ZodFastifyInstance) => {
  router.get(
    "/",
    {
      schema: {
        querystring: GetBoardsQuerySchema,
        params: GetCardsParamsSchema,
        response: { 200: GetCardsResponseSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    CardHandler.getCardsInColumn,
  );

  router.post(
    "/",
    {
      schema: {
        body: CreateCardBodySchema,
        params: CreateCardParamsSchema,
        response: { 201: GlobalResponseSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    CardHandler.addCard,
  );

  router.patch(
    "/:id/body",
    {
      schema: {
        body: UpdateCardBodyBodySchema,
        params: UpdateCardParamsSchema,
        response: { 200: GlobalResponseSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    CardHandler.updateCardBody,
  );

  router.post(
    "/:id/location",
    {
      schema: {
        body: UpdateCardLocationBodySchema,
        params: UpdateCardParamsSchema,
        response: { 200: GlobalResponseSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    CardHandler.updateCardLocation,
  );

  router.post(
    "/:id",
    {
      schema: {
        params: DeleteCardParamsSchema,
        response: { 204: {} },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    CardHandler.deleteCard,
  );
};
