import { ZodFastifyInstance } from "@shared/types/zod-fastify";
import { BoardHandler, BoardMemberHandler } from "./board.handler";
import {
  AddMemberBodySchema,
  CreateBoardBodySchema,
  DeleteBoardParamsSchema,
  GetBoardsQuerySchema,
  GetBoardsResponseSchema,
  MemberParamsSchema,
  UpdateBoardNameBodySchema,
  UpdateBoardOwnerBodySchema,
  UpdateBoardParamsSchema,
} from "./board.schema";
import { RestrictTo } from "@shared/hooks/restrict-to.hook";
import { GlobalResponseMessageSchema } from "@shared/schema/global-response.schema";

export const BoardRouter = async (router: ZodFastifyInstance) => {
  router.get(
    "/",
    {
      schema: {
        querystring: GetBoardsQuerySchema,
        response: { 200: GetBoardsResponseSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    BoardHandler.getMemberBoards,
  );

  router.get(
    "/owned",
    {
      schema: {
        querystring: GetBoardsQuerySchema,
        response: { 200: GetBoardsResponseSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    BoardHandler.getOwnedBoards,
  );

  router.post(
    "/",
    {
      schema: {
        body: CreateBoardBodySchema,
        response: { 201: GlobalResponseMessageSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    BoardHandler.createBoard,
  );

  router.patch(
    "/:id/rename",
    {
      schema: {
        body: UpdateBoardNameBodySchema,
        params: UpdateBoardParamsSchema,
        response: { 200: GlobalResponseMessageSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
    },
    BoardHandler.updateBoardName,
  );

  router.patch(
    "/:id/change-owner",
    {
      schema: {
        body: UpdateBoardOwnerBodySchema,
        params: UpdateBoardParamsSchema,
        response: { 200: GlobalResponseMessageSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
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
      preHandler: [RestrictTo.loggedInUser],
    },
    BoardHandler.deleteBoard,
  );

  router.post(
    "/:id/member",
    {
      schema: {
        body: AddMemberBodySchema,
        params: MemberParamsSchema,
        response: { 201: GlobalResponseMessageSchema },
      },
      preHandler: [RestrictTo.loggedInUser],
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
      preHandler: [RestrictTo.loggedInUser],
    },
    BoardMemberHandler.removeMember,
  );
};
