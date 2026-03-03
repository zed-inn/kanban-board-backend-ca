import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { BoardHandler, BoardMemberHandler } from "./board.handler";
import {
  AddMemberBodySchema,
  CreateBoardBodySchema,
  DeleteBoardParamsSchema,
  MemberParamsSchema,
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
    "/:id/rename",
    {
      schema: {
        body: UpdateBoardNameBodySchema,
        params: UpdateBoardParamsSchema,
        response: { 200: GlobalResponseSchema },
      },
    },
    BoardHandler.updateBoardName,
  );

  router.patch(
    "/:id/change-owner",
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

  router.post(
    "/:id/member",
    {
      schema: {
        body: AddMemberBodySchema,
        params: MemberParamsSchema,
        response: { 201: GlobalResponseSchema },
      },
    },
    BoardMemberHandler.addMember,
  );

  router.delete(
    "/:id/member",
    {
      schema: {
        params: MemberParamsSchema,
        response: { 204: {} },
      },
    },
    BoardMemberHandler.removeMember,
  );
};
