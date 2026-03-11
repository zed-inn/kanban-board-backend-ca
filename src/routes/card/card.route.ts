import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { CardHandler } from "./card.handler";
import {
  CreateCardBodySchema,
  CreateCardParamsSchema,
  DeleteCardParamsSchema,
  GetCardsParamsSchema,
  GetCardsQuerySchema,
  GetCardsResponseSchema,
  UpdateCardBodyBodySchema,
  UpdateCardLocationBodySchema,
  UpdateCardParamsSchema,
} from "./card.schema";
import { GlobalResponseMessageSchema } from "@shared/schema/global-response.schema";
import { RestrictTo } from "@shared/hooks/restrict-to.hook";

export const CardRouter = async (router: ZodFastifyInstance) => {
  router.get(
    "/",
    {
      schema: {
        querystring: GetCardsQuerySchema,
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
        response: { 201: GlobalResponseMessageSchema },
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
        response: { 200: GlobalResponseMessageSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    CardHandler.updateCardBody,
  );

  router.patch(
    "/:id/location",
    {
      schema: {
        body: UpdateCardLocationBodySchema,
        params: UpdateCardParamsSchema,
        response: { 200: GlobalResponseMessageSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    CardHandler.updateCardLocation,
  );

  router.delete(
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
