import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { CardHandler } from "./card.handler";
import {
  CreateCardBodySchema,
  CreateCardParamsSchema,
  DeleteCardParamsSchema,
  UpdateCardBodyBodySchema,
  UpdateCardLocationBodySchema,
  UpdateCardParamsSchema,
} from "./card.schema";
import { GlobalResponseSchema } from "@shared/schema/global.schema";

export const CardRouter = async (router: ZodFastifyInstance) => {
  router.post(
    "/",
    {
      schema: {
        body: CreateCardBodySchema,
        params: CreateCardParamsSchema,
        response: { 201: GlobalResponseSchema },
      },
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
    },
    CardHandler.deleteCard,
  );
};
