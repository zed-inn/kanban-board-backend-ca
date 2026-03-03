import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { BoardHandler } from "./board.handler";
import {
  CreateBoardBodySchema,
  DeleteBoardParamsSchema,
  UpdateBoardNameBodySchema,
  UpdateBoardOwnerBodySchema,
  UpdateBoardParamsSchema,
} from "./board.schema";
import { GlobalResponseSchema } from "@shared/schema/global.schema";

export const BoardRouter = async (router: ZodFastifyInstance) => {
  router.post(
    "/",
    {
      schema: {
        body: CreateBoardBodySchema,
        response: { 201: GlobalResponseSchema },
      },
    },
    BoardHandler.createBoard,
  );

  router.patch(
    "/:id",
    {
      schema: {
        body: UpdateBoardNameBodySchema,
        params: UpdateBoardParamsSchema,
        response: { 200: GlobalResponseSchema },
      },
    },
    BoardHandler.updateBoardName,
  );

  router.post(
    "/:id",
    {
      schema: {
        body: UpdateBoardOwnerBodySchema,
        params: UpdateBoardParamsSchema,
        response: { 200: GlobalResponseSchema },
      },
    },
    BoardHandler.updateBoardOwner,
  );

  router.delete(
    "/:id",
    {
      schema: {
        params: DeleteBoardParamsSchema,
        response: { 204: {} },
      },
    },
    BoardHandler.deleteBoard,
  );
};
